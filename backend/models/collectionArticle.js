module.exports = (sequelize, DataTypes) => {
    const CollectionArticle = sequelize.define('CollectionArticle', {
        collection_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: 'collections', key: 'id' }
        },
        article_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: 'articles', key: 'id' }
        }
    }, {
        tableName: 'collection_articles',
        timestamps: false
    });
    return CollectionArticle;
};