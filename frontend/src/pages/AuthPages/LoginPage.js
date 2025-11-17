import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/profile";

    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await apiClient.post('/auth/login', {
                username: username,
                password: password,
            });
            const token = response.data.access_token;

            login(token);
            navigate(from, { replace: true });

        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.msg);
            } else {
                setError('Помилка входу. Спробуйте пізніше.');
            }
        }
    };

    return (
        <div className="auth-form">
            <h2>Вхід</h2>
            <form onSubmit={handleSubmit}>

                <div>
                    <label htmlFor="login-username">Username:</label>
                    <input
                        type="text"
                        id="login-username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="login-password">Password:</label>
                    <input
                        type="password"
                        id="login-password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Увійти</button>
            </form>
        </div>
    );
}
export default LoginPage;