import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import AdminNav from '../../components/AdminNav';
import './AdminDashboard.css';

function AdminDashboard() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Завантажуємо ВСІ статті (включаючи чернетки)
    const loadArticles = () => {
        setLoading(true);
        apiClient.get('/articles-admin') // Новий API-маршрут
            .then(res => {
                setArticles(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження статей:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        loadArticles();
    }, []);

    // Обробник видалення
    const handleDelete = (articleId, title) => {
        if (window.confirm(`Ви впевнені, що хочете видалити статтю: "${title}"?`)) {
            apiClient.delete(`/articles/${articleId}`)
                .then(res => {
                    // Оновлюємо список, видаливши статтю
                    setArticles(prev => prev.filter(a => a.id !== res.data.articleId));
                })
                .catch(err => {
                    console.error("Помилка видалення:", err);
                    alert(err.response?.data?.msg || "Не вдалося видалити статтю");
                });
        }
    };

    if (loading) return <p>Завантаження панелі...</p>;

    return (
        <div>
            <AdminNav />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">Керування статтями</h1>
                <Link to="/admin/article/new" className="poll-vote-button">
                    + Створити нову статтю
                </Link>
            </div>

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Заголовок</th>
                    <th>Статус</th>
                    <th>Автор</th>
                    <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {articles.map(article => (
                    <tr key={article.id}>
                        <td>{article.id}</td>
                        <td>{article.title}</td>
                        <td>
                                <span className={`status-badge ${article.status}`}>
                                    {article.status}
                                </span>
                        </td>
                        <td>{article.author.username}</td>
                        <td className="admin-actions">
                            <Link to={`/admin/article/edit/${article.id}`} className="action-btn edit">
                                Редагувати
                            </Link>
                            <button
                                onClick={() => handleDelete(article.id, article.title)}
                                className="action-btn delete"
                            >
                                Видалити
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
export default AdminDashboard;