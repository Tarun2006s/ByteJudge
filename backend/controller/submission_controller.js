const Problem = require('../model/problem');
const Submission = require('../model/submission');
const { runSingle } = require('../utilis_helpers/code_runner');

const cleanOutput = (str) => {
    if (!str) return '';
    return str
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .trim();
};

const compareOutputs = (out1, out2) => {
    return cleanOutput(out1) === cleanOutput(out2);
};

// Run code against sample test case
const runCode = async (req, res) => {
    try {
        const { language, code } = req.body;
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (!language || !code) {
            return res.status(400).json({ message: "Language and code are required" });
        }

        const runResult = await runSingle(language, code, problem.sampleInput);

        const passed = runResult.success && compareOutputs(runResult.stdout, problem.sampleOutput);

        res.status(200).json({
            success: runResult.success,
            passed,
            stdout: runResult.stdout,
            stderr: runResult.stderr,
            errorType: runResult.errorType,
            sampleInput: problem.sampleInput,
            expectedOutput: problem.sampleOutput
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during run", error: error.message });
    }
};

// Submit code against all test cases
const submitCode = async (req, res) => {
    try {
        const { language, code } = req.body;
        const problem = await Problem.findById(req.params.id);

        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (!language || !code) {
            return res.status(400).json({ message: "Language and code are required" });
        }

        const testCases = problem.testCases;
        if (!testCases || testCases.length === 0) {
            return res.status(400).json({ message: "This problem has no test cases configured." });
        }

        const testResults = [];
        let finalStatus = 'Accepted';
        let firstErrorMessage = '';

        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const runResult = await runSingle(language, code, tc.input);

            let passed = false;
            let currentStatus = 'Accepted';

            if (!runResult.success) {
                passed = false;
                currentStatus = runResult.errorType || 'Runtime Error';
                if (!firstErrorMessage) {
                    firstErrorMessage = runResult.stderr;
                }
            } else {
                passed = compareOutputs(runResult.stdout, tc.output);
                if (!passed) {
                    currentStatus = 'Wrong Answer';
                }
            }

            testResults.push({
                testCaseIndex: i,
                passed,
                input: tc.input,
                expectedOutput: tc.output,
                actualOutput: runResult.stdout,
                errorMessage: runResult.stderr || ''
            });

            if (currentStatus !== 'Accepted' && finalStatus === 'Accepted') {
                finalStatus = currentStatus;
            }
        }

        const submission = await Submission.create({
            problem: problem._id,
            user: req.user.id,
            language,
            code,
            status: finalStatus,
            errorMessage: firstErrorMessage,
            testResults
        });

        // Populate submission details for response
        const populatedSubmission = await Submission.findById(submission._id)
            .populate('problem', 'title difficulty')
            .populate('user', 'firstName lastName email');

        res.status(201).json({
            message: "Submission evaluated",
            submission: populatedSubmission
        });
    } catch (error) {
        res.status(500).json({ message: "Server error during submission", error: error.message });
    }
};

// Get submissions list
const getSubmissions = async (req, res) => {
    try {
        const query = {};
        if (req.query.problemId) {
            query.problem = req.query.problemId;
        }
        if (req.query.userId) {
            query.user = req.query.userId;
        }

        const submissions = await Submission.find(query)
            .populate('problem', 'title difficulty')
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({ submissions });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get single submission
const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('problem', 'title description difficulty inputFormat outputFormat constraints sampleInput sampleOutput')
            .populate('user', 'firstName lastName email');

        if (!submission) {
            return res.status(404).json({ message: "Submission not found" });
        }

        res.status(200).json({ submission });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    runCode,
    submitCode,
    getSubmissions,
    getSubmissionById
};
