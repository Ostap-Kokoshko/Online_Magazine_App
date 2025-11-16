const express = require('express');
const router = express.Router();
const adminPollController = require('../controllers/adminPollController');

router.get('/', adminPollController.getAllPolls);
router.get('/:id', adminPollController.getPollById);
router.post('/', adminPollController.createPoll);
router.put('/:id', adminPollController.updatePoll);
router.delete('/:id', adminPollController.deletePoll);

module.exports = router;