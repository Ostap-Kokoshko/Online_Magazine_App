module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'reader'
        }
    }, {
        tableName: 'users',
        timestamps: false
    });

    User.associate = (models) => {
        User.hasMany(models.Comment, { as: 'comments', foreignKey: 'author_id' });
        User.hasMany(models.Collection, { as: 'collections', foreignKey: 'owner_id' });
        User.hasOne(models.Subscription, { as: 'subscription', foreignKey: 'reader_id' });
        User.hasMany(models.Article, { as: 'articles_authored', foreignKey: 'author_id' });
        User.hasMany(models.Notification, { as: 'notifications', foreignKey: 'user_id' });
        User.hasMany(models.Vote, { as: 'votes', foreignKey: 'reader_id' });

        User.belongsToMany(models.Article, {
            through: models.SavedArticle,
            foreignKey: 'reader_id',
            otherKey: 'article_id',
            as: 'saved_articles'
        });
    };

    return User;
};