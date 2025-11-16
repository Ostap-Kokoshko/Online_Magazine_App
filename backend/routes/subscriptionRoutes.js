const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upgrade', protect, subscriptionController.upgradeToPremium);

module.exports = router;