const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const collectionController = require('../controllers/collectionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/saved-articles', protect, profileController.getSavedArticles);
router.post('/saved-articles', protect, profileController.saveArticle);
router.delete('/saved-articles/:articleId', protect, profileController.removeSavedArticle);

router.get('/recommendations', protect, profileController.getRecommendations);

router.get('/collections', protect, collectionController.getCollections);
router.post('/collections', protect, collectionController.createCollection);
router.delete('/collections/:collectionId', protect, collectionController.deleteCollection);
router.post('/collections/add-article', protect, collectionController.addArticleToCollection);

router.get('/collections/:collectionId', protect, collectionController.getCollectionById);

module.exports = router;