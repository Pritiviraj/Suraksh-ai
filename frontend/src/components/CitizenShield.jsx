import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'https://suraksh-ai-backend.onrender.com';

const CITY_COORDS = {
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'bengaluru': { lat: 12.9716, lng: 77.5946 },
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 },
  'jaipur': { lat: 26.9124, lng: 75.7873 },
  'lucknow': { lat: 26.8467, lng: 80.9462 },
  'bhopal': { lat: 23.2599, lng: 77.4126 },
  'chandigarh': { lat: 30.7333, lng: 76.7794 },
  'surat': { lat: 21.1702, lng: 72.8311 },
  'patna': { lat: 25.5941, lng: 85.1376 },
  'nagpur': { lat: 21.1458, lng: 79.0882 },
  'indore': { lat: 22.7196, lng: 75.8577 },
  'visakhapatnam': { lat: 17.6868, lng: 83.2185 },
};

const VERDICT_CONFIG = {
  SCAM: { emoji: '🚨', color: '#ef4444', bg: '#450a0a', border: '#ef4444', label: 'SCAM DETECTED' },
  SUSPICIOUS: { emoji: '⚠️', color: '#f59e0b', bg: '#451a03', border: '#f59e0b', label: 'SUSPICIOUS' },
  LEGITIMATE: { emoji: '✅', color: '#22c55e', bg: '#052e16', border: '#22c55e', label: 'LEGITIMATE' }
};

function CitizenShield() {
  const [message, setMessage] = useState('');
  const [city, setCity] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const cityKey = city.toLowerCase().trim();
    const coords = CITY_COORDS[cityKey] || { lat: 0.0, lng: 0.0 };

    try {
      const response = await axios.post(`${API_URL}/analyze`, {
        message: message,
        city: city || 'Unknown',
        lat: coords.lat,
        lng: coords.lng
      });
      setResult(response.data);
    } catch (err) {
      setError('Could not connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessage('');
    setCity('');
    setResult(null);
    setError(null);
  };

  const openReport = () => {
    window.open('https://cybercrime.gov.in', '_blank');
  };

  const config = result ? VERDICT_CONFIG[result.verdict] : null;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#f1f5f9' }}>
          🛡️ Citizen Fraud Shield
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>
          Paste a suspicious message or describe a suspicious call. Get an instant verdict.
        </p>
      </div>

      <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1.5rem', border: '1px solid #334155' }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Paste the suspicious message here, or describe what happened on the call..."
          style={{
            width: '100%',
            minHeight: '150px',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '1rem',
            color: '#f1f5f9',
            fontSize: '0.95rem',
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'Segoe UI, sans-serif'
          }}
        />

        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Your city (e.g. Mumbai, Delhi, Hyderabad)"
          style={{
            width: '100%',
            marginTop: '0.75rem',
            background: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            color: '#f1f5f9',
            fontSize: '0.95rem',
            outline: 'none',
            fontFamily: 'Segoe UI, sans-serif'
          }}
        />

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={handleAnalyze}
            disabled={loading || !message.trim()}
            style={{
              flex: 1,
              padding: '0.85rem',
              background: loading ? '#166534' : '#22c55e',
              color: '#0f172a',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '🔍 Analyzing...' : '🔍 Check for Scam'}
          </button>

          <button
            onClick={handleClear}
            style={{
              padding: '0.85rem 1.5rem',
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#450a0a', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444' }}>
          {error}
        </div>
      )}

      {result && config && (
        <div style={{ marginTop: '1.5rem', background: config.bg, border: `2px solid ${config.border}`, borderRadius: '12px', padding: '1.5rem' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2.5rem' }}>{config.emoji}</span>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: config.color }}>
                {config.label}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Confidence: {result.confidence}% | Type: {result.scam_type}
              </div>
            </div>
          </div>

          <div style={{ background: '#0f172a', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>WHAT THIS IS</div>
            <div style={{ color: '#f1f5f9' }}>{result.explanation}</div>
          </div>

          <div style={{ background: '#0f172a', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.25rem' }}>WHAT YOU SHOULD DO</div>
            <div style={{ color: '#f1f5f9', fontWeight: '600' }}>{result.action}</div>
          </div>

          {result.red_flags && result.red_flags.length > 0 && (
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>RED FLAGS</div>
              {result.red_flags.map((flag, i) => (
                <div key={i} style={{ color: '#ef4444', marginBottom: '0.25rem' }}>• {flag}</div>
              ))}
            </div>
          )}

          {result.campaign && result.campaign.detected && (
            <div style={{ background: '#451a03', border: '1px solid #f59e0b', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', color: '#f59e0b', fontWeight: '600' }}>
              ACTIVE CAMPAIGN: {result.campaign.alert}
            </div>
          )}

          {result.verdict !== 'LEGITIMATE' && (
            <button
              onClick={openReport}
              style={{
                width: '100%',
                padding: '0.85rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#22c55e',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              📝 Report this at cybercrime.gov.in
            </button>
          )}
        </div>
      )}

      {!result && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
            TRY THESE EXAMPLES:
          </div>
          {[
            "This is CBI officer Rajesh Kumar. You are under digital arrest. Transfer Rs 50000 immediately.",
            "Your SBI KYC is expired. Click here or account will be blocked: http://sbi-kyc-update.xyz",
            "Congratulations! You won Rs 10 lakh in KBC lottery. Call 9876543210 to claim."
          ].map((sample, i) => (
            <div
              key={i}
              onClick={() => setMessage(sample)}
              style={{
                padding: '0.75rem 1rem',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                marginBottom: '0.5rem',
                cursor: 'pointer',
                color: '#94a3b8',
                fontSize: '0.9rem'
              }}
            >
              {sample}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CitizenShield;