const db = require('../models');

exports.getAllPolls = async (req, res) => {
    const userId = req.user?.id;

    try {
        const polls = await db.Poll.findAll({
            where: { is_active: true },
            include: [{
                model: db.PollOption,
                as: 'options',
                include: [{
                    model: db.Vote,
                    as: 'votes',
                    attributes: ['id']
                }]
            }],
            order: [['id', 'DESC']]
        });

        let userVotedPollIds = new Set();
        if (userId) {
            const userVotes = await db.Vote.findAll({
                where: { reader_id: userId },
                attributes: ['poll_id']
            });
            userVotedPollIds = new Set(userVotes.map(v => v.poll_id));
        }

        const formattedPolls = polls.map(poll => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);

            return {
                id: poll.id,
                question: poll.question,
                hasVoted: userVotedPollIds.has(poll.id),
                totalVotes: totalVotes,
                options: poll.options.map(option => ({
                    id: option.id,
                    text: option.text,
                    voteCount: option.votes.length,
                    percentage: totalVotes > 0 ? Math.round((option.votes.length / totalVotes) * 100) : 0
                }))
            };
        });

        res.json(formattedPolls);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.voteOnPoll = async (req, res) => {
    const userId = req.user.id;
    const { pollId } = req.params;
    const { optionId } = req.body;

    if (!optionId) {
        return res.status(400).json({ msg: 'Необхідно обрати варіант' });
    }

    try {
        const option = await db.PollOption.findOne({
            where: { id: optionId, poll_id: pollId }
        });
        if (!option) {
            return res.status(404).json({ msg: 'Варіант не знайдено для цього опитування' });
        }

        await db.Vote.create({
            reader_id: userId,
            option_id: optionId,
            poll_id: Number(pollId)
        });

        exports.getAllPolls(req, res);

    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ msg: "Ви вже голосували у цьому опитуванні" });
        }
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};