import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navButtonStyle = {
    padding: '10px 15px',
    margin: '0 5px',
    borderRadius: '5px',
    textDecoration: 'none',
    color: 'white',
    fontWeight: '600',
    background: '#007bff',
    transition: 'background-color 0.2s'
};

const activeButtonStyle = {
    background: '#0056b3'
};

function AdminNav() {
    const { user } = useAuth();

    return (
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <NavLink
                to="/admin/dashboard"
                style={({ isActive }) => ({
                    ...navButtonStyle,
                    ...(isActive ? activeButtonStyle : null)
                })}
            >
                Керувати Статтями
            </NavLink>
            <NavLink
                to="/admin/polls"
                style={({ isActive }) => ({
                    ...navButtonStyle,
                    ...(isActive ? activeButtonStyle : null)
                })}
            >
                Керувати Опитуваннями
            </NavLink>
            <NavLink
                to="/admin/tests"
                style={({ isActive }) => ({
                    ...navButtonStyle,
                    ...(isActive ? activeButtonStyle : null)
                })}
            >
                Керувати Тестами
            </NavLink>
            {user && user.role === 'admin' && (
                <NavLink
                    to="/admin/users"
                    style={({ isActive }) => ({
                        ...navButtonStyle,
                        background: '#d9534f', 
                        ...(isActive ? activeButtonStyle : null)
                    })}
                >
                    Керувати Користувачами
                </NavLink>
            )}
        </div>
    );
}

export default AdminNav;