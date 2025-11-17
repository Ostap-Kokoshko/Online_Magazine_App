module.exports = (sequelize, DataTypes) => {
    const Vote = sequelize.define('Vote', {
    }, {
        tableName: 'votes',
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['reader_id', 'poll_id']
            }
        ]
    });

    Vote.associate = (models) => {
        Vote.belongsTo(models.User, { as: 'reader', foreignKey: 'reader_id' });
        Vote.belongsTo(models.PollOption, { as: 'option', foreignKey: 'option_id' });
        Vote.belongsTo(models.Poll, { foreignKey: 'poll_id' });
    };

    return Vote;
};