const db = require('../models');
const { Op } = require('sequelize');
const { notifyAllUsers, notifyPremiumUsers, notifyStaff } = require('../services/notificationService');

exports.getFeaturedArticle = async (req, res) => {
    try {
        const featured = await db.Article.findOne({
            where: {
                status: 'published',
                is_featured: true
            },
            include: ['author', 'category']
        });

        if (!featured) {
            return res.status(404).json({ msg: "Рекомендовану статтю не знайдено" });
        }

        const articleData = {
            id: featured.id,
            title: featured.title,
            category: featured.category?.name || 'Без категорії',
            author: featured.author?.username || 'Анонім',
            imageUrl: `https://picsum.photos/seed/${featured.id}/800/400`,
            isExclusive: featured.is_exclusive,
        };

        res.json(articleData);

    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getArticles = async (req, res) => {
    const userId = req.user?.id;

    try {
        const articlesQuery = await db.Article.findAll({
            where: {
                status: 'published',
                is_featured: false
            },
            include: ['author', 'category'],
            order: [['publication_date', 'DESC']]
        });

        let savedIds = [];
        if (userId) {
            const saved = await db.SavedArticle.findAll({
                where: { reader_id: userId },
                attributes: ['article_id']
            });
            savedIds = saved.map(s => s.article_id);
        }

        const articlesList = articlesQuery.map(article => ({
            id: article.id,
            title: article.title,
            category: article.category?.name || 'Без категорії',
            author: article.author?.username || 'Анонім',
            isExclusive: article.is_exclusive,
            imageUrl: `https://picsum.photos/seed/${article.id}/500/300`,
            isSaved: savedIds.includes(article.id)
        }));

        res.json(articlesList);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getArticle = async (req, res) => {
    const userId = req.user?.id;
    const { articleId } = req.params;

    try {
        const article = await db.Article.findByPk(articleId, {
            include: [
                { model: db.User, as: 'author', attributes: ['username'] },
                { model: db.Category, as: 'category', attributes: ['id', 'name'] },
                { model: db.Media, as: 'media_files', attributes: ['url', 'type', 'alt_text', 'is_exclusive'] }
            ]
        });

        if (!article) {
            return res.status(404).json({ msg: "Статтю не знайдено" });
        }

        if (article.is_exclusive && req.user?.plan !== 'Premium') {}

        res.json({
            id: article.id,
            title: article.title,
            content: article.content,
            premium_content: article.premium_content,
            category_id: article.category ? article.category.id : null,
            category: article.category?.name || 'Без категорії',
            author: article.author?.username || 'Анонім',
            isExclusive: article.is_exclusive,
            is_featured: article.is_featured,
            status: article.status,
            media_files: article.media_files || []
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getArticleComments = async (req, res) => {
    const { articleId } = req.params;
    try {
        const comments = await db.Comment.findAll({
            where: { article_id: articleId },
            include: [{
                model: db.User,
                as: 'author',
                attributes: ['id', 'username']
            }],
            order: [['createdAt', 'DESC']]
        });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.postArticleComment = async (req, res) => {
    const userId = req.user.id;
    const { articleId } = req.params;
    const { text } = req.body;

    if (!text || text.trim() === '') {
        return res.status(400).json({ msg: 'Текст коментаря не може бути порожнім' });
    }

    try {
        const newComment = await db.Comment.create({
            text: text,
            article_id: Number(articleId),
            author_id: userId
        });

        const commentWithAuthor = await db.Comment.findByPk(newComment.id, {
            include: [{
                model: db.User,
                as: 'author',
                attributes: ['id', 'username']
            }]
        });

        res.status(201).json(commentWithAuthor);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.deleteArticleComment = async (req, res) => {
    const userId = req.user.id;
    const { commentId } = req.params;

    try {
        const comment = await db.Comment.findByPk(commentId);

        if (!comment) {
            return res.status(404).json({ msg: 'Коментар не знайдено' });
        }

        if (comment.author_id !== userId) {
            return res.status(403).json({ msg: 'Ви не можете видалити чужий коментар' });
        }

        await comment.destroy();

        res.json({ msg: 'Коментар видалено', commentId: Number(commentId) });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getAllArticlesForAdmin = async (req, res) => {
    try {
        const articles = await db.Article.findAll({
            include: ['author', 'category'],
            order: [['publication_date', 'DESC']]
        });

        const safeArticles = articles.map(article => ({
            id: article.id,
            title: article.title,
            status: article.status,
            author: article.author ? article.author : { username: 'Анонім' },
            category: article.category ? article.category : { name: 'Без категорії' }
        }));

        res.json(articles);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.createArticle = async (req, res) => {
    const userId = req.user.id;
    const { id: creatorId, username: creatorName } = req.user;

    const {
        title, content, premium_content, category_id,
        is_exclusive, is_featured, status
    } = req.body;

    try {
        const newArticle = await db.Article.create({
            title,
            content,
            premium_content,
            category_id: Number(category_id),
            author_id: userId,
            is_exclusive: Boolean(is_exclusive),
            is_featured: Boolean(is_featured),
            status: status || 'draft',
            publication_date: status === 'published' ? new Date() : null
        });

        if (newArticle.status === 'published') {
            if (newArticle.is_exclusive) {
                notifyPremiumUsers(newArticle).catch(console.error);
            } else {
                notifyAllUsers(newArticle, 'article').catch(console.error);
            }
        }

        notifyStaff(newArticle, 'статтю', creatorId, creatorName, 'створив').catch(console.error);

        res.status(201).json(newArticle);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.updateArticle = async (req, res) => {
    const { id: creatorId, username: creatorName } = req.user;
    const { articleId } = req.params;
    const {
        title, content, premium_content, category_id,
        is_exclusive, is_featured, status
    } = req.body;

    try {
        const article = await db.Article.findByPk(articleId);
        if (!article) {
            return res.status(404).json({ msg: 'Статтю не знайдено' });
        }

        const wasDraft = article.status === 'draft';

        await article.update({
            title,
            content,
            premium_content,
            category_id: Number(category_id),
            is_exclusive: Boolean(is_exclusive),
            is_featured: Boolean(is_featured),
            status: status,
            publication_date: (article.status === 'draft' && status === 'published') ? new Date() : article.publication_date
        });

        if (wasDraft && article.status === 'published') {
            if (article.is_exclusive) {
                notifyPremiumUsers(article).catch(console.error);
            } else {
                notifyAllUsers(article, 'article').catch(console.error);
            }
        }

        notifyStaff(article, 'статтю', creatorId, creatorName, 'оновив').catch(console.error);

        res.json(article);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.deleteArticle = async (req, res) => {
    const { articleId } = req.params;
    try {
        const article = await db.Article.findByPk(articleId);
        if (!article) {
            return res.status(404).json({ msg: 'Статтю не знайдено' });
        }

        await article.destroy();
        res.json({ msg: 'Статтю видалено', articleId: Number(articleId) });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};