module.exports = (sequelize, DataTypes) => {
    const SavedArticle = sequelize.define('SavedArticle', {
        reader_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: 'users', key: 'id' }
        },
        article_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            references: { model: 'articles', key: 'id' }
        },
        saved_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'saved_articles',
        timestamps: false
    });
    return SavedArticle;
};