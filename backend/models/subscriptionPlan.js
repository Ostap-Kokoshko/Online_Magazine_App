module.exports = (sequelize, DataTypes) => {
    const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
        name: {
            type: DataTypes.STRING,
            unique: true
        },
        price: DataTypes.INTEGER,
        features: DataTypes.STRING
    }, {
        tableName: 'subscription_plans',
        timestamps: false
    });

    SubscriptionPlan.associate = (models) => {
        SubscriptionPlan.hasMany(models.Subscription, { as: 'subscriptions', foreignKey: 'plan_id' });
    };

    return SubscriptionPlan;
};