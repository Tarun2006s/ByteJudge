const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const TEMP_DIR = path.join(__dirname, '..', 'temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * Runs code with input against a timeout
 * @param {string} language - 'javascript' or 'python'
 * @param {string} code - User's code
 * @param {string} input - Stdin input
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise<{success: boolean, stdout: string, stderr: string, errorType?: string}>}
 */
const runSingle = (language, code, input, timeoutMs = 2000) => {
    return new Promise((resolve) => {
        const fileId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        let extension;
        if (language === 'javascript') extension = 'js';
        else if (language === 'python') extension = 'py';
        else if (language === 'cpp') extension = 'cpp';
        const fileName = `${fileId}.${extension}`;
        const filePath = path.join(TEMP_DIR, fileName);

        // Write user code to temporary file
        fs.writeFileSync(filePath, code);

        if (language === 'cpp') {
            return runCpp(filePath, input, timeoutMs)
                .then(resolve);
        }

        let cmd = 'node';
        let args = [filePath];

        if (language === 'python') {
            cmd = process.platform === 'win32' ? 'python' : 'python3';
            args = [filePath];
        }

        const child = spawn(cmd, args);

        let stdout = '';
        let stderr = '';
        let isKilled = false;

        const timeout = setTimeout(() => {
            isKilled = true;
            try {
                child.kill();
            } catch (e) {
                // ignore
            }
            // Cleanup file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            resolve({
                success: false,
                stdout: '',
                stderr: `Time Limit Exceeded (Timeout of ${timeoutMs}ms reached)`,
                errorType: 'Time Limit Exceeded'
            });
        }, timeoutMs);

        // Feed input to stdin
        if (input) {
            try {
                child.stdin.write(input);
                child.stdin.end();
            } catch (err) {
                // Ignore stdin write error
            }
        } else {
            child.stdin.end();
        }

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('error', (err) => {
            if (isKilled) return;
            clearTimeout(timeout);
            
            // Cleanup file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // Fallback for python on windows (try 'py' if 'python' throws ENOENT)
            if (language === 'python' && err.code === 'ENOENT' && cmd === 'python') {
                resolve(runSingleFallback('py', filePath, input, timeoutMs));
                return;
            }

            resolve({
                success: false,
                stdout: '',
                stderr: `Failed to execute: ${err.message}. Make sure standard node/python CLI is installed.`,
                errorType: 'Compilation/Runtime Error'
            });
        });

        child.on('close', (code) => {
            if (isKilled) return;
            clearTimeout(timeout);
            
            // Cleanup file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            if (code === 0) {
                resolve({
                    success: true,
                    stdout: stdout,
                    stderr: stderr
                });
            } else {
                resolve({
                    success: false,
                    stdout: stdout,
                    stderr: stderr || `Process exited with code ${code}`,
                    errorType: 'Runtime Error'
                });
            }
        });
    });
};

// helper function for c++
const runCpp = (sourcePath, input, timeoutMs) => {
    return new Promise((resolve) => {
        const exePath = process.platform === 'win32'
            ? sourcePath.replace('.cpp', '.exe')
            : sourcePath.replace('.cpp', '.out');

        const compile = spawn('g++', [
            sourcePath,
            '-std=c++17',
            '-O2',
            '-o',
            exePath
        ]);

        let compileError = '';

        compile.stderr.on('data', (data) => {
            compileError += data.toString();
        });

        compile.on('error', (err) => {
            resolve({
                success: false,
                stdout: '',
                stderr: `g++ not found: ${err.message}`,
                errorType: 'Compilation Error'
            });
        });

        compile.on('close', (code) => {
            if (code !== 0) {
                if (fs.existsSync(sourcePath))
                    fs.unlinkSync(sourcePath);

                resolve({
                    success: false,
                    stdout: '',
                    stderr: compileError,
                    errorType: 'Compilation Error'
                });
                return;
            }

            const child = spawn(exePath);

            let stdout = '';
            let stderr = '';
            let killed = false;

            const timeout = setTimeout(() => {
                killed = true;

                try {
                    child.kill();
                } catch {}

                if (fs.existsSync(sourcePath))
                    fs.unlinkSync(sourcePath);

                if (fs.existsSync(exePath))
                    fs.unlinkSync(exePath);

                resolve({
                    success: false,
                    stdout: '',
                    stderr: `Time Limit Exceeded (${timeoutMs}ms)`,
                    errorType: 'Time Limit Exceeded'
                });
            }, timeoutMs);

            if (input) {
                child.stdin.write(input);
            }

            child.stdin.end();

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (exitCode) => {
                if (killed) return;

                clearTimeout(timeout);

                if (fs.existsSync(sourcePath))
                    fs.unlinkSync(sourcePath);

                if (fs.existsSync(exePath))
                    fs.unlinkSync(exePath);

                resolve({
                    success: exitCode === 0,
                    stdout,
                    stderr,
                    errorType: exitCode === 0
                        ? undefined
                        : 'Runtime Error'
                });
            });
        });
    });
};

// Helper for fallback command (e.g. 'py' instead of 'python')
const runSingleFallback = (cmd, filePath, input, timeoutMs) => {
    return new Promise((resolve) => {
        const child = spawn(cmd, [filePath]);
        let stdout = '';
        let stderr = '';
        let isKilled = false;

        const timeout = setTimeout(() => {
            isKilled = true;
            try { child.kill(); } catch (e) {}
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            resolve({
                success: false,
                stdout: '',
                stderr: `Time Limit Exceeded (Timeout of ${timeoutMs}ms reached)`,
                errorType: 'Time Limit Exceeded'
            });
        }, timeoutMs);

        if (input) {
            try {
                child.stdin.write(input);
                child.stdin.end();
            } catch (err) {}
        } else {
            child.stdin.end();
        }

        child.stdout.on('data', (data) => { stdout += data.toString(); });
        child.stderr.on('data', (data) => { stderr += data.toString(); });

        child.on('error', (err) => {
            if (isKilled) return;
            clearTimeout(timeout);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            resolve({
                success: false,
                stdout: '',
                stderr: `Failed to execute script. Ensure language runtime (Python/Node) is installed. Error: ${err.message}`,
                errorType: 'Compilation/Runtime Error'
            });
        });

        child.on('close', (code) => {
            if (isKilled) return;
            clearTimeout(timeout);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (code === 0) {
                resolve({ success: true, stdout, stderr });
            } else {
                resolve({
                    success: false,
                    stdout,
                    stderr: stderr || `Process exited with code ${code}`,
                    errorType: 'Runtime Error'
                });
            }
        });
    });
};

module.exports = { runSingle };
