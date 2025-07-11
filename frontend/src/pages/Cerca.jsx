import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const Cerca = () => {
  const [zona, setZona] = useState('');
  const [gruppo, setGruppo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [capi, setCapi] = useState([]);
  const [ospiti, setOspiti] = useState([]);
  const [stand, setStand] = useState([]);

  const [zonaDownload, setZonaDownload] = useState('Tutte');

  // Collapsabili
  const [showSearch, setShowSearch] = useState(true);
  const [showDownload, setShowDownload] = useState(true);

  const handleSearch = async () => {
    setError('');
    setCapi([]);
    setOspiti([]);
    setStand([]);

    if (!zona && gruppo) {
      setError('Per favore seleziona una zona o usa la zona con il gruppo.');
      return;
    }
    if (!zona && !gruppo) {
      setError('Per favore seleziona almeno una zona.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/cerca`, {
        params: { zona, gruppo }
      });

      setCapi(res.data.capi || []);
      setOspiti(res.data.ospiti || []);
      setStand(res.data.stand || []);
    } catch (err) {
      setError('Errore durante la ricerca.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (type) => {
    const zonaParam = zonaDownload || 'Tutte';
    const url = `${API_BASE}/download/${type}?zona=${encodeURIComponent(zonaParam)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">🔍 Ricerca e Scarica</h2>

      {/* BOX RICERCA */}
      <div className="border rounded p-4 mb-4" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="m-0">🔎 Ricerca per Zona e Gruppo</h4>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowSearch(!showSearch)}>
            {showSearch ? 'Nascondi' : 'Mostra'}
          </button>
        </div>

        {showSearch && (
          <>
            <div className="mb-3">
              <label className="form-label">Zona</label>
              <select className="form-select" value={zona} onChange={e => setZona(e.target.value)}>
                <option value="">-- Seleziona una zona --</option>
                {['Varese', 'Pavia', 'Ticino-Olona', 'Milano', 'Promise', 'Mantova', 'Cremona-Lodi', 'SoLCo', 'Brimino', 'Brescia', 'Sebino'].map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Gruppo</label>
              <input
                type="text"
                className="form-control"
                value={gruppo}
                onChange={e => setGruppo(e.target.value)}
                placeholder="Inserisci nome gruppo (opzionale)"
              />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button className="btn btn-primary mb-4" onClick={handleSearch} disabled={loading}>
              {loading ? 'Ricerca...' : 'Cerca'}
            </button>

            {/* RISULTATI */}
            {(capi.length > 0 || ospiti.length > 0 || stand.length > 0) && (
              <>
                {capi.length > 0 && (
                  <>
                    <h5>Capi</h5>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Nome Zona</th>
                          <th>Nome Gruppo</th>
                          <th>Vote Authenticator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {capi.map((capo, index) => (
                          <tr key={index}>
                            <td>{capo.nome_zona}</td>
                            <td>{capo.nome_gruppo}</td>
                            <td>{capo.vote_autenticator}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {ospiti.length > 0 && (
                  <>
                    <h5>Ospiti</h5>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Nome Zona</th>
                          <th>Nome Gruppo</th>
                          <th>Vote Authenticator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ospiti.map((ospite, index) => (
                          <tr key={index}>
                            <td>{ospite.nome_zona}</td>
                            <td>{ospite.nome_gruppo}</td>
                            <td>{ospite.vote_autenticator}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {stand.length > 0 && (
                  <>
                    <h5>Stand</h5>
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Nome Zona</th>
                          <th>Nome Gruppo</th>
                          <th>Nome Squadriglia</th>
                          <th>Vote Authenticator</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stand.map((s, index) => (
                          <tr key={index}>
                            <td>{s.nome_zona}</td>
                            <td>{s.nome_gruppo}</td>
                            <td>{s.nome_squadriglia}</td>
                            <td>{s.vote_autenticator}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}

            {!loading && capi.length === 0 && ospiti.length === 0 && stand.length === 0 && (
              <p>Nessun risultato trovato.</p>
            )}
          </>
        )}
      </div>

      {/* BOX DOWNLOAD MASSIVO */}
      <div className="border rounded p-4" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="m-0">📥 Download Massivo</h4>
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setShowDownload(!showDownload)}>
            {showDownload ? 'Nascondi' : 'Mostra'}
          </button>
        </div>

        {showDownload && (
          <>
            <p>Scarica tutti i codici registrati in formato PDF o CSV, filtrando per zona oppure scaricando tutte.</p>

            <div className="mb-3">
              <label className="form-label">Zona</label>
              <select
                className="form-select"
                value={zonaDownload}
                onChange={e => setZonaDownload(e.target.value)}
              >
                <option value="Tutte">-- Tutte le zone --</option>
                {['Varese', 'Pavia', 'Ticino-Olona', 'Milano', 'Promise', 'Mantova', 'Cremona-Lodi', 'SoLCo', 'Brimino', 'Brescia', 'Sebino'].map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div className="d-flex gap-3">
              <button
                className="btn btn-outline-danger"
                onClick={() => handleDownload('pdf')}
              >
                📄 Scarica PDF
              </button>
              <button
                className="btn btn-outline-success"
                onClick={() => handleDownload('csv')}
              >
                📊 Scarica CSV
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cerca;
