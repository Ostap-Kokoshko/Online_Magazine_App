const db = require('../models');

exports.getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const notifications = await db.Notification.findAll({
            where: { user_id: userId },
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getUnreadCount = async (req, res) => {
    const userId = req.user.id;
    try {
        const count = await db.Notification.count({
            where: { user_id: userId, is_read: false }
        });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    const userId = req.user.id;
    try {
        await db.Notification.update(
            { is_read: true },
            { where: { user_id: userId, is_read: false } }
        );
        res.json({ msg: 'Всі сповіщення прочитано' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};