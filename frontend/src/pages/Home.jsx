import React, { useState, useEffect } from 'react';
import { Link, Outlet, useOutletContext, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from './logo.png';
import agesciLomLogo from './agescilom.png';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [modalitaFiera, setModalitaFiera] = useState(false);
  const [registrazioniAttive, setRegistrazioniAttive] = useState(false);
  const [comunicazione, setComunicazione] = useState(null);

  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    // GET votazioni
    axios
      .get(`${API_BASE}/configurazione/votazioni`)
      .then(res => setModalitaFiera(res.data.modalita_fiera))
      .catch(err => console.error(err));

    // GET registrazioni  🔧
    axios
      .get(`${API_BASE}/configurazione/registrazioni`)
      .then(res => setRegistrazioniAttive(res.data.modalita_fiera))
      .catch(err => console.error(err));                          

    // GET comunicazione
    axios
      .get(`${API_BASE}/notizia`)
      .then(res => setComunicazione(res.data))
      .catch(err => {
        if (err.response && err.response.status === 404) {
          setComunicazione(null);
        } else {
          console.error(err);
        }
      });
  }, []);

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#d4edda' }}>
      {/* SIDEBAR */}
      <nav
        className="bg-success text-white d-flex flex-column"
        style={{
          width: sidebarOpen ? 250 : 60,
          transition: 'width 0.3s',
          overflowX: 'hidden',
          flexShrink: 0,
          padding: '1rem 0.5rem',
        }}
      >
        {/* hamburger */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
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


        {/* BLOCCO 1 */}
        <Block>
          <NavItem to="/" icon="🏠" label="Home" open={sidebarOpen} />
          <NavItem
            to="/registrazione"
            icon="📝"
            label="Registrazione"
            open={sidebarOpen}
            disabled={!registrazioniAttive} // 🔧
          />
          <NavItem to="/come-funziona" icon="📚" label="Come Usare l'App" open={sidebarOpen} />
        </Block>

        <Divider open={sidebarOpen} />

        {/* BLOCCO 2 — votazioni */}
        <Block>
          <NavItem
            to="/vota/ospiti"
            icon="⭐"
            label="Votazione E/G"
            open={sidebarOpen}
            disabled={!modalitaFiera}
          />
          <NavItem
            to="/vota/capi"
            icon="🏆"
            label="Votazione Capi"
            open={sidebarOpen}
            disabled={!modalitaFiera}
          />
          <NavItem
            to="/lista/stand"
            icon="📋"
            label="Lista Stand"
            open={sidebarOpen}
            disabled={!modalitaFiera}
          />
        </Block>

        <Divider open={sidebarOpen} />

        {/* BLOCCO 3 — amministrazione + logo */}
        <Block style={{ flexGrow: 1 }}>
          <NavItem to="/admin/login" icon="🔒" label="Amministrazione" open={sidebarOpen} />
          <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            <img
              src={agesciLomLogo}
              alt="Agesci Lombardia"
              style={{ width: sidebarOpen ? 140 : 40, transition: 'width 0.3s' }}
            />
          </div>
        </Block>
      </nav>

      {/* MAIN */}
      <main className="flex-grow-1 p-4">
        {isLandingPage && (
          <div className="text-center mb-4">
            <h1 className="fw-bold text-success m-0 mb-2">Fiera delle Competenze</h1>
            <img src={logo} alt="Logo" style={{ width: 240 }} />

            {/* BOX COMUNICAZIONE REAL-TIME */}
            <div
              style={{
                marginTop: 20,
                backgroundColor: 'white',
                color: '#155724',
                borderRadius: 8,
                padding: '1rem 1.5rem',
                maxWidth: 600,
                marginLeft: 'auto',
                marginRight: 'auto',
                boxShadow: '0 0 8px rgba(0,0,0,0.1)',
                textAlign: 'left',
                minHeight: 80,
              }}
            >
              <h2 style={{ borderBottom: '2px solid #155724', paddingBottom: '0.25rem' }}>
                {comunicazione ? comunicazione.titolo : 'Notizie Real-Time'}
              </h2>
              {!comunicazione && <p>Nessuna comunicazione disponibile.</p>}
              {comunicazione && (
                <>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{comunicazione.corpo}</p>
                  <small style={{ fontSize: '0.85rem', color: '#555' }}>
                    Ultimo aggiornamento:{' '}
                    {new Date(comunicazione.data_pubblicazione).toLocaleString('it-IT', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </small>
                </>
              )}
            </div>
          </div>
        )}

        {/* pagina specifica */}
        <Outlet context={{ modalitaFiera }} />
      </main>
    </div>
  );
}

/* Componenti di supporto */
const Block = props => (
  <div
    className="d-flex flex-column"
    style={{ gap: '1rem', alignItems: 'center', ...props.style }}
  >
    {props.children}
  </div>
);
const Divider = ({ open }) => (
  <hr
    style={{
      width: '90%',
      margin: open ? '1.2rem auto' : '0.8rem auto',
      borderColor: 'rgba(255,255,255,0.3)',
    }}
  />
);

function NavItem({ to, icon, label, open, disabled = false }) {
  return (
    <Link
      to={to}
      title={label}
      style={{
        color: '#fff',
        textDecoration: 'none',
        fontSize: '1.1rem',
        width: '100%',
        padding: '0.4rem 0',
        borderRadius: 4,
        transition: 'background-color 0.2s',
        userSelect: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        pointerEvents: disabled ? 'none' : 'auto',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      {open && <span style={{ marginLeft: 10 }}>{label}</span>}
    </Link>
  );
}

/* Pagine figlie rapide nello stesso file (facoltative) */
export function Landing() {
  return null;
}
export function VotazioneOspiti() {
  const { modalitaFiera } = useOutletContext();
  return modalitaFiera ? <p>Form voto E/G…</p> : <p className="text-muted">Votazioni disabilitate.</p>;
}
export function VotazioneCapi() {
  const { modalitaFiera } = useOutletContext();
  return modalitaFiera ? <p>Form voto Capi…</p> : <p className="text-muted">Votazioni disabilitate.</p>;
}
export function ListaStand() {
  return <p>Lista stand…</p>;
}
