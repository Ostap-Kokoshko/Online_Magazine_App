const express = require('express');
const router = express.Router();
const { protect, editorOnly } = require('../middleware/authMiddleware');

router.use('/auth', require('./authRoutes'));
router.use('/', require('./articleRoutes'));
router.use('/profile', require('./profileRoutes'));
router.use('/polls', require('./pollRoutes'));
router.use('/tests', require('./testRoutes'));
router.use('/subscription', require('./subscriptionRoutes'));
router.use('/advertisements', require('./adRoutes'));
router.use('/admin/polls', protect, editorOnly, require('./adminPollRoutes'));
router.use('/admin/tests', protect, editorOnly, require('./adminTestRoutes'));
router.use('/notifications', protect, require('./notificationRoutes'));

module.exports = router;