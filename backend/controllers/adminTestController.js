const db = require('../models');
const { notifyAllUsers } = require('../services/notificationService');

exports.getAllTests = async (req, res) => {
    try {
        const tests = await db.Test.findAll({
            order: [['id', 'DESC']],
            attributes: ['id', 'title']
        });
        res.json(tests);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.getTestById = async (req, res) => {
    try {
        const test = await db.Test.findByPk(req.params.id, {
            include: [
                {
                    model: db.TestQuestion, as: 'questions',
                    include: [{ model: db.TestAnswer, as: 'answers' }]
                },
                { model: db.TestResult, as: 'results' }
            ]
        });
        if (!test) return res.status(404).json({ msg: 'Тест не знайдено' });
        res.json(test);
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.createTest = async (req, res) => {
    const { title, description, image_url, questions, results } = req.body;
    const t = await db.sequelize.transaction();
    try {
        const newTest = await db.Test.create({ title, description, image_url }, { transaction: t });

        const resultsData = results.map(r => ({ ...r, test_id: newTest.id }));
        await db.TestResult.bulkCreate(resultsData, { transaction: t });

        for (const q of questions) {
            const newQuestion = await db.TestQuestion.create({
                text: q.text,
                test_id: newTest.id
            }, { transaction: t });

            const answersData = q.answers.map(a => ({
                text: a.text,
                result_key: a.result_key,
                question_id: newQuestion.id
            }));
            await db.TestAnswer.bulkCreate(answersData, { transaction: t });
        }

        await t.commit();

        notifyAllUsers(newTest, 'test').catch(console.error);

        res.status(201).json(newTest);
    } catch (err) {
        await t.rollback();
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.updateTest = async (req, res) => {
    const { id } = req.params;
    const { title, description, image_url, questions, results } = req.body;
    const t = await db.sequelize.transaction();
    try {
        const test = await db.Test.findByPk(id);
        if (!test) return res.status(404).json({ msg: 'Тест не знайдено' });

        await test.update({ title, description, image_url }, { transaction: t });

        await db.TestQuestion.destroy({ where: { test_id: id } }, { transaction: t });
        await db.TestResult.destroy({ where: { test_id: id } }, { transaction: t });

        const resultsData = results.map(r => ({ ...r, test_id: test.id }));
        await db.TestResult.bulkCreate(resultsData, { transaction: t });

        for (const q of questions) {
            const newQuestion = await db.TestQuestion.create({
                text: q.text,
                test_id: test.id
            }, { transaction: t });

            const answersData = q.answers.map(a => ({
                text: a.text,
                result_key: a.result_key,
                question_id: newQuestion.id
            }));
            await db.TestAnswer.bulkCreate(answersData, { transaction: t });
        }

        await t.commit();
        res.json({ msg: 'Тест оновлено' });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};

exports.deleteTest = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.Test.destroy({ where: { id: id } });
        if (result === 0) return res.status(404).json({ msg: 'Тест не знайдено' });
        res.json({ msg: 'Тест видалено', testId: Number(id) });
    } catch (err) {
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
};