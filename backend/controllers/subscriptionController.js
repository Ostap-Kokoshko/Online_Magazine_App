const db = require('../models');

exports.upgradeToPremium = async (req, res) => {
    const userId = req.user.id;

    try {
        const premiumPlan = await db.SubscriptionPlan.findOne({
            where: { name: "Premium" }
        });
        if (!premiumPlan) {
            return res.status(500).json({ msg: "Premium план не налаштовано на сервері" });
        }

        const currentSubscription = await db.Subscription.findOne({
            where: { reader_id: userId }
        });

        if (!currentSubscription) {
            return res.status(404).json({ msg: "Підписку користувача не знайдено" });
        }

        currentSubscription.plan_id = premiumPlan.id;
        currentSubscription.status = 'active_premium';
        await currentSubscription.save();

        res.json({
            msg: "Підписку успішно оновлено до Premium!",
            newPlan: "Premium"
        });

    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};