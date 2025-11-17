import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
    const { user, logout, unreadCount } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
                <h2>Онлайн-Журнал</h2>
            </Link>
            <ul style={{ listStyle: 'none', display: 'flex' }}>
                <li>
                    <Link to="/" className="nav-link">Головна</Link>
                </li>

                <li>
                    <Link to="/polls" className="nav-link">Опитування</Link>
                </li>

                {user ? (
                    <>
                        {(user.role === 'admin' || user.role === 'editor') && (
                            <li>
                                <Link to="/admin/dashboard" className="nav-link" style={{color: '#f0ad4e'}}>
                                    Адмін-панель
                                </Link>
                            </li>
                        )}

                        <li>
                            <Link to="/notifications" className="nav-link">
                                Сповіщення
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile" className="nav-link">
                                Профіль ({user.username})
                            </Link>
                        </li>
                        <li>
                            <button onClick={handleLogout} className="logout-button">
                                Вийти
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/login" className="nav-link">Логін</Link>
                        </li>
                        <li>
                            <Link to="/register" className="nav-link">Реєстрація</Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;