module.exports = (sequelize, DataTypes) => {
    const Media = sequelize.define('Media', {
        url: DataTypes.STRING,
        type: DataTypes.STRING,
        alt_text: DataTypes.STRING,

        is_exclusive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'media',
        timestamps: false
    });

    Media.associate = (models) => {
        Media.belongsTo(models.Article, { foreignKey: 'article_id' });
    };

    return Media;
};