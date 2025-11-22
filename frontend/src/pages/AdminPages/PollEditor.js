import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import AdminNav from '../../components/AdminNav';
import '../AdminDashboard/AdminDashboard.css';

function PollEditor() {
    const { pollId } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(pollId);

    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            setLoading(true);
            apiClient.get(`/admin/polls/${pollId}`)
                .then(res => {
                    setQuestion(res.data.question);
                    setOptions(res.data.options.map(opt => opt.text));
                    setLoading(false);
                })
                .catch(err => console.error(err));
        }
    }, [pollId, isEditMode]);

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, '']);
    const removeOption = (index) => setOptions(options.filter((_, i) => i !== index));

    const handleSubmit = (e) => {
        e.preventDefault();
        const pollData = {
            question,
            options: options.filter(opt => opt.trim() !== '')
        };

        if (pollData.options.length < 2) {
            alert("Опитування повинно мати принаймні 2 варіанти.");
            return;
        }

        const request = isEditMode
            ? apiClient.put(`/admin/polls/${pollId}`, pollData)
            : apiClient.post('/admin/polls', pollData);

        request
            .then(() => navigate('/admin/polls'))
            .catch(err => alert(err.response?.data?.msg || "Помилка"));
    };

    if (loading) return <p>Завантаження...</p>;

    return (
        <div>
            <AdminNav />
            <h1 className="page-title">{isEditMode ? "Редагувати опитування" : "Створити опитування"}</h1>
            <form onSubmit={handleSubmit} className="article-editor-form">
                <div className="form-group">
                    <label htmlFor="question">Питання:</label>
                    <input type="text" id="question" value={question} onChange={e => setQuestion(e.target.value)} required />
                </div>

                <div className="form-group">
                    <label>Варіанти відповідей:</label>
                    {options.map((optionText, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input
                                type="text"
                                value={optionText}
                                onChange={e => handleOptionChange(index, e.target.value)}
                                placeholder={`Варіант ${index + 1}`}
                                style={{ flex: 1 }}
                            />
                            <button type="button" onClick={() => removeOption(index)} className="action-btn delete">X</button>
                        </div>
                    ))}
                    <button type="button" onClick={addOption} className="action-btn edit" style={{marginTop: '10px'}}>
                        + Додати варіант
                    </button>
                </div>

                <button type="submit" className="poll-vote-button" style={{fontSize: '1.2rem'}}>
                    {isEditMode ? "Оновити" : "Створити"}
                </button>
            </form>
        </div>
    );
}
export default PollEditor;