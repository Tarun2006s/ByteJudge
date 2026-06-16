const express = require('express');
const { createProblem, getProblems, getProblemById, updateProblem, deleteProblem } = require('../controller/problem_controller');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(getProblems)
    .post(protect, createProblem);

router.route('/:id')
    .get(optionalProtect, getProblemById)
    .put(protect, updateProblem)
    .delete(protect, deleteProblem);

module.exports = router;
