const db = require('../models');
const { faker } = require('@faker-js/faker/locale/uk');
const bcrypt = require('bcryptjs');
const random = require('lodash.random');

const seedDatabase = async () => {
    try {
        console.log("Ініціалізація бази даних...");
        await db.sequelize.sync({ force: true });
        console.log("Таблиці успішно створено.");

        console.log("Заповнення бази даних тестовими даними...");

        const plan_free = await db.SubscriptionPlan.create({ name: "Free", price: 0, features: "Ads, Basic Content" });
        const plan_premium = await db.SubscriptionPlan.create({ name: "Premium", price: 10, features: "No Ads, Exclusive Content" });

        const partners = [];
        for (let i = 0; i < 5; i++) {
            partners.push(await db.Partner.create({ name: faker.company.name(), contact_info: faker.internet.email() }));
        }

        const ads = [];
        for (const partner of partners) {
            ads.push(await db.Advertisement.create({
                content: `Спеціальна пропозиція від ${partner.name}`,
                display_area: random(1, 3),
                partner_id: partner.id
            }));
        }

        const salt = await bcrypt.genSalt(10);
        const admin_user = await db.User.create({
            username: "admin",
            email: "admin@magazine.com",
            role: "admin",
            password_hash: await bcrypt.hash("password123", salt)
        });
        const editor_user = await db.User.create({
            username: "editor",
            email: "editor@magazine.com",
            role: "editor",
            password_hash: await bcrypt.hash("password123", salt)
        });

        const readers = [];
        readers.push(await db.User.create({
            username: "reader1",
            email: "reader1@example.com",
            role: "reader",
            password_hash: await bcrypt.hash("password123", salt)
        }));
        readers.push(await db.User.create({
            username: "reader2",
            email: "reader2@example.com",
            role: "reader",
            password_hash: await bcrypt.hash("password123", salt)
        }));

        await db.Subscription.bulkCreate([
            { reader_id: readers[0].id, plan_id: plan_free.id, start_date: new Date(), status: "active" },
            { reader_id: readers[1].id, plan_id: plan_premium.id, start_date: new Date(), status: "active" },
        ]);

        const cat1 = await db.Category.create({ name: "Технології", description: "Все про гаджети та IT" });
        const cat2 = await db.Category.create({ name: "Подорожі", description: "Поради та історії з усього світу" });
        const cat3 = await db.Category.create({ name: "Мода", description: "Тенденції та стиль" });
        const cat4 = await db.Category.create({ name: "Спорт", description: "Новини, аналітика, результати" });
        const cat5 = await db.Category.create({ name: "Культура", description: "Кіно, музика, мистецтво" });
        await db.Category.create({ name: "Гаджети", description: "Огляди", parent_id: cat1.id });

        console.log("Створення 10 опублікованих статей...");
        const articles = await db.Article.bulkCreate([
            { title: "Що таке Node.js?", content: faker.lorem.paragraphs(5), author_id: editor_user.id, category_id: cat1.id, is_exclusive: false, publication_date: new Date(), status: 'published' },
            {
                title: "Ексклюзив: Майбутнє Express",
                content: faker.lorem.paragraphs(2),
                premium_content: faker.lorem.paragraphs(10),
                author_id: editor_user.id,
                category_id: cat1.id,
                is_exclusive: true,
                publication_date: new Date(),
                status: 'published'
            },
            { title: "5 місць, які варто відвідати в Азії", content: faker.lorem.paragraphs(5), author_id: editor_user.id, category_id: cat2.id, is_exclusive: false, publication_date: new Date(), status: 'published' },
            {
                title: "Головні тренди осені 2025",
                content: faker.lorem.paragraphs(5),
                author_id: editor_user.id,
                category_id: cat3.id,
                is_exclusive: false,
                publication_date: new Date(),
                status: 'published',
                is_featured: true
            },
            { title: "Огляд матчу Ліги Чемпіонів", content: faker.lorem.paragraphs(5), author_id: editor_user.id, category_id: cat4.id, is_exclusive: false, publication_date: new Date(), status: 'published' },
            { title: "Новий альбом 'The Strokes': рецензія", content: faker.lorem.paragraphs(5), author_id: editor_user.id, category_id: cat5.id, is_exclusive: true, publication_date: new Date(), status: 'published' },
            { title: "Найкращі кав'ярні Львова", content: faker.lorem.paragraphs(5), author_id: editor_user.id, category_id: cat2.id, is_exclusive: false, publication_date: new Date(), status: 'published' },
            { title: "Основи квантових комп'ютерів", content: faker.lorem.paragraphs(5), author_id: editor_user.id, category_id: cat1.id, is_exclusive: true, publication_date: new Date(), status: 'published' },
            { title: "Як доглядати за кросівками", content: faker.lorem.paragraphs(5), author_id: editor_user.id, category_id: cat3.id, is_exclusive: false, publication_date: new Date(), status: 'published' },
            { title: "Чому варто дивитися 'Дюну'", content: faker.lorem.paragraphs(5), author_id: editor_user.id, category_id: cat5.id, is_exclusive: false, publication_date: new Date(), status: 'published' },
        ]);

        await db.Media.bulkCreate([
            {
                url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&q=80',
                type: 'image',
                alt_text: 'Regular image',
                article_id: articles[1].id,
                is_exclusive: false
            },
            {
                url: 'https://images.unsplash.com/photo-1555949963-ff98c877a220?w=500&q=80',
                type: 'image',
                alt_text: 'Exclusive photo 1',
                article_id: articles[1].id,
                is_exclusive: true
            },
            {
                url: 'https://plus.unsplash.com/premium_photo-1678565869434-c81195861939?w=500&q=80',
                type: 'image',
                alt_text: 'Exclusive photo 2',
                article_id: articles[1].id,
                is_exclusive: true
            }
        ]);

        console.log("Створення 2 опитувань...");
        const poll1 = await db.Poll.create({
            question: "Який фреймворк вам подобається більше для фронтенду?",
            is_active: true,
        });

        await db.PollOption.bulkCreate([
            { text: "React", poll_id: poll1.id },
            { text: "Vue", poll_id: poll1.id },
            { text: "Svelte", poll_id: poll1.id }
        ]);

        const poll2 = await db.Poll.create({
            question: "Яку рубрику ви хотіли б бачити частіше?",
            is_active: true
        });

        const poll2_options = await db.PollOption.bulkCreate([
            { text: "Спорт", poll_id: poll2.id },
            { text: "Подорожі", poll_id: poll2.id },
            { text: "Аналітика", poll_id: poll2.id }
        ]);


        await db.Vote.create({
            reader_id: readers[0].id,
            option_id: poll2_options[1].id,
            poll_id: poll2.id
        });

        console.log("Створення 1 тесту...");
        const test1 = await db.Test.create({
            title: "Який ваш стиль подорожей?",
            description: "Дізнайтеся, ви дослідник чи любитель комфорту.",
            image_url: "https://picsum.photos/seed/travelstyle/800/400"
        });

        const q1 = await db.TestQuestion.create({
            text: "Ідеальна відпустка для вас - це:",
            test_id: test1.id
        });
        await db.TestAnswer.bulkCreate([
            { text: "Рюкзак, карта і невідомий маршрут", question_id: q1.id, result_key: 'A' },
            { text: "5-зірковий готель з басейном", question_id: q1.id, result_key: 'B' },
            { text: "Екскурсії по музеях та історичних місцях", question_id: q1.id, result_key: 'C' }
        ]);

        const q2 = await db.TestQuestion.create({
            text: "Що ви оберете на вечерю?",
            test_id: test1.id
        });
        await db.TestAnswer.bulkCreate([
            { text: "Вулична їжа з місцевого ринку", question_id: q2.id, result_key: 'A' },
            { text: "Ресторан з мішленівською зіркою", question_id: q2.id, result_key: 'B' },
            { text: "Традиційна кухня у затишному сімейному кафе", question_id: q2.id, result_key: 'C' }
        ]);

        const q3 = await db.TestQuestion.create({
            text: "Ваш пріоритет у подорожі:",
            test_id: test1.id
        });
        await db.TestAnswer.bulkCreate([
            { text: "Нові враження та пригоди", question_id: q3.id, result_key: 'A' },
            { text: "Максимальний комфорт та розслаблення", question_id: q3.id, result_key: 'B' },
            { text: "Пізнання нової культури та історії", question_id: q3.id, result_key: 'C' }
        ]);

        await db.TestResult.bulkCreate([
            { test_id: test1.id, result_key: 'A', title: "Ви - Дослідник!", description: "Ви обожнюєте пригоди, не боїтеся невідомості і завжди готові до нового. Комфорт для вас - другорядне." },
            { test_id: test1.id, result_key: 'B', title: "Ви - Гедоніст!", description: "Ви цінуєте комфорт понад усе. Відпустка для вас - це час, щоб розслабитися і ні про що не думати." },
            { test_id: test1.id, result_key: 'C', title: "Ви - Інтелектуал!", description: "Подорож для вас - це спосіб пізнання світу. Ви обожнюєте історію, мистецтво та нові знання." }
        ]);

        console.log("Додавання коментарів...");
        await db.Comment.bulkCreate([
            {
                text: "Чудова стаття про Node!",
                article_id: articles[0].id,
                author_id: readers[0].id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                text: "Чекаю на цей альбом!",
                article_id: articles[5].id,
                author_id: readers[1].id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                text: "Був у Азії, підтверджую.",
                article_id: articles[2].id,
                author_id: readers[0].id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                text: "Приємного читання! Чекаємо на ваші думки.",
                article_id: articles[0].id,
                author_id: editor_user.id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                text: "Сподіваємось, ця стаття надихне вас на подорож.",
                article_id: articles[2].id,
                author_id: editor_user.id,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        console.log("Створення партнерських сповіщень...");
        await db.Notification.bulkCreate([
            {
                message: "🔥 Гарячі знижки від наших партнерів! Не пропустіть.",
                type: "promotion",
                link_url: "/",
                user_id: readers[0].id,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                message: "Нова колекція від Бренду X вже доступна.",
                type: "promotion",
                link_url: "/",
                user_id: readers[1].id,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ]);

        console.log("✅ Тестові дані успішно завантажено.");

    } catch (error) {
        console.error('❌ Помилка заповнення БД:', error);
    } finally {
        await db.sequelize.close();
        console.log("Ініціалізацію завершено. З'єднання закрито.");
    }
};

seedDatabase();