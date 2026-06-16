const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true,
    },
    language: {
        type: String,
        required: true,
        enum: ['javascript', 'python', 'cpp'],
    },
    code: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compilation Error'],
        default: 'Pending',
    },
    errorMessage: {
        type: String,
        default: '',
    },
    testResults: [
        {
            testCaseIndex: Number,
            passed: Boolean,
            input: String,
            expectedOutput: String,
            actualOutput: String,
            errorMessage: String,
        }
    ],
    submittedAt: {
        type: Date,
        default: Date.now,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Submission', submissionSchema);
