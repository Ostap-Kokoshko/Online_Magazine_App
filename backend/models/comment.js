module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        article_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'articles',
                key: 'id'
            }
        },
        author_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'comments',
        timestamps: true
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.Article, { foreignKey: 'article_id' });
        Comment.belongsTo(models.User, { as: 'author', foreignKey: 'author_id' });
    };

    return Comment;
};