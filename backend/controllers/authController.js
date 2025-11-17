const db = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
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
            role: 'reader'
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
        res.status(201).json({ msg: 'Користувача успішно створено' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.User.findOne({
            where: { username },
            include: {
                model: db.Subscription,
                as: 'subscription',
                required: false,
                include: {
                    model: db.SubscriptionPlan,
                    as: 'plan',
                    attributes: ['name']
                }
            }
        });

        if (!user) {
            return res.status(401).json({ msg: 'Неправильний username або пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ msg: 'Неправильний username або пароль' });
        }

        let userPlan;
        if (user.role === 'admin' || user.role === 'editor') {
            userPlan = 'Premium';
        } else {
            userPlan = user.subscription?.plan?.name || 'Free';
        }

        const payload = {
            sub: {
                id: user.id,
                username: user.username,
                role: user.role,
                plan: userPlan
            }
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({ access_token: token });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};