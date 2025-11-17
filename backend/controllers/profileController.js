const db = require('../models');
const { Op } = require('sequelize');

exports.getSavedArticles = async (req, res) => {
    const userId = req.user.id;
    try {
        const user = await db.User.findByPk(userId, {
            include: {
                model: db.Article,
                as: 'saved_articles',
                include: [
                    { model: db.Category, as: 'category', attributes: ['name'] }
                ]
            }
        });

        const articlesList = user.saved_articles.map(article => ({
            id: article.id,
            title: article.title,
            category: article.category.name,
            imageUrl: `https://picsum.photos/seed/${article.id}/500/300`
        }));

        res.json(articlesList);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.saveArticle = async (req, res) => {
    const userId = req.user.id;
    const { articleId } = req.body;
    try {
        await db.SavedArticle.create({
            reader_id: userId,
            article_id: articleId
        });
        res.status(201).json({ msg: "Статтю збережено", articleId: articleId });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ msg: "Стаття вже збережена" });
        }
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.removeSavedArticle = async (req, res) => {
    const userId = req.user.id;
    const { articleId } = req.params;
    try {
        const result = await db.SavedArticle.destroy({
            where: {
                reader_id: userId,
                article_id: articleId
            }
        });
        if (result === 0) {
            return res.status(404).json({ msg: "Статтю не знайдено у збережених" });
        }
        res.json({ msg: "Статтю видалено", articleId: Number(articleId) });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getRecommendations = async (req, res) => {
    const userId = req.user.id;
    try {
        const saved = await db.SavedArticle.findAll({
            where: { reader_id: userId },
            attributes: ['article_id']
        });
        const savedIds = saved.map(s => s.article_id);

        if (savedIds.length === 0) {
            return res.json([]);
        }

        const savedCategoriesQuery = await db.Article.findAll({
            where: { id: savedIds },
            attributes: ['category_id'],
            group: ['category_id']
        });
        const baseCategoryIds = savedCategoriesQuery.map(c => c.category_id);

        const allRelevantCategoryIds = new Set(baseCategoryIds);

        const childCategories = await db.Category.findAll({
            where: { parent_id: { [Op.in]: baseCategoryIds } },
            attributes: ['id']
        });
        childCategories.forEach(c => allRelevantCategoryIds.add(c.id));

        const parentCategories = await db.Category.findAll({
            where: { id: { [Op.in]: baseCategoryIds } },
            attributes: ['parent_id']
        });
        parentCategories.forEach(c => {
            if (c.parent_id) {
                allRelevantCategoryIds.add(c.parent_id);
            }
        });

        const recommendations = await db.Article.findAll({
            where: {
                category_id: { [Op.in]: Array.from(allRelevantCategoryIds) },
                status: 'published',
                id: { [Op.notIn]: savedIds }
            },
            limit: 5,
            include: ['category', 'author'],
            order: db.sequelize.random()
        });

        const articlesList = recommendations.map(article => ({
            id: article.id,
            title: article.title,
            category: article.category.name,
            imageUrl: `https://picsum.photos/seed/${article.id}/500/300`
        }));

        res.json(articlesList);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};