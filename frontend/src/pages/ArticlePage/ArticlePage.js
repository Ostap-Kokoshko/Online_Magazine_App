import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import AdBanner from '../../components/AdBanner';
import AdModal from '../../components/AdModal';
import './ArticlePage.css';

function ArticlePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isAdModalOpen, setIsAdModalOpen] = useState(false);

    const [isSaved, setIsSaved] = useState(false);

    const [showPremium, setShowPremium] = useState(false);

    const [collections, setCollections] = useState([]);
    const [selectedCollection, setSelectedCollection] = useState("");
    const [collectionMessage, setCollectionMessage] = useState("");

    const [commentCount, setCommentCount] = useState(0);

    useEffect(() => {
        setLoading(true);

        const articleRequest = apiClient.get(`/articles/${id}`);
        const commentsRequest = apiClient.get(`/articles/${id}/comments`);

        Promise.all([articleRequest, commentsRequest])
            .then(([articleRes, commentsRes]) => {
                setArticle(articleRes.data);
                setCommentCount(commentsRes.data.length);
                if (user?.plan !== 'Premium') {
                    setIsAdModalOpen(true);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження статті або коментарів:", err);
                if (err.response && err.response.status === 403) {
                    setError("exclusive");
                    setArticle({ title: "Ексклюзивний матеріал" });
                } else {
                    setError("Статтю не знайдено");
                }
                setLoading(false);
            });
    }, [id, user]);

    useEffect(() => {
        if (!user) return;

        apiClient.get("/profile/saved-articles")
            .then(res => {
                const savedIds = res.data.map(a => a.id);
                setIsSaved(savedIds.includes(Number(id)));
            })
            .catch(err => console.error("Помилка перевірки збереження:", err));

        apiClient.get("/profile/collections")
            .then(res => {
                setCollections(res.data);
                if (res.data.length > 0) {
                    setSelectedCollection(res.data[0].id);
                }
            })
            .catch(err => console.error("Помилка завантаження підбірок:", err));

    }, [id, user]);

    const toggleSave = () => {
        if (!user) {
            navigate("/login");
            return;
        }
        const request = isSaved
            ? apiClient.delete(`/profile/saved-articles/${id}`)
            : apiClient.post('/profile/saved-articles', { articleId: Number(id) });

        request
            .then(() => setIsSaved(!isSaved))
            .catch(err => console.error("Помилка збереження:", err));
    };

    const handleAddToCollection = () => {
        if (!selectedCollection) {
            setCollectionMessage("Будь ласка, оберіть підбірку.");
            return;
        }
        apiClient.post('/profile/collections/add-article', {
            collectionId: selectedCollection,
            articleId: Number(id)
        })
            .then(res => {
                setCollectionMessage("✅ Додано!");
                setTimeout(() => setCollectionMessage(""), 2000);
            })
            .catch(err => {
                setCollectionMessage("❌ Помилка (можливо, вже додано).");
                setTimeout(() => setCollectionMessage(""), 2000);
            });
    };

    const handleShare = (platform) => {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(article.title);
        let shareUrl = "";

        switch(platform) {
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`;
                break;
            default:
                return;
        }
        window.open(shareUrl, '_blank', 'noopener,noreferrer');
    };

    const handleLearnMore = () => {
        if (user?.plan === 'Premium') {
            setShowPremium(true);
        } else {
            if (window.confirm("Це ексклюзивний контент. Потрібна Premium-підписка. Перейти до профілю для оновлення?")) {
                navigate('/profile');
            }
        }
    };

    if (loading) return <p>Завантаження статті...</p>;

    if (error === "exclusive") {
        return (
            <div>
                <h1>{article.title}</h1>
                <p>Це ексклюзивний матеріал.</p>
                <p>Щоб отримати доступ — увійдіть або зареєструйтеся.</p>
                <button onClick={() => navigate("/login")}>Увійти</button>
            </div>
        );
    }

    if (error) return <p style={{ color: 'red' }}>{error}</p>;
    if (!article) return null;

    const regularMedia = article.media_files.filter(m => !m.is_exclusive);
    const premiumMedia = article.media_files.filter(m => m.is_exclusive);

    return (
        <div>
            {isAdModalOpen && (
                <AdModal onClose={() => setIsAdModalOpen(false)} />
            )}
            {(!user || user.plan === 'Free') && <AdBanner />}

            <h1>{article.title}</h1>
            <p><strong>Рубрика:</strong> {article.category} | <strong>Автор:</strong> {article.author}</p>

            {user && (
                <div style={{ background: '#f4f4f4', padding: '15px', borderRadius: '8px', margin: '20px 0' }}>
                    <button
                        className="save-button-art"
                        style={{ background: isSaved ? '#d9534f' : '#5cb85c' }}
                        onClick={toggleSave}
                    >
                        {isSaved ? "❤️ Видалити зі збережених" : "🤍 Зберегти"}
                    </button>

                    <hr style={{margin: '15px 0'}} />

                    <label style={{ display: 'block', margin: '5px 0' }}>Додати до підбірки:</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <select
                            value={selectedCollection}
                            onChange={e => setSelectedCollection(e.target.value)}
                            style={{ padding: '8px' }}
                        >
                            {collections.length === 0 && <option>...створіть підбірку в профілі...</option>}
                            {collections.map(col => (
                                <option key={col.id} value={col.id}>{col.name}</option>
                            ))}
                        </select>
                        <button
                            className="poll-vote-button"
                            onClick={handleAddToCollection}
                            disabled={collections.length === 0}
                        >
                            Додати
                        </button>
                    </div>
                    {collectionMessage && <p>{collectionMessage}</p>}
                </div>
            )}

            <hr />
            <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {article.content}
            </p>

            <div className="media-gallery">
                {regularMedia.map(media => (
                    <img key={media.url} src={media.url} alt={media.alt_text} className="article-image" />
                ))}
            </div>

            {article.isExclusive && (
                <div className="premium-content-block">

                    {!showPremium && (
                        <div className="premium-cta">
                            <h3>Це ексклюзивний матеріал</h3>
                            <p>Отримайте повний доступ з підпискою Premium.</p>
                            <button className="premium-button" onClick={handleLearnMore}>
                                Дізнатися більше
                            </button>
                        </div>
                    )}

                    {showPremium && user?.plan === 'Premium' && (
                        <div className="premium-content-unlocked">
                            <hr />
                            <p style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                                {article.premium_content}
                            </p>

                            <h4>Ексклюзивні фото/відео:</h4>
                            <div className="media-gallery">
                                {premiumMedia.map(media => (
                                    <img key={media.url} src={media.url} alt={media.alt_text} className="article-image premium" />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="share-buttons">
                <strong>Поділитися:</strong>
                <button onClick={() => handleShare('facebook')}>Facebook</button>
                <button onClick={() => handleShare('twitter')}>Twitter</button>
                <button onClick={() => handleShare('linkedin')}>LinkedIn</button>
            </div>

            <hr style={{margin: '30px 0'}}/>
            <div className="comments-link-box">
                <h2>Коментарі ({commentCount})</h2>
                <Link to={`/article/${id}/comments`} className="poll-vote-button">
                    Переглянути коментарі та додати свій
                </Link>
            </div>
        </div>
    );
}

export default ArticlePage;