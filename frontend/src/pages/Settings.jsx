import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const Settings = () => {
  /* ───────── Stato impostazioni fiera ───────── */
  const [modalitaFiera, setModalitaFiera] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [configError, setConfigError] = useState('');

  /* ───────── Stato form nuovo admin ───────── */
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [emailConferma, setEmailConferma] = useState('');
  const [addMsg, setAddMsg] = useState('');
  const [addErr, setAddErr] = useState('');

  /* ───────── Stato lista amministratori ───────── */
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [adminErr, setAdminErr] = useState('');

  /* ════════ FETCH CONFIG ════════ */
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/configurazione`);
        setModalitaFiera(res.data.modalita_fiera);
      } catch {
        setConfigError('Errore nel caricamento configurazione');
      } finally {
        setLoadingConfig(false);
      }
    };
    fetchConfig();
  }, []);

  /* ════════ FETCH ADMIN LIST ════════ */
  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/amministratori`);
      setAdmins(res.data);
      setAdminErr('');
    } catch {
      setAdminErr('Errore nel caricamento amministratori');
    } finally {
      setLoadingAdmins(false);
    }
  };
  useEffect(() => {
    fetchAdmins();
  }, []);

  /* ════════ TOGGLE FIERA ════════ */
  const handleToggle = async () => {
    const nuovoValore = !modalitaFiera;
    setModalitaFiera(nuovoValore);
    setConfigError('');
    try {
      await axios.post(`${API_BASE_URL}/configurazione/modalita_fiera`, {
        modalita_fiera: nuovoValore,
      });
    } catch {
      setConfigError('Errore nel salvataggio della configurazione');
      setModalitaFiera(!nuovoValore); // revert
    }
  };

  /* ════════ ADD NEW ADMIN ════════ */
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    setAddErr('');
    setAddMsg('');

    if (!nome || !cognome || !email || !emailConferma) {
      setAddErr('Tutti i campi sono obbligatori');
      return;
    }
    if (email !== emailConferma) {
      setAddErr('Le email non coincidono');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/amministratori`, { nome, cognome, email });
      setAddMsg('Admin aggiunto con successo!');
      setNome('');
      setCognome('');
      setEmail('');
      setEmailConferma('');
      fetchAdmins();
    } catch {
      setAddErr("Errore durante l'aggiunta dell'admin");
    }
  };

  /* ════════ SEND PASSWORD ════════ */
  const handleSendPassword = async (adminId) => {
    try {
      await axios.post(`${API_BASE_URL}/amministratori/send-password/${adminId}`);
      alert('Password inviata con successo!');
    } catch {
      alert("Errore durante l'invio della password");
    }
  };

  /* ════════ DELETE ADMIN ════════ */
  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo amministratore?')) return;
    setAdminErr('');
    try {
      await axios.delete(`${API_BASE_URL}/amministratori/${adminId}`);
      alert('Amministratore eliminato con successo!');
      fetchAdmins();
    } catch (error) {
      if (error.response && error.response.status === 403) {
        setAdminErr("L'amministratore con ID 1 non può essere eliminato.");
      } else {
        setAdminErr("Errore durante l'eliminazione dell'amministratore");
      }
    }
  };

  /* ════════ RENDER ════════ */
  if (loadingConfig) return <p>Caricamento configurazione...</p>;

  return (
    <div className="container py-4">
      <h2>Impostazioni</h2>

      {/* ───── Card: Toggle votazioni ───── */}
      <div className="card border-warning mt-4">
        <div className="card-header bg-warning">
          <strong>Modalità Fiera – Attiva votazioni</strong>
        </div>
        <div className="card-body">
          {configError && <div className="alert alert-danger">{configError}</div>}
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="modalitaFieraToggle"
              checked={modalitaFiera}
              onChange={handleToggle}
            />
            <label className="form-check-label ms-2" htmlFor="modalitaFieraToggle">
              {modalitaFiera ? 'Votazioni attive' : 'Votazioni disattivate'}
            </label>
          </div>
        </div>
      </div>

      {/* ───── Card: Aggiungi nuovo Admin ───── */}
      <div className="card mt-5">
        <div className="card-header bg-success text-white">Aggiungi nuovo Admin</div>
        <div className="card-body">
          {addErr && <div className="alert alert-danger">{addErr}</div>}
          {addMsg && <div className="alert alert-success">{addMsg}</div>}

          <form onSubmit={handleAddAdmin}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nome</label>
                <input
                  type="text"
                  className="form-control"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Cognome</label>
                <input
                  type="text"
                  className="form-control"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Conferma Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={emailConferma}
                  onChange={(e) => setEmailConferma(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-success mt-3">
              ➕ Aggiungi Admin
            </button>
          </form>
        </div>
      </div>

      {/* ───── Card: Elenco amministratori ───── */}
      <div className="card mt-5">
        <div className="card-header bg-secondary text-white">Elenco Amministratori</div>
        <div className="card-body">
          {adminErr && <div className="alert alert-danger">{adminErr}</div>}

          {loadingAdmins ? (
            <p>Caricamento amministratori...</p>
          ) : admins.length === 0 ? (
            <p>Nessun amministratore presente.</p>
          ) : (
            <table className="table table-striped">
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th>Nome</th>
                  <th>Cognome</th>
                  <th>Username</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nome}</td>
                    <td>{a.cognome}</td>
                    <td>{a.username}</td>
                    <td>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => handleSendPassword(a.id)}
                      >
                        📧 Invia Password
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteAdmin(a.id)}
                      >
                        🗑️ Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
