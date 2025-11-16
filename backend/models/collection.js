module.exports = (sequelize, DataTypes) => {
    const Collection = sequelize.define('Collection', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        owner_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'collections',
        timestamps: false
    });

    Collection.associate = (models) => {
        Collection.belongsTo(models.User, { as: 'owner', foreignKey: 'owner_id' });

        Collection.belongsToMany(models.Article, {
            through: models.CollectionArticle,
            foreignKey: 'collection_id',
            otherKey: 'article_id',
            as: 'articles'
        });
    };

    return Collection;
};