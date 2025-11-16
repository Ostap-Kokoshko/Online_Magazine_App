const express = require('express');
const router = express.Router();
const adminTestController = require('../controllers/adminTestController');

router.get('/', adminTestController.getAllTests);
router.get('/:id', adminTestController.getTestById);
router.post('/', adminTestController.createTest);
router.put('/:id', adminTestController.updateTest);
router.delete('/:id', adminTestController.deleteTest);

module.exports = router;