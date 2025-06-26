// frontend/src/pages/VotaCapi.jsx
import React, { useState } from 'react';
import axios from 'axios';
import logo from './logo.png';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const VotaCapi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState({
    migliorImpresa: '',
    codice: '',
  });

  /* ---------- handlers ---------- */
  const handleNumericChange = ({ target: { name, value } }) => {
    const digits = value.replace(/\D/g, '').slice(0, 3);
    setForm((prev) => ({ ...prev, [name]: digits }));
  };

  const handleCodeChange = ({ target: { value } }) => {
    const digits = value.replace(/\D/g, '').slice(0, 3);
    setForm((prev) => ({ ...prev, codice: digits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    const { migliorImpresa, codice } = form;

    if (!migliorImpresa) {
      setError('Inserisci il tuo voto per “Miglior impresa”.');
      return;
    }
    if (codice.length !== 3) {
      setError('Il codice di verifica deve essere di 3 cifre.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/voti-capi`, {
        codice_verifica: `C-${codice}`,
        miglior_impresa: migliorImpresa,
      });

      if (['created', 'updated'].includes(data.status)) {
        setFeedback({
          status: data.status,
          dettagli: data.dettagli,
        });
      } else if (data.status === 'invalid') {
        setError('Codice di verifica non valido.');
      } else {
        setError(data.message || 'Errore imprevisto');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Errore imprevisto');
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fff3cd' }}>
      <div className="p-3">

        <div className="text-center mb-4">
          <img
            src={logo}
            alt="Logo"
            style={{ width: 200, height: 200, objectFit: 'contain' }}
            className="mb-3"
          />
          <h1 className="fw-bold text-success">Votazione&nbsp;Capi</h1>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: 420 }}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Miglior impresa</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={3}
              className="form-control"
              name="migliorImpresa"
              value={form.migliorImpresa}
              onChange={handleNumericChange}
              placeholder="000"
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Codice di verifica</label>
            <div className="input-group">
              <span className="input-group-text">C-</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={3}
                className="form-control"
                value={form.codice}
                onChange={handleCodeChange}
                placeholder="123"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-success fw-bold text-white w-100"
            disabled={loading}
          >
            {loading ? 'Invio…' : 'Invia voto'}
          </button>
        </form>

        {feedback && (
          <div className="d-flex justify-content-center mt-4">
            <div style={{ maxWidth: 420, width: '100%' }}>
              <div className="alert alert-success">
                <h5 className="alert-heading">
                  {feedback.status === 'created'
                    ? 'Voto registrato!'
                    : 'Voto aggiornato!'}
                </h5>
                <ul className="mb-0">
                  <li>
                    <strong>Miglior impresa:</strong>{' '}
                    {feedback.dettagli.miglior_impresa.squadriglia} –{' '}
                    {feedback.dettagli.miglior_impresa.zona}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="d-flex justify-content-center mt-4">
            <div style={{ maxWidth: 420, width: '100%' }}>
              <div className="alert alert-danger">{error}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotaCapi;
