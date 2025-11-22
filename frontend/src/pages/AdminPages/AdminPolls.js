import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import AdminNav from '../../components/AdminNav';
import '../AdminDashboard/AdminDashboard.css';

function AdminPolls() {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPolls = () => {
        apiClient.get('/admin/polls')
            .then(res => setPolls(res.data))
            .catch(err => console.error("Помилка завантаження опитувань:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadPolls(); }, []);

    const handleDelete = (pollId, question) => {
        if (window.confirm(`Ви впевнені, що хочете видалити опитування: "${question}"?`)) {
            apiClient.delete(`/admin/polls/${pollId}`)
                .then(res => loadPolls())
                .catch(err => alert(err.response?.data?.msg || "Помилка"));
        }
    };

    if (loading) return <p>Завантаження...</p>;

    return (
        <div>
            <AdminNav />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">Керування опитуваннями</h1>
                <Link to="/admin/polls/new" className="poll-vote-button">
                    + Створити нове опитування
                </Link>
            </div>

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Питання</th>
                    <th>Статус</th>
                    <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {polls.map(poll => (
                    <tr key={poll.id}>
                        <td>{poll.id}</td>
                        <td>{poll.question}</td>
                        <td>{poll.is_active ? 'Активне' : 'Неактивне'}</td>
                        <td className="admin-actions">
                            <Link to={`/admin/polls/edit/${poll.id}`} className="action-btn edit">
                                Редагувати
                            </Link>
                            <button
                                onClick={() => handleDelete(poll.id, poll.question)}
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
export default AdminPolls;