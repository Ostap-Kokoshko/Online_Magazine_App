import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../services/api';
import './HomePage/HomePage.css';

function CollectionPage() {
    const { collectionId } = useParams();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiClient.get(`/profile/collections/${collectionId}`)
            .then(res => {
                setCollection(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження підбірки:", err);
                setLoading(false);
            });
    }, [collectionId]);

    if (loading) return <p>Завантаження підбірки...</p>;
    if (!collection) return <p>Підбірку не знайдено.</p>;

    return (
        <div>
            <h1 className="page-title">Підбірка: {collection.name}</h1>

            {collection.articles.length === 0 && (
                <p>У цій підбірці ще немає статей.</p>
            )}

            <div className="article-grid">
                {collection.articles.map(article => (
                    <div key={article.id} className="article-card">
                        <Link to={`/article/${article.id}`}>
                            <img
                                src={article.imageUrl}
                                className="article-card-image"
                                alt={article.title}
                            />
                        </Link>
                        <div className="article-card-content">
                            <h2 className="article-card-title">{article.title}</h2>
                            <p className="article-card-meta">{article.category}</p>
                            <Link to={`/article/${article.id}`} className="article-card-link">
                                Читати →
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CollectionPage;