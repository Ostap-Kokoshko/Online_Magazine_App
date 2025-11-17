import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import AdminNav from '../components/AdminNav';

function UserEditor() {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('reader');

    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const userData = { username, email, password, role };

        apiClient.post('/admin/users', userData)
            .then(res => {
                alert(`Користувача ${res.data.username} успішно створено!`);
                navigate('/admin/users');
            })
            .catch(err => {
                console.error("Помилка:", err);
                setError(err.response?.data?.msg || "Не вдалося створити користувача");
            });
    };

    return (
        <div>
            <AdminNav />
            <h1 className="page-title">Створити нового користувача</h1>
            <form onSubmit={handleSubmit} className="article-editor-form">

                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Тимчасовий пароль:</label>
                    <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label htmlFor="role">Роль:</label>
                    <select id="role" value={role} onChange={e => setRole(e.target.value)}>
                        <option value="reader">reader</option>
                        <option value="editor">editor</option>
                        <option value="admin">admin</option>
                    </select>
                </div>

                {error && <p style={{color: 'red'}}>{error}</p>}

                <button type="submit" className="poll-vote-button" style={{fontSize: '1.2rem'}}>
                    Створити користувача
                </button>
            </form>
        </div>
    );
}

export default UserEditor;