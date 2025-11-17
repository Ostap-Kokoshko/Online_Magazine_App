import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

function AdModal({ onClose }) {
    const [ad, setAd] = useState(null);

    useEffect(() => {
        apiClient.get('/advertisements/random')
            .then(res => setAd(res.data))
            .catch(err => console.error("Помилка завантаження реклами:", err));
    }, []);

    return (
        <div className="modal-overlay" onClick={onClose}>

            <div className="modal-content" onClick={(e) => e.stopPropagation()}>

                <button className="modal-close-btn" onClick={onClose}>
                    &times;
                </button>

                {ad ? (
                    <div>
                        <p className="modal-ad-tag">Реклама від {ad.partnerName}</p>
                        <h3 className="modal-ad-content">{ad.content}</h3>
                        <p>Дякуємо, що підтримуєте наш журнал!</p>
                    </div>
                ) : (
                    <p>Завантаження реклами...</p>
                )}

            </div>
        </div>
    );
}

export default AdModal;