import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

const adStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    margin: '20px 0',
    backgroundColor: '#f9f9f9',
    textAlign: 'center'
};
const adTag = {
    fontSize: '0.8rem',
    color: '#888',
    marginBottom: '10px'
};

function AdBanner() {
    const [ad, setAd] = useState(null);

    useEffect(() => {
        apiClient.get('/advertisements/random')
            .then(res => setAd(res.data))
            .catch(err => console.error("Помилка завантаження реклами:", err));
    }, []);

    if (!ad) {
        return null;
    }

    return (
        <div style={adStyle}>
            <p style={adTag}>Реклама від {ad.partnerName}</p>
            <h4>{ad.content}</h4>
        </div>
    );
}

export default AdBanner;