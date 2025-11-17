const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');

router.get('/', adminUserController.getAllUsers);
router.post('/', adminUserController.createUser);
router.delete('/:userId', adminUserController.deleteUser);

router.put('/:userId/role', adminUserController.updateUserRole);
router.put('/:userId/subscription', adminUserController.updateUserSubscription);

module.exports = router;