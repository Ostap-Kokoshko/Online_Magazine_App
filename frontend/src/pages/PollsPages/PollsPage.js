import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './PollsPage.css';

function PollsPage() {
    const [polls, setPolls] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [error, setError] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [pollsRes, testsRes] = await Promise.all([
                    apiClient.get('/polls'),
                    apiClient.get('/tests')
                ]);
                setPolls(pollsRes.data);
                setTests(testsRes.data);
            } catch (err) {
                console.error("Помилка завантаження:", err);
                setError("Не вдалося завантажити дані.");
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const handleOptionChange = (pollId, optionId) => {
        setSelectedOptions(prev => ({
            ...prev,
            [pollId]: optionId
        }));
    };

    const handleVote = (pollId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const optionId = selectedOptions[pollId];
        if (!optionId) {
            alert("Будь ласка, оберіть варіант.");
            return;
        }

        apiClient.post(`/polls/${pollId}/vote`, { optionId })
            .then(res => {
                setPolls(res.data);
            })
            .catch(err => {
                const errorMsg = err.response?.data?.msg || "Помилка голосування";
                setError(errorMsg);
                apiClient.get('/polls').then(res => setPolls(res.data));
            });
    };

    if (loading) return <p>Завантаження опитувань...</p>;

    return (
        <div>
            <h1 className="page-title">Інтерактив</h1>
            {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

            <h2>Психологічні тести</h2>
            <div className="tests-container">
                {tests.map(test => (
                    <Link to={`/test/${test.id}`} key={test.id} className="test-card">
                        <img src={test.image_url} alt={test.title} className="test-card-image" />
                        <div className="test-card-content">
                            <h3>{test.title}</h3>
                            <p>{test.description}</p>
                            <span>Пройти тест →</span>
                        </div>
                    </Link>
                ))}
            </div>

            <hr style={{margin: '40px 0'}} />

            <h2>Опитування та голосування</h2>
            <div className="polls-container">
                {polls.map(poll => (
                    <div key={poll.id} className="poll-card">
                        <h3>{poll.question}</h3>
                        {poll.hasVoted ? (
                            <div className="poll-results">
                                {poll.options.map(option => (
                                    <div key={option.id} className="poll-result-bar">
                                        <div
                                            className="poll-result-fill"
                                            style={{ width: `${option.percentage}%` }}
                                        ></div>
                                        <span className="poll-result-text">
                                            {option.text} ({option.percentage}%)
                                        </span>
                                    </div>
                                ))}
                                <p className="poll-total-votes">Всього голосів: {poll.totalVotes}</p>
                            </div>
                        ) : (
                            <div className="poll-options">
                                {poll.options.map(option => (
                                    <label key={option.id} className="poll-option-label">
                                        <input
                                            type="radio"
                                            name={`poll-${poll.id}`}
                                            value={option.id}
                                            checked={selectedOptions[poll.id] === option.id}
                                            onChange={() => handleOptionChange(poll.id, option.id)}
                                        />
                                        {option.text}
                                    </label>
                                ))}
                                <button
                                    className="poll-vote-button"
                                    onClick={() => handleVote(poll.id)}
                                >
                                    Проголосувати
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
export default PollsPage;