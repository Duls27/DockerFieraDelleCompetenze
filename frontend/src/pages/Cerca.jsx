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

  return (
    <div className="container py-4">
      <h2 className="mb-4">Ricerca per Zona e Gruppo</h2>

      <div className="mb-3">
        <label className="form-label">Zona</label>
        <select
          className="form-select"
          value={zona}
          onChange={e => setZona(e.target.value)}
        >
          <option value="">-- Seleziona una zona --</option>
          <option value="Varese">Varese</option>
          <option value="Pavia">Pavia</option>
          <option value="Ticino-Olona">Ticino-Olona</option>
          <option value="Milano">Milano</option>
          <option value="Promise">Promise</option>
          <option value="Mantova">Mantova</option>
          <option value="Cremona-Lodi">Cremona-Lodi</option>
          <option value="SoLCo">SoLCo</option>
          <option value="Brimino">Brimino</option>
          <option value="Brescia">Brescia</option>
          <option value="Sebino">Sebino</option>
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

      {/* Risultati */}
      <div>
        {capi.length > 0 && (
          <>
            <h4>Capi</h4>
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
            <h4>Ospiti</h4>
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
            <h4>Stand</h4>
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

        {!loading && capi.length === 0 && ospiti.length === 0 && stand.length === 0 && (
          <p>Nessun risultato trovato.</p>
        )}
      </div>
    </div>
  );
};

export default Cerca;
