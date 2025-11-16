module.exports = (sequelize, DataTypes) => {
    const Article = sequelize.define('Article', {
        title: DataTypes.STRING,
        content: DataTypes.TEXT,
        publication_date: DataTypes.DATE,
        status: {
            type: DataTypes.STRING,
            defaultValue: 'draft'
        },
        is_exclusive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        is_featured: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'articles',
        timestamps: false
    });

    Article.associate = (models) => {
        Article.belongsTo(models.User, { as: 'author', foreignKey: 'author_id' });
        Article.belongsTo(models.Category, { as: 'category', foreignKey: 'category_id' });

        Article.hasMany(models.Media, { as: 'media_files', foreignKey: 'article_id' });
        Article.hasMany(models.Comment, { as: 'comments', foreignKey: 'article_id' });
        Article.hasMany(models.Poll, { as: 'polls', foreignKey: 'article_id' });

        Article.belongsToMany(models.User, {
            through: models.SavedArticle,
            foreignKey: 'article_id',
            otherKey: 'reader_id',
            as: 'saved_by_readers'
        });

        Article.belongsToMany(models.Collection, {
            through: models.CollectionArticle,
            foreignKey: 'article_id',
            otherKey: 'collection_id',
            as: 'collections'
        });
    };

    return Article;
};