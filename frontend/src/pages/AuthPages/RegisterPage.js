import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import './AuthForms.css';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await apiClient.post('/auth/register', {
                username: username,
                email: email,
                password: password,
            });

            setSuccess('Реєстрація успішна! Тепер ви можете увійти.');
            setUsername('');
            setEmail('');
            setPassword('');
            setTimeout(() => navigate('/login'), 2000);

        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.msg);
            } else {
                setError('Помилка реєстрації. Спробуйте пізніше.');
            }
        }
    };

    return (
        <div className="auth-form">
            <h2>Реєстрація</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {success && <p style={{ color: 'green' }}>{success}</p>}
                <button type="submit">Зареєструватися</button>
            </form>
        </div>
    );
}
export default RegisterPage;