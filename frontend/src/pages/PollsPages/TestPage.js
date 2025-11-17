import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import './PollsPage.css';

function TestPage() {
    const { testId } = useParams();
    const [test, setTest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null);

    useEffect(() => {
        setLoading(true);
        apiClient.get(`/tests/${testId}`)
            .then(res => {
                setTest(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Помилка завантаження тесту:", err);
                setLoading(false);
            });
    }, [testId]);


    const handleAnswerSelect = (questionId, answerId) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerId
        }));
    };


    const handleSubmit = () => {
        if (Object.keys(answers).length !== test.questions.length) {
            alert("Будь ласка, дайте відповідь на всі питання.");
            return;
        }

        apiClient.post(`/tests/${testId}/submit`, { answers })
            .then(res => {
                setResult(res.data);
            })
            .catch(err => {
                console.error("Помилка відправки тесту:", err);
                alert("Не вдалося отримати результат.");
            });
    };


    if (loading) return <p>Завантаження тесту...</p>;
    if (!test) return <p>Тест не знайдено.</p>;


    if (result) {
        return (
            <div className="test-result-card">
                <h2>{result.title}</h2>
                <p>{result.description}</p>
                <button
                    className="poll-vote-button"
                    onClick={() => {
                        setResult(null);
                        setAnswers({});
                    }}
                >
                    Пройти ще раз
                </button>
            </div>
        );
    }


    return (
        <div>
            <h1 className="page-title">{test.title}</h1>
            <p>{test.description}</p>
            <hr />

            <div className="test-questions-container">
                {test.questions.map(q => (
                    <div key={q.id} className="test-question-card">
                        <h3>{q.text}</h3>
                        <div className="poll-options">
                            {q.answers.map(a => (
                                <label key={a.id} className="poll-option-label">
                                    <input
                                        type="radio"
                                        name={`question-${q.id}`}
                                        value={a.id}
                                        checked={answers[q.id] === a.id}
                                        onChange={() => handleAnswerSelect(q.id, a.id)}
                                    />
                                    {a.text}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <button
                className="poll-vote-button"
                style={{fontSize: '1.2rem', padding: '15px 30px', marginTop: '20px'}}
                onClick={handleSubmit}
            >
                Отримати результат
            </button>
        </div>
    );
}

export default TestPage;