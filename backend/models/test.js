module.exports = (sequelize, DataTypes) => {
    const Test = sequelize.define('Test', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: DataTypes.TEXT,
        image_url: DataTypes.STRING
    }, {
        tableName: 'tests',
        timestamps: false
    });

    Test.associate = (models) => {
        Test.hasMany(models.TestQuestion, { as: 'questions', foreignKey: 'test_id', onDelete: 'CASCADE', hooks: true });
        Test.hasMany(models.TestResult, { as: 'results', foreignKey: 'test_id', onDelete: 'CASCADE', hooks: true });
    };

    return Test;
};