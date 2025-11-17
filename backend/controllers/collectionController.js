const db = require('../models');

exports.getCollections = async (req, res) => {
    const userId = req.user.id;
    try {
        const collections = await db.Collection.findAll({
            where: { owner_id: userId }
        });
        res.json(collections);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.createCollection = async (req, res) => {
    const userId = req.user.id;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ msg: 'Назва підбірки є обов\'язковою' });
    }
    try {
        const newCollection = await db.Collection.create({
            name: name,
            owner_id: userId
        });
        res.status(201).json(newCollection);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.deleteCollection = async (req, res) => {
    const userId = req.user.id;
    const { collectionId } = req.params;
    try {
        const result = await db.Collection.destroy({
            where: {
                id: collectionId,
                owner_id: userId
            }
        });
        if (result === 0) {
            return res.status(404).json({ msg: "Підбірку не знайдено" });
        }
        res.json({ msg: "Підбірку видалено", collectionId: Number(collectionId) });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.addArticleToCollection = async (req, res) => {
    const userId = req.user.id;
    const { collectionId, articleId } = req.body;

    try {
        const collection = await db.Collection.findOne({
            where: { id: collectionId, owner_id: userId }
        });
        if (!collection) {
            return res.status(404).json({ msg: "Підбірку не знайдено або вона вам не належить" });
        }

        await db.CollectionArticle.create({
            collection_id: collectionId,
            article_id: articleId
        });

        res.status(201).json({ msg: `Статтю ${articleId} додано до підбірки ${collectionId}` });

    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ msg: "Ця стаття вже є у підбірці" });
        }
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getCollectionById = async (req, res) => {
    const userId = req.user.id;
    const { collectionId } = req.params;

    try {
        const collection = await db.Collection.findOne({
            where: {
                id: collectionId,
                owner_id: userId
            },
            include: {
                model: db.Article,
                as: 'articles',
                include: [
                    { model: db.Category, as: 'category', attributes: ['name'] }
                ]
            }
        });

        if (!collection) {
            return res.status(404).json({ msg: "Підбірку не знайдено" });
        }

        const articlesList = collection.articles.map(article => ({
            id: article.id,
            title: article.title,
            category: article.category.name,
            imageUrl: `https://picsum.photos/seed/${article.id}/500/300`
        }));

        res.json({
            id: collection.id,
            name: collection.name,
            articles: articlesList
        });

    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};