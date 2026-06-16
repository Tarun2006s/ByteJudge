const Problem = require('../model/problem');

// Create a problem
const createProblem = async (req, res) => {
    try {
        const { title, description, difficulty, inputFormat, outputFormat, constraints, sampleInput, sampleOutput, testCases } = req.body;

        if (!title || !description || !inputFormat || !outputFormat || !sampleInput || !sampleOutput) {
            return res.status(400).json({ message: "Required fields are missing" });
        }

        // testCases should be parsed/validated
        if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
            return res.status(400).json({ message: "At least one testcase is required" });
        }

        const problem = await Problem.create({
            title,
            description,
            difficulty,
            inputFormat,
            outputFormat,
            constraints,
            sampleInput,
            sampleOutput,
            testCases,
            creator: req.user.id
        });

        res.status(201).json({ message: "Problem created successfully", problem });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get all problems (without test cases for security)
const getProblems = async (req, res) => {
    try {
        const problems = await Problem.find().select('-testCases').populate('creator', 'firstName lastName email');
        res.status(200).json({ problems });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get problem details (without test cases for security)
const getProblemById = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id).populate('creator', 'firstName lastName email');
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }
        
        // Exclude test cases from response unless requester is creator
        const problemData = problem.toObject();
        if (req.user && req.user.id === problem.creator._id.toString()) {
            // Keep test cases
        } else {
            delete problemData.testCases;
        }

        res.status(200).json({ problem: problemData });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update problem (only creator)
const updateProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (problem.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to update this problem" });
        }

        const { title, description, difficulty, inputFormat, outputFormat, constraints, sampleInput, sampleOutput, testCases } = req.body;

        problem.title = title || problem.title;
        problem.description = description || problem.description;
        problem.difficulty = difficulty || problem.difficulty;
        problem.inputFormat = inputFormat || problem.inputFormat;
        problem.outputFormat = outputFormat || problem.outputFormat;
        problem.constraints = constraints || problem.constraints;
        problem.sampleInput = sampleInput || problem.sampleInput;
        problem.sampleOutput = sampleOutput || problem.sampleOutput;
        if (testCases && Array.isArray(testCases)) {
            problem.testCases = testCases;
        }

        await problem.save();
        res.status(200).json({ message: "Problem updated successfully", problem });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete problem (only creator)
const deleteProblem = async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) {
            return res.status(404).json({ message: "Problem not found" });
        }

        if (problem.creator.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to delete this problem" });
        }

        await Problem.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Problem deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    createProblem,
    getProblems,
    getProblemById,
    updateProblem,
    deleteProblem
};
