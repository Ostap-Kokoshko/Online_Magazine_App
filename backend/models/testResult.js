module.exports = (sequelize, DataTypes) => {
    const TestResult = sequelize.define('TestResult', {
        result_key: {
            type: DataTypes.STRING(1),
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        }
    }, {
        tableName: 'test_results',
        timestamps: false
    });

    TestResult.associate = (models) => {
        TestResult.belongsTo(models.Test, { foreignKey: 'test_id' });
    };

    return TestResult;
};