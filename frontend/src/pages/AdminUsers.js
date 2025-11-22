import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import AdminNav from '../components/AdminNav';
import { useAuth } from '../context/AuthContext';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: adminUser } = useAuth();

    const loadUsers = () => {
        setLoading(true);
        apiClient.get('/admin/users')
            .then(res => setUsers(res.data))
            .catch(err => console.error("Помилка завантаження користувачів:", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { loadUsers(); }, []);

    const handleDelete = (userId, username) => {
        if (userId === adminUser.id) {
            alert("Ви не можете видалити самі себе.");
            return;
        }
        if (window.confirm(`Ви впевнені, що хочете видалити: "${username}"?`)) {
            apiClient.delete(`/admin/users/${userId}`)
                .then(res => loadUsers())
                .catch(err => alert(err.response?.data?.msg || "Помилка"));
        }
    };

    const handleRoleChange = (userId, newRole) => {
        apiClient.put(`/admin/users/${userId}/role`, { role: newRole })
            .then(res => loadUsers())
            .catch(err => alert(err.response?.data?.msg || "Помилка"));
    };

    const handlePlanChange = (userId, newPlan) => {
        apiClient.put(`/admin/users/${userId}/subscription`, { planName: newPlan })
            .then(res => loadUsers())
            .catch(err => alert(err.response?.data?.msg || "Помилка"));
    };

    if (loading) return <p>Завантаження...</p>;

    return (
        <div>
            <AdminNav />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">Керування користувачами</h1>
                <Link to="/admin/users/new" className="poll-vote-button">
                    + Додати користувача
                </Link>
            </div>

            <p>Всього користувачів: {users.length}</p>

            <table className="admin-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Роль</th>
                    <th>План</th>
                    <th>Дії</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                            <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                disabled={user.id === adminUser.id}
                            >
                                <option value="reader">reader</option>
                                <option value="editor">editor</option>
                                <option value="admin">admin</option>
                            </select>
                        </td>
                        <td>
                            <select
                                value={user.plan}
                                onChange={(e) => handlePlanChange(user.id, e.target.value)}
                                disabled={user.role !== 'reader'}
                            >
                                <option value="Free">Free</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </td>
                        <td className="admin-actions">
                            {user.id !== adminUser.id && (
                                <button
                                    onClick={() => handleDelete(user.id, user.username)}
                                    className="action-btn delete"
                                >
                                    Видалити
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
export default AdminUsers;