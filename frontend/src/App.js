import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage/HomePage';
import ArticlePage from './pages/ArticlePage/ArticlePage';
import LoginPage from './pages/AuthPages/LoginPage';
import RegisterPage from './pages/AuthPages/RegisterPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import CollectionPage from './pages/CollectionPage';
import PollsPage from './pages/PollsPages/PollsPage';
import TestPage from './pages/PollsPages/TestPage';
import CommentsPage from './pages/CommentsPage/CommentsPage';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ArticleEditor from './pages/AdminPages/ArticleEditor';
import AdminPolls from './pages/AdminPages/AdminPolls';
import PollEditor from './pages/AdminPages/PollEditor';
import AdminTests from './pages/AdminPages/AdminTests';
import TestEditor from './pages/AdminPages/TestEditor';
import NotificationsPage from './pages/NotificationsPage/NotificationsPage';
import SuperAdminRoute from './components/SuperAdminRoute';
import AdminUsers from './pages/AdminUsers';
import UserEditor from './pages/UserEditor';

import Navbar from './components/NavBar/Navbar';
import AuthenticatedRoute from './components/AuthenticatedRoute';
import AdminRoute from './components/AdminRoute';

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <div className="container">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/article/:id" element={<ArticlePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/polls" element={<PollsPage />} />
                    <Route path="/test/:testId" element={<TestPage />} />
                    <Route path="/article/:id/comments" element={<CommentsPage />} />

                    <Route
                        path="/profile"
                        element={
                            <AuthenticatedRoute>
                                <ProfilePage />
                            </AuthenticatedRoute>
                        }
                    />
                    <Route
                        path="/collection/:collectionId"
                        element={
                            <AuthenticatedRoute>
                                <CollectionPage />
                            </AuthenticatedRoute>
                        }
                    />

                    <Route
                        path="/notifications"
                        element={<AuthenticatedRoute><NotificationsPage /></AuthenticatedRoute>}
                    />

                    <Route
                        path="/admin/dashboard"
                        element={<AdminRoute><AdminDashboard /></AdminRoute>}
                    />
                    <Route
                        path="/admin/article/new"
                        element={<AdminRoute><ArticleEditor /></AdminRoute>}
                    />
                    <Route
                        path="/admin/article/edit/:articleId"
                        element={<AdminRoute><ArticleEditor /></AdminRoute>}
                    />

                    <Route path="/admin/polls" element={<AdminRoute><AdminPolls /></AdminRoute>} />
                    <Route path="/admin/polls/new" element={<AdminRoute><PollEditor /></AdminRoute>} />
                    <Route path="/admin/polls/edit/:pollId" element={<AdminRoute><PollEditor /></AdminRoute>} />

                    <Route path="/admin/tests" element={<AdminRoute><AdminTests /></AdminRoute>} />
                    <Route path="/admin/tests/new" element={<AdminRoute><TestEditor /></AdminRoute>} />
                    <Route path="/admin/tests/edit/:testId" element={<AdminRoute><TestEditor /></AdminRoute>} />

                    <Route
                        path="/admin/users"
                        element={<SuperAdminRoute><AdminUsers /></SuperAdminRoute>}
                    />
                    <Route
                        path="/admin/users/new"
                        element={<SuperAdminRoute><UserEditor /></SuperAdminRoute>}
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;