import React, { useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import Cerca from './Cerca';
import ApprovazioneOspiti from './ApprovazioneOspiti';
import Settings from './Settings';
import RisultatiLive from './RisultatiLive';

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/'); // se non loggato, torna alla home
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#d4edda' }}>
      {/* Sidebar */}
      <nav className="bg-success text-white p-3 d-flex flex-column" style={{ width: '250px' }}>
        <Link to="/admin" className="btn btn-light mb-4 fw-bold">
          🏠 Home Admin
        </Link>

        <div className="d-flex flex-column gap-3 flex-grow-1">
          <Link to="/admin/cerca" className="btn btn-light">🔍 Cerca</Link>
          <Link to="/admin/approvazione-ospiti" className="btn btn-light">🧑‍🤝‍🧑 Approvazione Ospiti</Link>
          <Link to="/admin/risultati-live" className="btn btn-light">📊 Risultati Live</Link>
          <Link to="/admin/settings" className="btn btn-light">⚙️ Impostazioni</Link>
        </div>
        <button onClick={handleLogout} className="btn btn-danger mt-4">
          Esci
        </button>
      </nav>

      {/* Contenuto principale */}
      <div className="p-4 flex-grow-1">
        <Routes>
          <Route path="cerca" element={<Cerca />} />
          <Route path="approvazione-ospiti" element={<ApprovazioneOspiti />} />
          <Route path="risultati-live" element={<RisultatiLive />} />
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

                  {/* ⚙️ Impostazioni */}
                  <h4>⚙️ Impostazioni</h4>
                  <p>
                    <ul>
                      <li>Attiva/disattiva la <strong>Modalità Fiera</strong> per aprire o chiudere le votazioni in un click.</li>
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
