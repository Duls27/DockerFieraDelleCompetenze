import React, { useEffect, useState } from 'react';
import axios from 'axios';
import logo from './logo.png';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const StandView = () => {
  const [stand, setStand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStand = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/stand/list`);
        setStand(response.data);
      } catch (err) {
        console.error('Errore fetching stand:', err.response || err.message || err);
        setError('Errore nel caricamento degli stand.');
      } finally {
        setLoading(false);
      }
    };

    fetchStand();
  }, []);

  return (
    <div className="p-4" style={{ minHeight: '100vh', backgroundColor: '#d4edda' }}>

      <div className="text-center mb-4">
        <img
          src={logo}
          alt="Logo"
          style={{ width: '200px', height: '200px', objectFit: 'contain' }}
          className="mb-3"
        />
        <h1 className="fw-bold text-success">Lista Stand</h1>
      </div>

      {loading && <p>Caricamento in corso...</p>}

      {error && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && (
        <div className="table-responsive shadow-sm rounded bg-white p-3">
          <table className="table table-striped table-bordered align-middle">
            <thead className="table-success">
              <tr>
                <th>Zona</th>
                <th>Gruppo</th>
                <th>Squadriglia</th>
                <th>Codice voto</th>
              </tr>
            </thead>
            <tbody>
              {stand.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">Nessuno stand trovato.</td>
                </tr>
              ) : (
                stand.map(({ nome_zona, nome_gruppo, nome_squadriglia, vote_autenticator }, idx) => (
                  <tr key={idx}>
                    <td>{nome_zona}</td>
                    <td>{nome_gruppo}</td>
                    <td>{nome_squadriglia}</td>
                    <td>{vote_autenticator}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StandView;
