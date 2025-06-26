import React, { useEffect, useState } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import Cerca from './Cerca';
import ApprovazioneOspiti from './ApprovazioneOspiti';
import Settings from './Settings';
import RisultatiLive from './RisultatiLive';
import GestioneComunicazioni from './GestioneComunicazioni';

const Admin = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(open => !open);
  };

  // Menu principale della sidebar
  const menuItems = [
    { to: '/admin/cerca', icon: '🔍', label: 'Cerca' },
    { to: '/admin/approvazione-ospiti', icon: '🧑‍🤝‍🧑', label: 'Approvazione Ospiti' },
    { to: '/admin/risultati-live', icon: '📊', label: 'Risultati Live' },
    { to: '/admin/notizie', icon: '📰', label: 'Comunicazioni' }, // (già presente)
    { to: '/admin/settings', icon: '⚙️', label: 'Impostazioni' },
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#d4edda' }}>
      {/* Sidebar */}
      <nav
        className="bg-success text-white d-flex flex-column"
        style={{
          width: sidebarOpen ? 250 : 60,
          transition: 'width 0.3s',
          overflowX: 'hidden',
          position: 'relative',
          padding: '1rem 0.5rem',
        }}
      >
        {/* Bottone hamburger */}
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? 'Chiudi menu' : 'Apri menu'}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#155724',
            fontSize: '1.8rem',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '1rem',
            alignSelf: 'center',
            lineHeight: 1,
          }}
        >
          ☰
        </button>

        {/* Home Admin */}
        <Link
          to="/admin"
          className="d-flex align-items-center justify-content-center mb-4"
          title="Home Admin"
          style={{
            color: '#fff',
            textDecoration: 'none',
            fontWeight: '700',
            fontSize: '1rem',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '1.4rem' }}>🏠</span>
          {sidebarOpen && <span style={{ marginLeft: 10 }}>Home Admin</span>}
        </Link>

        <div className="d-flex flex-column flex-grow-1" style={{ gap: '1rem', alignItems: 'center' }}>
          {/* Link principali */}
          {menuItems.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              title={label}
              className="d-flex align-items-center justify-content-center"
              style={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '1.1rem',
                userSelect: 'none',
                width: '100%',
                padding: '0.4rem 0',
                borderRadius: 4,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{icon}</span>
              {sidebarOpen && <span style={{ marginLeft: 10 }}>{label}</span>}
            </Link>
          ))}

          {/* Bottone Esci */}
          <button
            onClick={handleLogout}
            title="Esci"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '1.1rem',
              cursor: 'pointer',
              padding: '0.4rem 0',
              borderRadius: 4,
              width: '100%',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 'auto',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span style={{ fontSize: '1.5rem', lineHeight: 1, marginRight: sidebarOpen ? 10 : 0 }}>🚪</span>
            {sidebarOpen && <span>Esci</span>}
          </button>
        </div>
      </nav>

      {/* Contenuto principale */}
      <div className="p-4 flex-grow-1">
        <Routes>
          <Route path="cerca" element={<Cerca />} />
          <Route path="approvazione-ospiti" element={<ApprovazioneOspiti />} />
          <Route path="risultati-live" element={<RisultatiLive />} />
          <Route path="notizie" element={<GestioneComunicazioni />} />
          <Route path="settings" element={<Settings />} />
          <Route
            path=""
            element={
              <div className="text-center mt-5">
                <h2 className="text-success mb-4">Benvenuto nell'area amministratori</h2>
                <p className="text-muted mb-4">
                  Usa il menu laterale per navigare tra le funzionalità principali.
                </p>

                <div style={{ maxWidth: 650, margin: '0 auto', textAlign: 'left' }}>
                  {/* 🔍 Cerca */}
                  <h4>🔍 Cerca</h4>
                  <p>
                    <ul>
                      <li>Effettua ricerche lampo tra <strong>utenti</strong>, <strong>stand</strong>, <strong>votazioni</strong> e altri dati archiviati.</li>
                      <li>Filtra i risultati per <em>zona</em>, <em>gruppo</em> con un click.</li>
                    </ul>
                  </p>

                  {/* 🧑‍🤝‍🧑 Approvazione Ospiti */}
                  <h4>🧑‍🤝‍🧑 Approvazione Ospiti</h4>
                  <p>
                    <ul>
                      <li>Gestisci le richieste di registrazione degli ospiti in stato <strong>pending</strong>:
                        <ul>
                          <li><strong>Approva</strong> per generare automaticamente i codici di voto e inviare l’e-mail.</li>
                          <li><strong>Elimina</strong> per cancellare la richiesta.</li>
                        </ul>
                      </li>
                      <li>Visualizza le registrazioni già <strong>approvate</strong> e:
                        <ul>
                          <li>Invia o reinvia i codici di voto ai partecipanti.</li>
                          <li>Modifica rapidamente l’e-mail del referente.</li>
                          <li>Elimina la registrazione (con cancellazione a cascata di tutti i dati collegati).</li>
                        </ul>
                      </li>
                    </ul>
                  </p>

                  {/* 📊 Risultati Live */}
                  <h4>📊 Risultati Live</h4>
                  <p>
                    <ul>
                      <li>Segui la <strong>classifica in tempo reale</strong> per ogni categoria di voto:
                        <em>miglior impresa</em>, <em>green</em>, <em>innovativa</em>.</li>
                      <li>Visualizza le <strong>percentuali di partecipazione</strong> con barre di progresso dinamiche per ospiti e capi.</li>
                      <li>Personalizza il numero di risultati (Top N) e aggiorna manualmente o lascia che il sistema faccia il <em>refresh</em> automatico ogni 5 minuti.</li>
                    </ul>
                  </p>

                  {/* 🔧 📰 Comunicazioni */}
                  <h4>📰 Comunicazioni</h4> 
                  <p> 
                    <ul>
                      <li>Pubblica una <strong>nuova comunicazione</strong> con titolo, corpo e data; comparirà immediatamente nella <em>Home</em> di tutti gli utenti.</li>
                      <li>L’inserimento di una nuova comunicazione <strong>sovrascrive</strong> automaticamente quella precedente, mantenendo la Home sempre aggiornata.</li>
                    </ul>
                  </p>

                  {/* ⚙️ Impostazioni */}
                  <h4>⚙️ Impostazioni</h4>
                  <p>
                    <ul>
                      <li>Attiva/disattiva la pagina <strong>Registrazioni</strong> e al pagina <strong>Votazioni</strong> così da evitare problemi quando non servono!</li>
                      <li><strong>Aggiungi nuovi amministratori</strong> tramite un form guidato con controllo email e feedback immediato.</li>
                      <li>Invia una <strong>nuova password</strong> a un admin con il pulsante “📧 Invia Password”.</li>
                      <li><strong>Elimina admin</strong> in sicurezza (l’admin con ID 1 è protetto da cancellazioni).</li>
                    </ul>
                  </p>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
