module.exports = (sequelize, DataTypes) => {
    const PollOption = sequelize.define('PollOption', {
        text: DataTypes.STRING
    }, {
        tableName: 'poll_options',
        timestamps: false
    });

    PollOption.associate = (models) => {
        PollOption.belongsTo(models.Poll, { foreignKey: 'poll_id' });
        PollOption.hasMany(models.Vote, { as: 'votes', foreignKey: 'option_id', onDelete: 'CASCADE', hooks: true });
    };

    return PollOption;
};