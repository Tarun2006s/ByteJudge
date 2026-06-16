const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy',
    },
    inputFormat: {
        type: String,
        required: true,
    },
    outputFormat: {
        type: String,
        required: true,
    },
    constraints: {
        type: String,
        default: '',
    },
    sampleInput: {
        type: String,
        required: true,
    },
    sampleOutput: {
        type: String,
        required: true,
    },
    testCases: [
        {
            input: { type: String, required: true },
            output: { type: String, required: true },
        }
    ],
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AuthUser',
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Problem', problemSchema);
