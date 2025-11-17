const db = require('../models');
const { Op } = require('sequelize');

const notifyAllUsers = async (entity, type) => {
    try {
        let message = "";
        let link_url = "";

        if (type === 'article') {
            message = `Нова стаття: "${entity.title}"`;
            link_url = `/article/${entity.id}`;
        } else if (type === 'poll') {
            message = `Нове опитування: "${entity.question}"`;
            link_url = `/polls`;
        } else if (type === 'test') {
            message = `Новий тест: "${entity.title}"`;
            link_url = `/test/${entity.id}`;
        }

        const allReaders = await db.User.findAll({
            where: { role: 'reader' },
            attributes: ['id']
        });

        const notificationsData = allReaders.map(user => ({
            message,
            link_url,
            type: 'new_content',
            user_id: user.id
        }));

        if (notificationsData.length > 0) {
            await db.Notification.bulkCreate(notificationsData);
        }
    } catch (err) {
        console.error("Помилка сервісу сповіщень (notifyAllUsers):", err.message);
    }
};

const notifyPremiumUsers = async (article) => {
    try {
        const message = `💎 Ексклюзив: "${article.title}"`;
        const link_url = `/article/${article.id}`;

        const premiumUsers = await db.User.findAll({
            where: { role: 'reader' },
            attributes: ['id'],
            include: {
                model: db.Subscription,
                as: 'subscription',
                required: true,
                include: {
                    model: db.SubscriptionPlan,
                    as: 'plan',
                    where: { name: 'Premium' }
                }
            }
        });

        const notificationsData = premiumUsers.map(user => ({
            message,
            link_url,
            type: 'exclusive',
            user_id: user.id
        }));

        if (notificationsData.length > 0) {
            await db.Notification.bulkCreate(notificationsData);
        }
    } catch (err) {
        console.error("Помилка сервісу сповіщень (notifyPremiumUsers):", err.message);
    }
};

const notifyStaff = async (entity, type, creatorId, creatorName, actionType = 'створив') => {
    try {
        const message = `Колега ${creatorName} ${actionType} ${type}: "${entity.title || entity.question}"`;

        let link_url = "/admin/dashboard";
        if (type === 'статтю') link_url = `/admin/article/edit/${entity.id}`;
        if (type === 'опитування') link_url = `/admin/polls/edit/${entity.id}`;
        if (type === 'тест') link_url = `/admin/tests/edit/${entity.id}`;

        const staff = await db.User.findAll({
            where: {
                role: ['admin', 'editor'],
                id: { [Op.ne]: creatorId }
            },
            attributes: ['id']
        });

        const notificationsData = staff.map(user => ({
            message,
            link_url,
            type: 'admin_action',
            user_id: user.id
        }));

        if (notificationsData.length > 0) {
            await db.Notification.bulkCreate(notificationsData);
        }
    } catch (err) {
        console.error("Помилка сервісу сповіщень (notifyStaff):", err.message);
    }
};

module.exports = {
    notifyAllUsers,
    notifyPremiumUsers,
    notifyStaff
};