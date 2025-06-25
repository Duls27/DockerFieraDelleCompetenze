import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import logo from './logo.png';
import agesciLomLogo from './agescilom.png';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalitaFiera, setModalitaFiera] = useState(false);

  useEffect(() => {
    const fetchConfigurazione = async () => {
      try {
        const response = await axios.get(`${API_BASE}/configurazione`);
        setModalitaFiera(response.data.modalita_fiera);
      } catch (error) {
        console.error('Errore nel recupero configurazione:', error);
      }
    };

    fetchConfigurazione();
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#d4edda' }}>
      {/* Sidebar */}
      <nav
        className={`bg-success text-white p-3 flex-shrink-0 sidebar ${sidebarOpen ? 'd-block' : 'd-none d-md-block'}`}
        style={{ 
          width: '250px', 
          display: 'flex', 
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <h3 className="text-center mb-4">Menu</h3>

        <div className="d-flex flex-column gap-3">
          <Link to="/admin/login" className="btn btn-light d-flex align-items-center gap-2">
            🔒 <span>Amministrazione</span>
          </Link>

          <Link to="/registrazione" className="btn btn-light d-flex align-items-center gap-2">
            📝 <span>Registrazione</span>
          </Link>

          {/* Bottone modificato: Come Usare l'App al posto di Manuale */}
          <Link to="/come-funziona" className="btn btn-light d-flex align-items-center gap-2">
            📚 <span>Come Usare l'App</span>
          </Link>
        </div>

        {/* Bottone chiudi sidebar solo su mobile */}
        <button
          className="btn btn-danger mt-auto d-md-none"
          onClick={() => setSidebarOpen(false)}
        >
          Chiudi Menu
        </button>

        {/* Logo Agesci Lombardia in basso a sinistra */}
        <div style={{ position: 'absolute', bottom: 16, left: 16 }}>
          <img
            src={agesciLomLogo}
            alt="Agesci Lombardia"
            style={{ width: 150, height: 'auto', objectFit: 'contain' }}
          />
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-grow-1 p-4">
        {/* Bottone apri sidebar solo su mobile */}
        {!sidebarOpen && (
          <button
            className="btn btn-success mb-3 d-md-none"
            onClick={() => setSidebarOpen(true)}
          >
            ☰ Menu
          </button>
        )}

        {/* Header con logo e titolo */}
        <div className="text-center mb-5">
          <img
            src={logo}
            alt="Logo"
            style={{ width: '300px', height: '300px', objectFit: 'contain' }}
            className="mb-3"
          />
          <h1 className="fw-bold text-success">Fiera delle Competenze</h1>
        </div>

        {/* Pulsanti votazione */}
        <div className="d-flex flex-column gap-4 mx-auto" style={{ maxWidth: '320px' }}>
          <Link
            to="/vota/ospiti"
            className="btn btn-warning btn-lg fw-bold text-success d-flex align-items-center justify-content-center gap-2"
            style={{
              pointerEvents: modalitaFiera ? 'auto' : 'none',
              opacity: modalitaFiera ? 1 : 0.5,
              userSelect: modalitaFiera ? 'auto' : 'none',
            }}
          >
            ⭐ <span>Votazione&nbsp;E/G</span>
          </Link>

          <Link
            to="/vota/capi"
            className="btn btn-warning btn-lg fw-bold text-success d-flex align-items-center justify-content-center gap-2"
            style={{
              pointerEvents: modalitaFiera ? 'auto' : 'none',
              opacity: modalitaFiera ? 1 : 0.5,
              userSelect: modalitaFiera ? 'auto' : 'none',
            }}
          >
            🏆 <span>Votazione&nbsp;Capi</span>
          </Link>

          <Link
            to="/lista/stand"
            className="btn btn-warning btn-lg fw-bold text-success d-flex align-items-center justify-content-center gap-2"
            style={{
              pointerEvents: modalitaFiera ? 'auto' : 'none',
              opacity: modalitaFiera ? 1 : 0.5,
              userSelect: modalitaFiera ? 'auto' : 'none',
            }}
          >
            📋 <span>Lista Stand</span>
          </Link>
        </div>

        {!modalitaFiera && (
          <p className="mt-4 text-center text-muted">
            La modalità fiera non è ancora attiva. Le votazioni sono disabilitate.
          </p>
        )}
      </div>
    </div>
  );
};

export default Home;
