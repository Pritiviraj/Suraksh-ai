import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API_URL = 'https://suraksh-ai-backend.onrender.com';

const SCAM_COLORS = {
  digital_arrest: '#ef4444',
  kyc_fraud: '#f59e0b',
  lottery: '#8b5cf6',
  courier: '#3b82f6',
  otp_theft: '#ec4899',
  investment: '#f97316',
  other: '#94a3b8',
  none: '#94a3b8'
};

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchReports();
    const interval = setInterval(fetchReports, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports`);
      const data = response.data;
      setReports(data);
      calculateStats(data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const total = data.length;
    const scams = data.filter(r => r.verdict === 'SCAM').length;
    const suspicious = data.filter(r => r.verdict === 'SUSPICIOUS').length;
    const types = {};
    data.forEach(r => {
      if (r.scam_type && r.scam_type !== 'none') {
        types[r.scam_type] = (types[r.scam_type] || 0) + 1;
      }
    });
    const topType = Object.entries(types).sort((a, b) => b[1] - a[1])[0];
    setStats({ total, scams, suspicious, topType: topType ? topType[0] : 'N/A' });
  };

  const filteredReports = filter === 'ALL'
    ? reports
    : reports.filter(r => r.verdict === filter);

  const mapReports = reports.filter(r => r.lat !== 0 && r.lng !== 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#f1f5f9' }}>
          🗺️ Law Enforcement Intelligence Dashboard
        </h1>
        <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>
          Real-time scam reports aggregated from citizen submissions. Auto-refreshes every 30 seconds.
        </p>
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {[
          { label: 'Total Reports', value: stats.total || 0, color: '#f1f5f9' },
          { label: 'Confirmed Scams', value: stats.scams || 0, color: '#ef4444' },
          { label: 'Suspicious', value: stats.suspicious || 0, color: '#f59e0b' },
          { label: 'Top Scam Type', value: stats.topType?.replace('_', ' ') || 'N/A', color: '#8b5cf6' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            padding: '1.25rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: stat.color }}>
              {stat.value}
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Map */}
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
          GEOSPATIAL SCAM HEATMAP — Reports with location data
        </div>
        <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© OpenStreetMap contributors'
            />
            {mapReports.map((report, i) => (
              <CircleMarker
                key={i}
                center={[report.lat, report.lng]}
                radius={10}
                fillColor={SCAM_COLORS[report.scam_type] || '#94a3b8'}
                color={SCAM_COLORS[report.scam_type] || '#94a3b8'}
                fillOpacity={0.8}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <strong>{report.verdict}</strong> — {report.scam_type?.replace('_', ' ')}<br />
                    <small>{report.city}</small><br />
                    <small>{new Date(report.timestamp).toLocaleString('en-IN')}</small><br />
                    <hr />
                    <small>{report.message?.slice(0, 100)}...</small>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        {mapReports.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
            No location-tagged reports yet. Reports with city data will appear here.
          </div>
        )}
      </div>

      {/* Filter + Reports Table */}
      <div style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: '12px',
        padding: '1rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
            RECENT REPORTS — {filteredReports.length} shown
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {['ALL', 'SCAM', 'SUSPICIOUS', 'LEGITIMATE'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: '0.35rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  background: filter === f ? '#22c55e' : 'transparent',
                  color: filter === f ? '#0f172a' : '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: filter === f ? '700' : '400'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
            Loading reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
            No reports found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['Time', 'Verdict', 'Type', 'City', 'Message Preview', 'Red Flags'].map(h => (
                    <th key={h} style={{
                      padding: '0.75rem',
                      textAlign: 'left',
                      color: '#64748b',
                      fontWeight: '600',
                      fontSize: '0.8rem'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report, i) => (
                  <tr key={i} style={{
                    borderBottom: '1px solid #1e293b',
                    background: i % 2 === 0 ? '#0f172a' : 'transparent'
                  }}>
                    <td style={{ padding: '0.75rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(report.timestamp).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        background: report.verdict === 'SCAM' ? '#450a0a' :
                          report.verdict === 'SUSPICIOUS' ? '#451a03' : '#052e16',
                        color: report.verdict === 'SCAM' ? '#ef4444' :
                          report.verdict === 'SUSPICIOUS' ? '#f59e0b' : '#22c55e'
                      }}>
                        {report.verdict}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>
                      {report.scam_type?.replace('_', ' ')}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#94a3b8' }}>
                      {report.city || '—'}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#94a3b8', maxWidth: '250px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {report.message?.slice(0, 60)}...
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#ef4444', fontSize: '0.8rem' }}>
                      {Array.isArray(report.red_flags)
                        ? report.red_flags.slice(0, 2).join(', ')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;