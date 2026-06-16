const express = require('express');
const { runCode, submitCode, getSubmissions, getSubmissionById } = require('../controller/submission_controller');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/problems/:id/run', runCode);
router.post('/problems/:id/submit', protect, submitCode);
router.get('/submissions', getSubmissions);
router.get('/submissions/:id', protect, getSubmissionById);

module.exports = router;
