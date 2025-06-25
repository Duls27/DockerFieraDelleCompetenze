// src/pages/RisultatiLive.jsx
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/* ---------- component ---------- */
const RisultatiLive = () => {
  /* stato ui */
  const [limit, setLimit] = useState(3);     // N risultati da mostrare
  const [data,  setData ] = useState(null);  // risposta backend
  const [err,   setErr  ] = useState(null);  // eventuale errore
  const [loading, setLoading] = useState(false);

  /* fetch (useCallback per non far arrabbiare eslint/react-hooks) */
  const fetchData = useCallback(
    async (lim) => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/live-results?limit=${lim}`);
        setData(res.data);
        setErr(null);
      } catch {
        setErr('Errore nel recupero dei risultati');
      } finally {
        setLoading(false);
      }
    },
    [] // API_BASE non cambia mai, possiamo ometterlo
  );

  /* primo load + reload quando cambia limit */
  useEffect(() => {
    fetchData(limit);
  }, [limit, fetchData]);

  /* polling ogni 5 min */
  useEffect(() => {
    const id = setInterval(() => fetchData(limit), 300_000);
    return () => clearInterval(id);
  }, [limit, fetchData]);

  /* ---------- sub-component ---------- */
  const TopList = ({ title, list }) => (
    <div className="card shadow-sm my-3">
      <div className="card-body">
        <h5 className="card-title text-success">{title}</h5>
        {list?.length ? (
          <ol className="mb-0">
            {list.map((el) => (
              <li key={el.vote_autenticator}>
                <strong>{el.nome_squadriglia}</strong> – {el.nome_zona} / {el.nome_gruppo}{' '}
                <span className="badge bg-secondary">{el.voti} voti</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted mb-0">Nessun voto registrato</p>
        )}
      </div>
    </div>
  );

  /* ---------- render ---------- */
  return (
    <div className="container mt-3">
      <h1 className="text-success mb-4">📊 Risultati in tempo reale</h1>

      {/* selezione Top-N */}
      <form
        className="d-flex align-items-center gap-2 mb-4"
        onSubmit={(e) => {
          e.preventDefault();
          fetchData(limit);
        }}
      >
        <label className="fw-semibold mb-0">Mostra Top&nbsp;</label>
        <input
          type="number"
          min={1}
          max={20}
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="form-control"
          style={{ width: 80 }}
        />
        <span className="fw-semibold">risultati</span>
        <button type="submit" className="btn btn-outline-success btn-sm">
          Aggiorna
        </button>
      </form>

      {/* error / loading */}
      {err && <div className="alert alert-danger">{err}</div>}
      {loading && <p>Caricamento…</p>}

      {/* dati */}
      {data && (
        <>
          {/* progress bar affluenza */}
          <div className="row g-4 mb-5">
            <div className="col-md-6">
              <h6 className="text-center">Partecipazione Ospiti</h6>
              <div className="progress">
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${data.percentuali.ospiti}%` }}
                >
                  {data.percentuali.ospiti}%
                </div>
              </div>
              <p className="small text-center mt-1">
                {data.percentuali.ospiti}% –{' '}
                {data.totali.ospiti.votanti ?? '?'} su{' '}
                {data.totali.ospiti.totali ?? '?'}
              </p>
            </div>
            <div className="col-md-6">
              <h6 className="text-center">Partecipazione Capi</h6>
              <div className="progress">
                <div
                  className="progress-bar bg-warning"
                  style={{ width: `${data.percentuali.capi}%` }}
                >
                  {data.percentuali.capi}%
                </div>
              </div>
              <p className="small text-center mt-1">
                {data.percentuali.capi}% –{' '}
                {data.totali.capi.votanti ?? '?'} su{' '}
                {data.totali.capi.totali ?? '?'}
              </p>
            </div>
          </div>

          {/* top-list ospiti */}
          <h3 className="text-success">Votazioni Ospiti</h3>
          <TopList
            title="🏆 Miglior impresa"
            list={data.ospiti.miglior_impresa}
          />
          <TopList
            title="🌱 Impresa più green"
            list={data.ospiti.impresa_green}
          />
          <TopList
            title="💡 Impresa più innovativa"
            list={data.ospiti.impresa_innovativa}
          />

          {/* top-list capi */}
          <h3 className="text-success mt-5">Votazioni Capi</h3>
          <TopList
            title="🏆 Miglior impresa"
            list={data.capi.miglior_impresa}
          />
        </>
      )}
    </div>
  );
};

export default RisultatiLive;
