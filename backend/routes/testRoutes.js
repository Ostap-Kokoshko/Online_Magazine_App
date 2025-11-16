const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/', testController.getAllTests);
router.get('/:testId', testController.getTestById);
router.post('/:testId/submit', testController.submitTest);

module.exports = router;