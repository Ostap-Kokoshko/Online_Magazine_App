module.exports = (sequelize, DataTypes) => {
    const Advertisement = sequelize.define('Advertisement', {
        content: DataTypes.STRING,
        display_area: DataTypes.INTEGER
    }, {
        tableName: 'advertisements',
        timestamps: false
    });

    Advertisement.associate = (models) => {
        Advertisement.belongsTo(models.Partner, { as: 'partner', foreignKey: 'partner_id' });
    };

    return Advertisement;
};