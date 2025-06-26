import React, { useState } from 'react';
import axios from 'axios';
import logo from './logo.png';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const VotaOspiti = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const [form, setForm] = useState({
    migliorImpresa: '',
    piuGreen: '',
    piuInnovativa: '',
    codice: '', // solo le 4 cifre dopo il prefisso "O-"
  });

  // Gestione input numerici: filtra non numerici e limita a 3 cifre
  const handleNumericChange = ({ target: { name, value } }) => {
    const digits = value.replace(/\D/g, '').slice(0, 3);
    setForm(prev => ({ ...prev, [name]: digits }));
  };

  // Gestione codice verifica: filtra non numerici e limita a 4 cifre
  const handleCodeChange = ({ target: { value } }) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setForm(prev => ({ ...prev, codice: digits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    const { migliorImpresa, piuGreen, piuInnovativa, codice } = form;

    if (!migliorImpresa && !piuGreen && !piuInnovativa) {
      setError('Inserisci almeno un voto.');
      return;
    }

    if (codice.length !== 4) {
      setError('Il codice di verifica deve essere di 4 cifre.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/voti-ospiti`, {
        codice_verifica: `O-${codice}`,
        miglior_impresa: migliorImpresa || undefined,
        impresa_green: piuGreen || undefined,
        impresa_innovativa: piuInnovativa || undefined,
      });

      if (data.status === 'created' || data.status === 'updated') {
        setFeedback({
          status: data.status,
          dettagli: {
            miglior_impresa: { 
              squadriglia: data.dettagli.miglior_impresa?.squadriglia || '—', 
              zona: data.dettagli.miglior_impresa?.zona || '—' 
            },
            impresa_green: { 
              squadriglia: data.dettagli.impresa_green?.squadriglia || '—', 
              zona: data.dettagli.impresa_green?.zona || '—' 
            },
            impresa_innovativa: { 
              squadriglia: data.dettagli.impresa_innovativa?.squadriglia || '—', 
              zona: data.dettagli.impresa_innovativa?.zona || '—' 
            },
          },
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

  const FeedbackDetails = () => (
    <ul className="mb-0">
      {Object.entries(feedback.dettagli).map(([cat, info]) => (
        <li key={cat}>
          <strong>{cat.replace(/_/g, ' ')}:</strong> {info.squadriglia} – {info.zona}
        </li>
      ))}
    </ul>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d4edda' }}>
      <div className="p-3">

        {/* Header con logo */}
        <div className="text-center mb-4">
          <img
            src={logo}
            alt="Logo"
            style={{ width: '200px', height: '200px', objectFit: 'contain' }}
            className="mb-3"
          />
          <h1 className="fw-bold text-success">Votazione&nbsp;E/G</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: '420px' }}>
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

          <div className="mb-3">
            <label className="form-label fw-semibold">Impresa più green</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={3}
              className="form-control"
              name="piuGreen"
              value={form.piuGreen}
              onChange={handleNumericChange}
              placeholder="000"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Impresa più innovativa</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={3}
              className="form-control"
              name="piuInnovativa"
              value={form.piuInnovativa}
              onChange={handleNumericChange}
              placeholder="000"
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Codice di verifica</label>
            <div className="input-group">
              <span className="input-group-text">O-</span>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                className="form-control"
                value={form.codice}
                onChange={handleCodeChange}
                placeholder="1234"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-warning fw-bold text-success w-100" disabled={loading}>
            {loading ? 'Invio…' : 'Invia voti'}
          </button>
        </form>

        {/* Feedback */}
        {feedback?.status === 'created' && (
          <div className="d-flex justify-content-center mt-4">
            <div style={{ maxWidth: '420px', width: '100%' }}>
              <div className="alert alert-success">
                <h5 className="alert-heading">Voto registrato!</h5>
                <FeedbackDetails />
              </div>
            </div>
          </div>
        )}
        {feedback?.status === 'updated' && (
          <div className="d-flex justify-content-center mt-4">
            <div style={{ maxWidth: '420px', width: '100%' }}>
              <div className="alert alert-success">
                <h5 className="alert-heading">Voto aggiornato!</h5>
                <FeedbackDetails />
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="d-flex justify-content-center mt-4">
            <div style={{ maxWidth: '420px', width: '100%' }}>
              <div className="alert alert-danger">{error}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotaOspiti;
