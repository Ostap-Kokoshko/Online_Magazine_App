const db = require('../models');

exports.getRandomAd = async (req, res) => {
    try {
        const ad = await db.Advertisement.findOne({
            order: db.sequelize.random(),
            include: {
                model: db.Partner,
                as: 'partner',
                attributes: ['name']
            }
        });

        if (!ad) {
            return res.status(404).json({ msg: "Рекламу не знайдено" });
        }

        res.json({
            id: ad.id,
            content: ad.content,
            partnerName: ad.partner.name
        });

    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};