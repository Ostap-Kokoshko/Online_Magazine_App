import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import AdminNav from "../../components/AdminNav";
import '../AdminDashboard/AdminDashboard.css';

function ArticleEditor() {
    const { articleId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(articleId);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [premiumContent, setPremiumContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isExclusive, setIsExclusive] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [status, setStatus] = useState('draft');

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const mockCategories = [
            { id: 1, name: "Технології" },
            { id: 2, name: "Подорожі" },
            { id: 3, name: "Мода" },
            { id: 4, name: "Спорт" },
            { id: 5, name: "Культура" },
            { id: 6, name: "Гаджети" },
        ];
        setCategories(mockCategories);

        if (isEditMode) {
            apiClient.get(`/articles/${articleId}`)
                .then(res => {
                    const article = res.data;
                    setTitle(article.title);
                    setContent(article.content);
                    setPremiumContent(article.premium_content || '');
                    setCategoryId(article.category_id || mockCategories[0].id);
                    setIsExclusive(article.isExclusive || false);
                    setIsFeatured(article.is_featured || false);
                    setStatus(article.status || 'draft');
                    setLoading(false);
                })
                .catch(err => console.error("Помилка завантаження статті:", err));
        } else {
            setLoading(false);
        }
    }, [isEditMode, articleId]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const articleData = {
            title, content, premium_content: premiumContent,
            category_id: categoryId, is_exclusive: isExclusive,
            is_featured: isFeatured, status
        };

        const request = isEditMode
            ? apiClient.put(`/articles/${articleId}`, articleData)
            : apiClient.post('/articles', articleData);

        request
            .then(res => {
                alert(`Статтю успішно ${isEditMode ? 'оновлено' : 'створено'}!`);
                navigate('/admin/dashboard');
            })
            .catch(err => {
                console.error("Помилка:", err);
                alert(err.response?.data?.msg || "Не вдалося зберегти статтю");
            });
    };

    if (loading) return <p>Завантаження редактора...</p>;

    return (
        <div>
            <AdminNav />
            <h1 className="page-title">{isEditMode ? "Редагувати статтю" : "Створити статтю"}</h1>
            <form onSubmit={handleSubmit} className="article-editor-form">

                <div className="form-group">
                    <label htmlFor="title">Заголовок:</label>
                    <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Категорія:</label>
                    <select id="category" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="content">Публічний контент (тизер):</label>
                    <textarea id="content" value={content} onChange={e => setContent(e.target.value)} rows="5"></textarea>
                </div>

                <div className="form-group">
                    <label htmlFor="premiumContent">Преміум-контент (повний текст):</label>
                    <textarea id="premiumContent" value={premiumContent} onChange={e => setPremiumContent(e.target.value)} rows="15"></textarea>
                </div>

                <div className="form-group-inline">
                    <div className="form-check">
                        <input type="checkbox" id="isExclusive" checked={isExclusive} onChange={e => setIsExclusive(e.target.checked)} />
                        <label htmlFor="isExclusive">Ексклюзив?</label>
                    </div>
                    <div className="form-check">
                        <input type="checkbox" id="isFeatured" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                        <label htmlFor="isFeatured">Рекомендована?</label>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="status">Статус:</label>
                    <select id="status" value={status} onChange={e => setStatus(e.target.value)}>
                        <option value="draft">Чернетка</option>
                        <option value="published">Опубліковано</option>
                    </select>
                </div>

                <button type="submit" className="poll-vote-button" style={{fontSize: '1.2rem'}}>
                    {isEditMode ? "Оновити статтю" : "Створити статтю"}
                </button>
            </form>
        </div>
    );
}

export default ArticleEditor;