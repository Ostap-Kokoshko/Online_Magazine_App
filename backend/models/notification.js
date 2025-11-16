module.exports = (sequelize, DataTypes) => {
    const Notification = sequelize.define('Notification', {
        message: DataTypes.STRING,
        type: DataTypes.STRING,
        is_read: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        link_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        }
    }, {
        tableName: 'notifications',
        timestamps: true
    });

    Notification.associate = (models) => {
        Notification.belongsTo(models.User, { as: 'user', foreignKey: 'user_id' });
    };

    return Notification;
};