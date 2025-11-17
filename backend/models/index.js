const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const dbPath = path.join(__dirname, '../../magazine.db');
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false
});

const db = {};

db.User = require('./user')(sequelize, DataTypes);
db.Article = require('./article')(sequelize, DataTypes);
db.Category = require('./category')(sequelize, DataTypes);
db.Collection = require('./collection')(sequelize, DataTypes);
db.Comment = require('./comment')(sequelize, DataTypes);
db.Media = require('./media')(sequelize, DataTypes);
db.Notification = require('./notification')(sequelize, DataTypes);
db.Partner = require('./partner')(sequelize, DataTypes);
db.Advertisement = require('./advertisement')(sequelize, DataTypes);
db.Poll = require('./poll')(sequelize, DataTypes);
db.PollOption = require('./pollOption')(sequelize, DataTypes);
db.Vote = require('./vote')(sequelize, DataTypes);
db.Subscription = require('./subscription')(sequelize, DataTypes);
db.SubscriptionPlan = require('./subscriptionPlan')(sequelize, DataTypes);
db.SavedArticle = require('./savedArticle')(sequelize, DataTypes);
db.CollectionArticle = require('./collectionArticle')(sequelize, DataTypes);
db.Test = require('./test')(sequelize, DataTypes);
db.TestQuestion = require('./testQuestion')(sequelize, DataTypes);
db.TestAnswer = require('./testAnswer')(sequelize, DataTypes);
db.TestResult = require('./testResult')(sequelize, DataTypes);


Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;