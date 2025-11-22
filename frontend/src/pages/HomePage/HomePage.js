import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdBanner from '../../components/AdBanner';
import './HomePage.css';

function HomePage() {
    const [featuredArticle, setFeaturedArticle] = useState(null);
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const loadPageData = async () => {
            setLoading(true);
            try {
                const [featuredRes, articlesRes] = await Promise.all([
                    apiClient.get('/articles/featured'),
                    apiClient.get('/articles')
                ]);

                setFeaturedArticle(featuredRes.data);
                setArticles(articlesRes.data);

            } catch (error) {
                console.error("Помилка завантаження статей:", error);
                apiClient.get('/articles')
                    .then(res => setArticles(res.data))
                    .catch(err => console.error("Помилка завантаження звичайних статей:", err));
            }
            setLoading(false);
        };

        loadPageData();
    }, [user]);

    const handleSaveClick = (e, articleId, isSaved) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            alert("Будь ласка, увійдіть, щоб зберегти статтю.");
            return;
        }
        const request = isSaved
            ? apiClient.delete(`/profile/saved-articles/${articleId}`)
            : apiClient.post('/profile/saved-articles', { articleId });
        request
            .then(() => {
                setArticles(prevArticles =>
                    prevArticles.map(article =>
                        article.id === articleId
                            ? { ...article, isSaved: !isSaved }
                            : article
                    )
                );
            })
            .catch(err => {
                console.error("Помилка збереження:", err);
                alert("Не вдалося зберегти статтю.");
            });
    };

    if (loading) return <p>Завантаження...</p>;

    return (
        <div>
            {(!user || user.plan === 'Free') && <AdBanner />}
            {featuredArticle && (
                <Link to={`/article/${featuredArticle.id}`} className="featured-issue">
                    <img
                        src={featuredArticle.imageUrl}
                        alt={featuredArticle.title}
                        className="featured-image"
                    />
                    <div className="featured-content">
                        <span className="featured-tag">Спеціальний випуск</span>
                        <h1 className="featured-title">{featuredArticle.title}</h1>
                        <p className="featured-meta">
                            {featuredArticle.category} // {featuredArticle.author}
                        </p>
                    </div>
                </Link>
            )}

            <h1 className="page-title" style={{marginTop: '40px'}}>
                Останні статті
            </h1>

            <div className="article-grid">
                {articles.map(article => (
                    <Link to={`/article/${article.id}`} key={article.id} className="article-card">
                        <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="article-card-image"
                        />
                        {user && (
                            <button
                                className="save-button"
                                onClick={(e) => handleSaveClick(e, article.id, article.isSaved)}
                            >
                                {article.isSaved ? '❤️ Збережено' : '🤍 Зберегти'}
                            </button>
                        )}
                        <div className="article-card-content">
                            <h2 className="article-card-title">
                                {article.title} {article.isExclusive && " (Ексклюзив)"}
                            </h2>
                            <p className="article-card-meta">
                                {article.category} // {article.author}
                            </p>
                            <span className="article-card-link">Читати далі →</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default HomePage;