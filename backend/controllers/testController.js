const db = require('../models');

exports.getAllTests = async (req, res) => {
    try {
        const tests = await db.Test.findAll({
            attributes: ['id', 'title', 'description', 'image_url']
        });
        res.json(tests);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getTestById = async (req, res) => {
    const { testId } = req.params;
    try {
        const test = await db.Test.findByPk(testId, {
            attributes: ['id', 'title', 'description'],
            include: [{
                model: db.TestQuestion,
                as: 'questions',
                attributes: ['id', 'text'],
                include: [{
                    model: db.TestAnswer,
                    as: 'answers',
                    attributes: ['id', 'text']
                }]
            }]
        });

        if (!test) {
            return res.status(404).json({ msg: 'Тест не знайдено' });
        }
        res.json(test);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.submitTest = async (req, res) => {
    const { testId } = req.params;

    const userAnswers = req.body.answers;

    try {
        const answerIds = Object.values(userAnswers);

        const answers = await db.TestAnswer.findAll({
            where: { id: answerIds }
        });

        const scores = {};
        answers.forEach(answer => {
            const key = answer.result_key;
            scores[key] = (scores[key] || 0) + 1;
        });

        const topResultKey = Object.keys(scores).sort((a, b) => scores[b] - scores[a])[0];

        const finalResult = await db.TestResult.findOne({
            where: {
                test_id: testId,
                result_key: topResultKey
            }
        });

        if (!finalResult) {
            return res.status(500).json({ msg: 'Не вдалося розрахувати результат' });
        }

        res.json(finalResult);

    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};