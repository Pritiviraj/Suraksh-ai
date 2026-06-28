import React, { useState } from 'react';
import CitizenShield from './components/CitizenShield';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState('citizen');

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">
          🛡️ <span>SurakshAI</span>
        </div>
        <div className="nav-links">
          <button
            className={activePage === 'citizen' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActivePage('citizen')}
          >
            Citizen Shield
          </button>
          <button
            className={activePage === 'dashboard' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActivePage('dashboard')}
          >
            LE Dashboard
          </button>
        </div>
      </nav>

      <main className="main-content">
        {activePage === 'citizen' && <CitizenShield />}
        {activePage === 'dashboard' && <Dashboard />}
      </main>
    </div>
  );
}

export default App;