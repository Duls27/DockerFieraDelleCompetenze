import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const ApprovazioneOspiti = () => {
  /* ───────── State ───────── */
  const [pendenti, setPendenti] = useState([]);
  const [approvate, setApprovate] = useState([]);
  const [loadingPendenti, setLoadingPendenti] = useState(true);
  const [loadingApprovate, setLoadingApprovate] = useState(true);

  // sort config separati per ogni lista
  const [sortPendenti, setSortPendenti] = useState({ column: null, dir: 'asc' });
  const [sortApprovate, setSortApprovate] = useState({ column: null, dir: 'asc' });

  // stati per collapsable
  const [showPendenti, setShowPendenti] = useState(true);
  const [showApprovate, setShowApprovate] = useState(true);

  /* ───────── Helpers ───────── */
  const formatDataOra = (timestamp) =>
    new Date(timestamp).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  /** Ordina e aggiorna la lista indicata */
  const handleSort = (listType, columnKey) => {
    const isPendenti = listType === 'pendenti';
    const data = isPendenti ? [...pendenti] : [...approvate];
    const sortCfg = isPendenti ? sortPendenti : sortApprovate;

    // toggling asc/desc
    const dir = sortCfg.column === columnKey && sortCfg.dir === 'asc' ? 'desc' : 'asc';

    data.sort((a, b) => {
      let aVal = a[columnKey];
      let bVal = b[columnKey];

      if (columnKey === 'creato_il') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = aVal?.toString().toLowerCase() || '';
        bVal = bVal?.toString().toLowerCase() || '';
      }

      if (aVal < bVal) return dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return dir === 'asc' ? 1 : -1;
      return 0;
    });

    if (isPendenti) {
      setPendenti(data);
      setSortPendenti({ column: columnKey, dir });
    } else {
      setApprovate(data);
      setSortApprovate({ column: columnKey, dir });
    }
  };

  /** Mostra freccia ↑↓ sulla colonna attualmente ordinata */
  const sortIcon = (listType, columnKey) => {
    const cfg = listType === 'pendenti' ? sortPendenti : sortApprovate;
    if (cfg.column !== columnKey) return null;
    return cfg.dir === 'asc' ? ' ▲' : ' ▼';
  };

  /* ───────── Fetch ───────── */
  const fetchPendenti = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/registrazioni-generali/pendenti`
      );
      setPendenti(res.data);
    } catch (err) {
      console.error('Errore durante il caricamento pendenti:', err);
    } finally {
      setLoadingPendenti(false);
    }
  };

  const fetchApprovate = async () => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/registrazioni-generali/approvate`
      );
      setApprovate(res.data);
    } catch (err) {
      console.error('Errore durante il caricamento approvate:', err);
    } finally {
      setLoadingApprovate(false);
    }
  };

  useEffect(() => {
    fetchPendenti();
    fetchApprovate();
  }, []);

  /* ───────── Azioni (approve / delete / mail / ecc.) ───────── */
  const approvaRegistrazione = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/approva-registrazione/${id}`);
      alert('Registrazione approvata!');
      fetchPendenti();
      fetchApprovate();
    } catch (err) {
      console.error("Errore durante l'approvazione:", err);
      alert("Errore durante l'approvazione.");
    }
  };

  const eliminaRegistrazione = async (id) => {
    if (
      !window.confirm(
        '⚠️ Sei sicuro di voler eliminare questa registrazione? Verranno ELIMINATI TUTTI gli stand, capi, ospiti e voti associati!'
      )
    )
      return;

    try {
      await axios.delete(`${API_BASE_URL}/eliminaregistrazione-ospiti/${id}`);
      alert('Registrazione eliminata!');
      fetchPendenti();
      fetchApprovate();
    } catch (err) {
      console.error("Errore durante l'eliminazione:", err);
      alert("Errore durante l'eliminazione.");
    }
  };

  const inviaEmail = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/invia-email/${id}`);
      alert('Email inviata con successo!');
      fetchApprovate(); // aggiorna la colonna Notifica
    } catch (err) {
      console.error('Errore invio email:', err);
      alert("Errore durante l'invio dell'email.");
    }
  };

  const modificaEmail = async (id, emailAttuale) => {
    const nuovaEmail = window.prompt(
      'Inserisci il nuovo indirizzo email:',
      emailAttuale
    );
    if (!nuovaEmail || nuovaEmail === emailAttuale) return;

    try {
      await axios.put(
        `${API_BASE_URL}/registrazioni-generali/${id}/email`,
        { email: nuovaEmail }
      );
      alert('Email aggiornata con successo!');
      fetchApprovate();
    } catch (err) {
      console.error("Errore durante l'aggiornamento email:", err);
      alert("Errore durante l'aggiornamento dell'email.");
    }
  };

  /* ───────── Render ───────── */
  return (
    <div>
      {/* ---------- DISCLAIMER ---------- */}
      <p className="alert alert-warning">
        ⚠️ Le registrazioni devono prima essere <strong>approvate</strong>.
        Successivamente occorre cliccare su <strong>Invia Codici</strong> per
        spedire i codici di accesso. Le tabelle si possono ordinare sulle
        colonne <em>Data registrazione</em>, <em>Zona</em> e <em>Gruppo</em>.
      </p>

      {/* ---------- PENDENTI ---------- */}
      <h2
        className="text-success mb-4"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setShowPendenti(!showPendenti)}
        title={showPendenti ? 'Clicca per nascondere' : 'Clicca per mostrare'}
      >
        {showPendenti ? '👇' : '👉'} In attesa di approvazione - {pendenti.length} {pendenti.length === 1 ? 'richiesta' : 'richieste'}
      </h2>

      {showPendenti && (
        <>
          {loadingPendenti ? (
            <p>Caricamento...</p>
          ) : pendenti.length === 0 ? (
            <p>Nessuna registrazione in attesa.</p>
          ) : (
            <table className="table table-striped">
              <thead className="table-success">
                <tr>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('pendenti', 'creato_il')}
                  >
                    Data registrazione{sortIcon('pendenti', 'creato_il')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('pendenti', 'nome_zona')}
                  >
                    Zona{sortIcon('pendenti', 'nome_zona')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('pendenti', 'nome_gruppo')}
                  >
                    Gruppo{sortIcon('pendenti', 'nome_gruppo')}
                  </th>
                  <th>Email</th>
                  <th># Capi</th>
                  <th># Stand</th>
                  <th># Ospiti</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {pendenti.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDataOra(r.creato_il)}</td>
                    <td>{r.nome_zona}</td>
                    <td>{r.nome_gruppo}</td>
                    <td>{r.email}</td>
                    <td>{r.numero_capi}</td>
                    <td>{r.numero_stand}</td>
                    <td>{r.numero_squadriglie_ospiti}</td>
                    <td>
                      <button
                        className="btn btn-success btn-sm me-2"
                        onClick={() => approvaRegistrazione(r.id)}
                      >
                        ✅ Approva
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminaRegistrazione(r.id)}
                      >
                        🗑️ Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ---------- APPROVATE ---------- */}
      <h2
        className="text-secondary mt-5 mb-4"
        style={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setShowApprovate(!showApprovate)}
        title={showApprovate ? 'Clicca per nascondere' : 'Clicca per mostrare'}
      >
        {showApprovate ? '👇' : '👉'} Approvate - {approvate.length} {approvate.length === 1 ? 'richiesta' : 'richieste'}
      </h2>

      {showApprovate && (
        <>
          {loadingApprovate ? (
            <p>Caricamento...</p>
          ) : approvate.length === 0 ? (
            <p>Nessuna registrazione approvata.</p>
          ) : (
            <table className="table table-striped">
              <thead style={{ backgroundColor: '#f0f0f0' }}>
                <tr>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('approvate', 'creato_il')}
                  >
                    Data registrazione{sortIcon('approvate', 'creato_il')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('approvate', 'nome_zona')}
                  >
                    Zona{sortIcon('approvate', 'nome_zona')}
                  </th>
                  <th
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSort('approvate', 'nome_gruppo')}
                  >
                    Gruppo{sortIcon('approvate', 'nome_gruppo')}
                  </th>
                  <th>Email</th>
                  <th># Capi</th>
                  <th># Stand</th>
                  <th># Ospiti</th>
                  <th>Cod. Inviati</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {approvate.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDataOra(r.creato_il)}</td>
                    <td>{r.nome_zona}</td>
                    <td>{r.nome_gruppo}</td>
                    <td>{r.email}</td>
                    <td>{r.numero_capi}</td>
                    <td>{r.numero_stand}</td>
                    <td>{r.numero_squadriglie_ospiti}</td>
                    <td style={{ fontSize: '1.2rem', textAlign: 'center' }}>
                      {r.email_sended ? (
                        <span
                          role="img"
                          aria-label="Email inviata"
                          style={{ color: 'green' }}
                        >
                          ✅
                        </span>
                      ) : (
                        <span
                          role="img"
                          aria-label="Email non inviata"
                          style={{ color: 'red' }}
                        >
                          ❌
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => modificaEmail(r.id, r.email)}
                      >
                        ✏️ Modifica
                      </button>
                      <button
                        className="btn btn-info btn-sm me-2"
                        onClick={() => inviaEmail(r.id)}
                      >
                        📧 Invia Codici
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => eliminaRegistrazione(r.id)}
                      >
                        🗑️ Elimina
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default ApprovazioneOspiti;
