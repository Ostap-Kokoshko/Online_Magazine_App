import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './NotificationsPage.css';

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { clearUnreadCount } = useAuth();

    useEffect(() => {
        apiClient.get('/notifications')
            .then(res => {
                setNotifications(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження сповіщень:", err);
                setLoading(false);
            });

        clearUnreadCount();

        apiClient.post('/notifications/read-all')
            .catch(err => console.error("Помилка оновлення статусу:", err));

    }, []);

    if (loading) return <p>Завантаження сповіщень...</p>;

    return (
        <div>
            <h1 className="page-title">Ваші сповіщення</h1>
            <div className="notifications-list">
                {notifications.length === 0 && (
                    <p>У вас поки немає сповіщень.</p>
                )}

                {notifications.map(notif => (
                    <Link
                        to={notif.link_url || '#'}
                        key={notif.id}
                        className="notification-item"
                        style={{ background: notif.is_read ? '#fff' : '#e6f7ff' }}
                    >
                        <span className="notification-type">{notif.type}</span>
                        <p className="notification-message">{notif.message}</p>
                        <span className="notification-date">
                            {new Date(notif.createdAt).toLocaleString()}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
export default NotificationsPage;