import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import AdminNav from '../../components/AdminNav';
import '../AdminDashboard/AdminDashboard.css';

function AdminTests() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadTests = () => {
        apiClient.get('/admin/tests')
            .then(res => setTests(res.data))
            .catch(err => console.error("Помилка завантаження тестів:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadTests(); }, []);

    const handleDelete = (testId, title) => {
        if (window.confirm(`Ви впевнені, що хочете видалити тест: "${title}"?`)) {
            apiClient.delete(`/admin/tests/${testId}`)
                .then(res => loadTests())
                .catch(err => alert(err.response?.data?.msg || "Помилка"));
        }
    };

    if (loading) return <p>Завантаження...</p>;

    return (
        <div>
            <AdminNav />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">Керування тестами</h1>
                <Link to="/admin/tests/new" className="poll-vote-button">
                    + Створити новий тест
                </Link>
            </div>

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Назва тесту</th>
                    <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {tests.map(test => (
                    <tr key={test.id}>
                        <td>{test.id}</td>
                        <td>{test.title}</td>
                        <td className="admin-actions">
                            <Link to={`/admin/tests/edit/${test.id}`} className="action-btn edit">
                                Редагувати
                            </Link>
                            <button
                                onClick={() => handleDelete(test.id, test.title)}
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
export default AdminTests;