const db = require('../models');
const { notifyAllUsers, notifyStaff } = require('../services/notificationService');

exports.getAllPolls = async (req, res) => {
    try {
        const polls = await db.Poll.findAll({
            order: [['id', 'DESC']],
            attributes: ['id', 'question', 'is_active']
        });
        res.json(polls);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getPollById = async (req, res) => {
    try {
        const poll = await db.Poll.findByPk(req.params.id, {
            include: [{ model: db.PollOption, as: 'options', attributes: ['id', 'text'] }]
        });
        if (!poll) return res.status(404).json({ msg: 'Опитування не знайдено' });
        res.json(poll);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.createPoll = async (req, res) => {
    const { id: creatorId, username: creatorName } = req.user;
    const { question, options } = req.body;
    const t = await db.sequelize.transaction();
    try {
        const newPoll = await db.Poll.create({
            question,
            is_active: true
        }, { transaction: t });

        const optionsData = options.map(optText => ({
            text: optText,
            poll_id: newPoll.id
        }));
        await db.PollOption.bulkCreate(optionsData, { transaction: t });

        await t.commit();

        notifyAllUsers(newPoll, 'poll').catch(console.error);
        notifyStaff(newPoll, 'опитування', creatorId, creatorName, 'створив').catch(console.error);

        res.status(201).json(newPoll);
    } catch (err) {
        await t.rollback();
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.updatePoll = async (req, res) => {
    const { id: creatorId, username: creatorName } = req.user;
    const { id } = req.params;
    const { question, options } = req.body;
    const t = await db.sequelize.transaction();
    try {
        const poll = await db.Poll.findByPk(id);
        if (!poll) return res.status(404).json({ msg: 'Опитування не знайдено' });

        await poll.update({ question }, { transaction: t });

        await db.PollOption.destroy({ where: { poll_id: id } }, { transaction: t });

        const optionsData = options.map(optText => ({
            text: optText,
            poll_id: poll.id
        }));
        await db.PollOption.bulkCreate(optionsData, { transaction: t });

        await t.commit();

        notifyStaff(poll, 'опитування', creatorId, creatorName, 'оновив').catch(console.error);

        res.json({ msg: 'Опитування оновлено' });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.deletePoll = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.Poll.destroy({ where: { id: id } });
        if (result === 0) return res.status(404).json({ msg: 'Опитування не знайдено' });
        res.json({ msg: 'Опитування видалено', pollId: Number(id) });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};