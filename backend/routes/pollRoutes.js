const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');


router.get('/', optionalAuth, pollController.getAllPolls);
router.post('/:pollId/vote', protect, pollController.voteOnPoll);

module.exports = router;