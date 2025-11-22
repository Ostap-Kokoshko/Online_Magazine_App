import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './CommentsPage.css';

function CommentsPage() {
    const { id: articleId } = useParams();
    const { user } = useAuth();

    const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [commentError, setCommentError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            apiClient.get(`/articles/${articleId}`),
            apiClient.get(`/articles/${articleId}/comments`)
        ])
            .then(([articleRes, commentsRes]) => {
                setArticle(articleRes.data);
                setComments(commentsRes.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження:", err);
                setLoading(false);
            });
    }, [articleId]);

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        setCommentError("");
        if (!newComment.trim()) {
            setCommentError("Коментар не може бути порожнім");
            return;
        }

        apiClient.post(`/articles/${articleId}/comments`, { text: newComment })
            .then(res => {
                setComments([res.data, ...comments]);
                setNewComment("");
            })
            .catch(err => {
                const msg = err.response?.data?.msg || "Помилка відправки";
                setCommentError(msg);
            });
    };

    const handleDeleteComment = (commentId) => {
        if (window.confirm("Ви впевнені, що хочете видалити цей коментар?")) {
            apiClient.delete(`/articles/${articleId}/comments/${commentId}`)
                .then(res => {
                    setComments(prevComments =>
                        prevComments.filter(comment => comment.id !== res.data.commentId)
                    );
                })
                .catch(err => {
                    alert(err.response?.data?.msg || "Помилка видалення");
                });
        }
    };

    if (loading) return <p>Завантаження коментарів...</p>;
    if (!article) return <p>Статтю не знайдено.</p>;

    return (
        <div>
            <p><Link to={`/article/${articleId}`}>← Повернутися до статті</Link></p>
            <h1 className="page-title">Коментарі до статті: "{article.title}"</h1>

            {user ? (
                <form onSubmit={handleCommentSubmit} className="comment-form">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={`Що ви думаєте, ${user.username}?`}
                    />
                    <button type="submit">Надіслати</button>
                    {commentError && <p style={{color: 'red', margin: '5px 0 0 0'}}>{commentError}</p>}
                </form>
            ) : (
                <p>Будь ласка, <Link to="/login">увійдіть</Link>, щоб залишити коментар.</p>
            )}

            <div className="comments-list">
                {comments.length === 0 && !loading && (
                    <p>Ще немає коментарів. Будьте першим!</p>
                )}
                {comments.map(comment => (
                    <div key={comment.id} className="comment-item">
                        <div className="comment-header">
                            <p className="comment-author">
                                <strong>{comment.author ? comment.author.username : "Анонім"}</strong>
                                <span> • {new Date(comment.createdAt).toLocaleString()}</span>
                            </p>

                            {user && comment.author && user.id === comment.author.id && (
                                <button
                                    className="comment-delete-btn"
                                    onClick={() => handleDeleteComment(comment.id)}
                                >
                                    Видалити
                                </button>
                            )}
                        </div>
                        <p className="comment-text">{comment.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CommentsPage;