module.exports = (sequelize, DataTypes) => {
    const Subscription = sequelize.define('Subscription', {
        start_date: DataTypes.DATE,
        end_date: DataTypes.DATE,
        status: DataTypes.STRING,
        reader_id: {
            type: DataTypes.INTEGER,
            unique: true
        }
    }, {
        tableName: 'subscriptions',
        timestamps: false
    });

    Subscription.associate = (models) => {
        Subscription.belongsTo(models.User, { as: 'reader', foreignKey: 'reader_id' });
        Subscription.belongsTo(models.SubscriptionPlan, { as: 'plan', foreignKey: 'plan_id' });
    };

    return Subscription;
};