module.exports = (sequelize, DataTypes) => {
    const Poll = sequelize.define('Poll', {
        question: DataTypes.STRING,
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'polls',
        timestamps: false
    });

    Poll.associate = (models) => {
        Poll.belongsTo(models.Article, { foreignKey: 'article_id' });
        Poll.hasMany(models.PollOption, { as: 'options', foreignKey: 'poll_id', onDelete: 'CASCADE', hooks: true });
    };

    return Poll;
};