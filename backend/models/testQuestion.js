module.exports = (sequelize, DataTypes) => {
    const TestQuestion = sequelize.define('TestQuestion', {
        text: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        tableName: 'test_questions',
        timestamps: false
    });

    TestQuestion.associate = (models) => {
        TestQuestion.belongsTo(models.Test, { foreignKey: 'test_id' });
        TestQuestion.hasMany(models.TestAnswer, { as: 'answers', foreignKey: 'question_id', onDelete: 'CASCADE', hooks: true });
    };

    return TestQuestion;
};