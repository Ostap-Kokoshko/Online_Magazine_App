module.exports = (sequelize, DataTypes) => {
    const TestAnswer = sequelize.define('TestAnswer', {
        text: {
            type: DataTypes.STRING,
            allowNull: false
        },
        result_key: {
            type: DataTypes.STRING(1),
            allowNull: false
        }
    }, {
        tableName: 'test_answers',
        timestamps: false
    });

    TestAnswer.associate = (models) => {
        TestAnswer.belongsTo(models.TestQuestion, { foreignKey: 'question_id' });
    };

    return TestAnswer;
};