module.exports = (sequelize, DataTypes) => {
    const Partner = sequelize.define('Partner', {
        name: DataTypes.STRING,
        contact_info: DataTypes.STRING
    }, {
        tableName: 'partners',
        timestamps: false
    });

    Partner.associate = (models) => {
        Partner.hasMany(models.Advertisement, { as: 'advertisements', foreignKey: 'partner_id' });
    };

    return Partner;
};