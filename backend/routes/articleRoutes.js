const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect, optionalAuth, editorOnly } = require('../middleware/authMiddleware');

router.get('/articles/featured', articleController.getFeaturedArticle);

router.get('/articles', optionalAuth, articleController.getArticles);
router.get('/articles/:articleId', optionalAuth, articleController.getArticle);

router.get('/articles/:articleId/comments', articleController.getArticleComments);
router.post('/articles/:articleId/comments', protect, articleController.postArticleComment);
router.delete('/articles/:articleId/comments/:commentId', protect, articleController.deleteArticleComment);

router.get('/articles-admin', protect, editorOnly, articleController.getAllArticlesForAdmin);
router.post('/articles', protect, editorOnly, articleController.createArticle);
router.put('/articles/:articleId', protect, editorOnly, articleController.updateArticle);
router.delete('/articles/:articleId', protect, editorOnly, articleController.deleteArticle);

module.exports = router;