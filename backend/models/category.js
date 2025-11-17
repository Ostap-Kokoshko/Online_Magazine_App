module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        description: DataTypes.STRING,
        parent_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'categories',
                key: 'id'
            }
        }
    }, {
        tableName: 'categories',
        timestamps: false
    });

    Category.associate = (models) => {
        Category.hasMany(models.Article, { as: 'articles', foreignKey: 'category_id' });
        Category.hasMany(models.Category, { as: 'subcategories', foreignKey: 'parent_id' });
        Category.belongsTo(models.Category, { as: 'parent', foreignKey: 'parent_id' });
    };

    return Category;
};