const db = require('../models');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.User.findAll({
            attributes: ['id', 'username', 'email', 'role'],
            include: {
                model: db.Subscription,
                as: 'subscription',
                include: {
                    model: db.SubscriptionPlan,
                    as: 'plan',
                    attributes: ['name']
                }
            },
            order: [['id', 'ASC']]
        });

        const formattedUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            plan: user.subscription?.plan?.name || 'Free'
        }));

        res.json(formattedUsers);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.createUser = async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        if (!username || !email || !password || !role) {
            return res.status(400).json({ msg: 'Всі поля є обов\'язковими' });
        }

        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ msg: 'Користувач з таким email вже існує' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await db.User.create({
            username,
            email,
            password_hash,
            role
        });

        const freePlan = await db.SubscriptionPlan.findOne({ where: { name: 'Free' } });
        if (freePlan) {
            await db.Subscription.create({
                reader_id: newUser.id,
                plan_id: freePlan.id,
                start_date: new Date(),
                status: 'active'
            });
        }

        res.status(201).json({
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            role: newUser.role,
            plan: 'Free'
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.deleteUser = async (req, res) => {
    const adminUserId = req.user.id;
    const { userId } = req.params;

    if (Number(adminUserId) === Number(userId)) {
        return res.status(400).json({ msg: 'Адміністратор не може видалити сам себе' });
    }

    try {
        const result = await db.User.destroy({ where: { id: userId } });
        if (result === 0) return res.status(404).json({ msg: 'Користувача не знайдено' });
        res.json({ msg: 'Користувача видалено', userId: Number(userId) });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.updateUserRole = async (req, res) => {
    const adminUserId = req.user.id;
    const { userId } = req.params;
    const { role } = req.body;

    if (Number(adminUserId) === Number(userId)) {
        return res.status(400).json({ msg: 'Адміністратор не може змінити власну роль' });
    }

    try {
        const user = await db.User.findByPk(userId);
        if (!user) return res.status(404).json({ msg: 'Користувача не знайдено' });

        await user.update({ role: role });
        res.json({ msg: 'Роль оновлено', userId: user.id, newRole: role });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.updateUserSubscription = async (req, res) => {
    const { userId } = req.params;
    const { planName } = req.body;

    try {
        const plan = await db.SubscriptionPlan.findOne({ where: { name: planName } });
        if (!plan) return res.status(404).json({ msg: 'План підписки не знайдено' });

        const subscription = await db.Subscription.findOne({ where: { reader_id: userId } });
        if (!subscription) return res.status(404).json({ msg: 'Підписку користувача не знайдено' });

        await subscription.update({ plan_id: plan.id });
        res.json({ msg: `Підписку оновлено до ${planName}`, userId: Number(userId), newPlan: planName });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};