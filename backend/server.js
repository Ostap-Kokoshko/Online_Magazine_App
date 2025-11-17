require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const mainRouter = require('./routes');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(express.json());

app.use('/api', mainRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
    console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
    try {
        await db.sequelize.authenticate();
        console.log('✅ З\'єднання з базою даних встановлено.');
    } catch (error) {
        console.error('❌ Помилка з\'єднання з базою даних:', error);
    }
});