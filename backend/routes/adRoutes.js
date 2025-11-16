const express = require('express');
const router = express.Router();
const adController = require('../controllers/adController');

router.get('/random', adController.getRandomAd);

module.exports = router;