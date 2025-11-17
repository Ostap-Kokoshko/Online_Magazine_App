import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import AdminNav from '../../components/AdminNav';
import '../AdminDashboard/AdminDashboard.css';

function TestEditor() {
    const { testId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(testId);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image_url, setImageUrl] = useState('');

    const [results, setResults] = useState([
        { result_key: 'A', title: '', description: '' }
    ]);

    const [questions, setQuestions] = useState([
        { text: '', answers: [{ text: '', result_key: 'A' }] }
    ]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            apiClient.get(`/admin/tests/${testId}`)
                .then(res => {
                    const test = res.data;
                    setTitle(test.title);
                    setDescription(test.description);
                    setImageUrl(test.image_url);
                    setResults(test.results);
                    setQuestions(test.questions);
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    }, [testId, isEditMode]);


    const handleResultChange = (index, field, value) => {
        const newResults = [...results];
        newResults[index][field] = value;
        setResults(newResults);
    };
    const addResult = () => {
        const nextKey = String.fromCharCode(65 + results.length);
        setResults([...results, { result_key: nextKey, title: '', description: '' }]);
    };
    const removeResult = (index) => setResults(results.filter((_, i) => i !== index));


    const handleQuestionChange = (index, value) => {
        const newQuestions = [...questions];
        newQuestions[index].text = value;
        setQuestions(newQuestions);
    };
    const addQuestion = () => {
        setQuestions([...questions, { text: '', answers: [{ text: '', result_key: 'A' }] }]);
    };
    const removeQuestion = (index) => setQuestions(questions.filter((_, i) => i !== index));


    const handleAnswerChange = (qIndex, aIndex, field, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers[aIndex][field] = value;
        setQuestions(newQuestions);
    };
    const addAnswer = (qIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers.push({ text: '', result_key: 'A' });
        setQuestions(newQuestions);
    };
    const removeAnswer = (qIndex, aIndex) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].answers = newQuestions[qIndex].answers.filter((_, i) => i !== aIndex);
        setQuestions(newQuestions);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const testData = { title, description, image_url, questions, results };

        const request = isEditMode
            ? apiClient.put(`/admin/tests/${testId}`, testData)
            : apiClient.post('/admin/tests', testData);

        request
            .then(() => navigate('/admin/tests'))
            .catch(err => alert(err.response?.data?.msg || "Помилка"));
    };

    if (loading) return <p>Завантаження...</p>;

    return (
        <div>
            <AdminNav />
            <h1 className="page-title">{isEditMode ? "Редагувати тест" : "Створити тест"}</h1>

            <form onSubmit={handleSubmit} className="article-editor-form">

                <fieldset className="editor-fieldset">
                    <legend>Основна інформація</legend>
                    <div className="form-group">
                        <label htmlFor="title">Назва тесту:</label>
                        <input type="text" id="title" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="desc">Опис:</label>
                        <input type="text" id="desc" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="img">URL Зображення:</label>
                        <input type="text" id="img" value={image_url} onChange={e => setImageUrl(e.target.value)} />
                    </div>
                </fieldset>

                <fieldset className="editor-fieldset">
                    <legend>Можливі Результати</legend>
                    {results.map((result, rIndex) => (
                        <div key={rIndex} className="nested-item-box">
                            <input
                                type="text"
                                value={result.result_key}
                                onChange={e => handleResultChange(rIndex, 'result_key', e.target.value.toUpperCase())}
                                placeholder="Ключ (A, B...)"
                                style={{ width: '100px', marginRight: '10px' }}
                            />
                            <input
                                type="text"
                                value={result.title}
                                onChange={e => handleResultChange(rIndex, 'title', e.target.value)}
                                placeholder="Назва результату (напр. 'Ви - Дослідник!')"
                                style={{ flex: 1 }}
                            />
                            <textarea
                                value={result.description}
                                onChange={e => handleResultChange(rIndex, 'description', e.target.value)}
                                placeholder="Опис результату"
                                style={{ width: '100%', marginTop: '5px' }}
                                rows={2}
                            />
                            <button type="button" onClick={() => removeResult(rIndex)} className="action-btn delete">X</button>
                        </div>
                    ))}
                    <button type="button" onClick={addResult} className="action-btn edit">+ Додати результат</button>
                </fieldset>

                <fieldset className="editor-fieldset">
                    <legend>Питання</legend>
                    {questions.map((question, qIndex) => (
                        <div key={qIndex} className="nested-item-box question-box">
                            <label>Питання {qIndex + 1}:</label>
                            <input
                                type="text"
                                value={question.text}
                                onChange={e => handleQuestionChange(qIndex, e.target.value)}
                                placeholder="Текст питання"
                            />
                            <button type="button" onClick={() => removeQuestion(qIndex)} className="action-btn delete">Видалити питання</button>

                            <div style={{ paddingLeft: '20px', marginTop: '10px' }}>
                                <label>Відповіді:</label>
                                {question.answers.map((answer, aIndex) => (
                                    <div key={aIndex} style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                                        <input
                                            type="text"
                                            value={answer.text}
                                            onChange={e => handleAnswerChange(qIndex, aIndex, 'text', e.target.value)}
                                            placeholder={`Відповідь ${aIndex + 1}`}
                                            style={{ flex: 1 }}
                                        />
                                        <select
                                            value={answer.result_key}
                                            onChange={e => handleAnswerChange(qIndex, aIndex, 'result_key', e.target.value)}
                                        >
                                            {results.map(r => (
                                                <option key={r.result_key} value={r.result_key}>
                                                    Веде до: {r.result_key} ({r.title || '...'})
                                                </option>
                                            ))}
                                        </select>
                                        <button type="button" onClick={() => removeAnswer(qIndex, aIndex)} className="action-btn delete">X</button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addAnswer(qIndex)} className="action-btn edit">+ Додати відповідь</button>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addQuestion} className="action-btn edit">+ Додати питання</button>
                </fieldset>

                <button type="submit" className="poll-vote-button" style={{fontSize: '1.2rem', marginTop: '20px'}}>
                    {isEditMode ? "Оновити Тест" : "Створити Тест"}
                </button>
            </form>
        </div>
    );
}
export default TestEditor;