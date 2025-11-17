import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import './ProfilePage.css';
import '../HomePage/HomePage.css';

function ProfilePage() {
    const { user, updateSubscriptionStatus } = useAuth();

    const [savedArticles, setSavedArticles] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [collections, setCollections] = useState([]);

    const [loading, setLoading] = useState(true);
    const [newCollectionName, setNewCollectionName] = useState("");

    const handleUpgrade = () => {
        if (window.confirm("Ви впевнені, що хочете оновити підписку до Premium?")) {
            apiClient.post("/subscription/upgrade")
                .then(res => {
                    alert(res.data.msg);
                    updateSubscriptionStatus(res.data.newPlan);
                })
                .catch(err => {
                    console.error("Помилка оновлення:", err);
                    alert("Не вдалося оновити підписку.");
                });
        }
    };

    const loadCollections = () => {
        return apiClient.get("/profile/collections")
            .then(res => setCollections(res.data))
            .catch(err => console.error("Помилка завантаження підбірок:", err));
    };

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [savedRes, recRes] = await Promise.all([
                apiClient.get("/profile/saved-articles"),
                apiClient.get("/profile/recommendations"),
                loadCollections()
            ]);
            setSavedArticles(savedRes.data);
            setRecommendations(recRes.data);
        } catch (err) {
            console.error("Помилка завантаження даних профілю:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleRemoveSaved = (articleId) => {
        apiClient.delete(`/profile/saved-articles/${articleId}`)
            .then(() => {
                setSavedArticles(prev => prev.filter(a => a.id !== articleId));
            })
            .catch(err => console.error("Помилка видалення:", err));
    };

    const handleCreateCollection = (e) => {
        e.preventDefault();
        if (!newCollectionName) return;

        apiClient.post("/profile/collections", { name: newCollectionName })
            .then(res => {
                setNewCollectionName("");
                loadCollections();
            })
            .catch(err => console.error("Помилка створення підбірки:", err));
    };

    const handleDeleteCollection = (collectionId) => {
        if (window.confirm("Ви впевнені, що хочете видалити цю підбірку?")) {
            apiClient.delete(`/profile/collections/${collectionId}`)
                .then(res => {
                    loadCollections();
                })
                .catch(err => console.error("Помилка видалення підбірки:", err));
        }
    };

    if (loading) {
        return <p>Завантаження профілю...</p>
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1 className="page-title">Профіль користувача</h1>

            <div className="profile-card">
                <h3>Ваші дані</h3>
                <p><strong>ID:</strong> {user.id}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Роль:</strong> {user.role}</p>
                <p><strong>План:</strong> <span style={{fontWeight: 'bold', color: user.plan === 'Premium' ? 'gold' : 'gray'}}>{user.plan}</span></p>
                {user.plan === 'Free' && (
                    <button
                        className="premium-button"
                        onClick={handleUpgrade}
                    >
                        ⭐ Оновити до Premium
                    </button>
                )}
            </div>

            <h3 style={{ marginTop: "30px" }}>Рекомендації для вас</h3>
            {recommendations.length === 0 && <p>Ми ще не маємо рекомендацій для вас. Збережіть кілька статей!</p>}
            <div className="article-grid">
                <ArticleGrid articles={recommendations} />
            </div>

            <h3 style={{ marginTop: "30px" }}>Ваші підбірки</h3>
            <form onSubmit={handleCreateCollection} style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
                <input
                    type="text"
                    value={newCollectionName}
                    onChange={e => setNewCollectionName(e.target.value)}
                    placeholder="Назва нової підбірки..."
                    style={{ padding: '8px' }}
                />
                <button type="submit" className="poll-vote-button">Створити</button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {collections.length === 0 && <p>Ви ще не створили жодної підбірки.</p>}
                {collections.map(col => (
                    <li key={col.id} className="collection-item">
                        <Link to={`/collection/${col.id}`} style={{ fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
                            {col.name}
                        </Link>

                        <button
                            onClick={() => handleDeleteCollection(col.id)}
                            className="action-btn delete"
                        >
                            Видалити
                        </button>
                    </li>
                ))}
            </ul>

            <h3 style={{ marginTop: "30px" }}>Ваші збережені матеріали</h3>
            {savedArticles.length === 0 && <p>Ви ще не зберегли жодної статті.</p>}
            <div className="article-grid">
                <ArticleGrid articles={savedArticles} onRemove={handleRemoveSaved} />
            </div>
        </div>
    );
}

const ArticleGrid = ({ articles, onRemove }) => {
    return articles.map(article => (
        <div key={article.id} className="article-card">
            <Link to={`/article/${article.id}`}>
                <img
                    src={article.imageUrl}
                    className="article-card-image"
                    alt={article.title}
                />
            </Link>
            {onRemove && (
                <button
                    className="remove-button"
                    onClick={() => onRemove(article.id)}
                >
                    ❌ Видалити
                </button>
            )}
            <div className="article-card-content">
                <h2 className="article-card-title">{article.title}</h2>
                <p className="article-card-meta">{article.category}</p>
                <Link to={`/article/${article.id}`} className="article-card-link">
                    Читати →
                </Link>
            </div>
        </div>
    ));
};

export default ProfilePage;