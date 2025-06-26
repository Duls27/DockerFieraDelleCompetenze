import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export default function GestioneComunicazioni() {
  /* Stato comunicazione attualmente pubblicata */
  const [pubblicata, setPubblicata] = useState({
    titolo: '',
    corpo: '',
    data_pubblicazione: null,
  });

  /* Stato del messaggio che l’admin sta scrivendo */
  const [nuovaComunicazione, setNuovaComunicazione] = useState({
    titolo: '',
    corpo: '',
  });

  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [error,   setError]     = useState(null);
  const [success, setSuccess]   = useState('');

  /* ────────────────────────────────────
     CARICAMENTO INIZIALE COMUNICAZIONE
  ──────────────────────────────────── */
  const caricaComunicazione = () => {
    setLoading(true);
    axios
      .get(`${API_BASE}/notizia`)
      .then(res => {
        setPubblicata({
          titolo:            res.data.titolo || '',
          corpo:             res.data.corpo  || '',
          data_pubblicazione: res.data.data_pubblicazione || null,
        });
        setLoading(false);
      })
      .catch(err => {
        if (err.response?.status === 404) {
          setPubblicata({ titolo: '', corpo: '', data_pubblicazione: null });
        } else {
          setError('Errore nel caricamento della comunicazione.');
          console.error(err);
        }
        setLoading(false);
      });
  };

  useEffect(caricaComunicazione, []);

  /* ────────────────────────────────────
     HANDLER CAMPI INPUT
  ──────────────────────────────────── */
  const handleChange = e => {
    const { name, value } = e.target;
    setNuovaComunicazione(prev => ({ ...prev, [name]: value }));
  };

  /* ────────────────────────────────────
     RESET CAMPi
  ──────────────────────────────────── */
  const handleCancella = () => {
    setNuovaComunicazione({ titolo: '', corpo: '' });
    setError(null);
    setSuccess('');
  };

  /* ────────────────────────────────────
     PUBBLICAZIONE NUOVA COMUNICAZIONE
  ──────────────────────────────────── */
  const handlePubblica = () => {
    const { titolo, corpo } = nuovaComunicazione;

    if (!titolo.trim() || !corpo.trim()) {
      setError('Titolo e corpo sono obbligatori.');
      setSuccess('');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess('');

    axios
      .post(`${API_BASE}/notizia/pubblica`, { titolo, corpo })
      .then(() => {
        setSuccess('Comunicazione pubblicata con successo!');
        setNuovaComunicazione({ titolo: '', corpo: '' });
        caricaComunicazione();           // ricarica quella ufficiale
      })
      .catch(err => {
        setError('Errore durante la pubblicazione.');
        console.error(err);
      })
      .finally(() => setSaving(false));
  };

  /* ────────────────────────────────────
     RENDER
  ──────────────────────────────────── */
  if (loading) return <p>Caricamento in corso…</p>;

  return (
    <div
      style={{
        maxWidth: 600,
        margin: '2rem auto',
        padding: '1.5rem 2rem',
        backgroundColor: '#fff',
        borderRadius: 10,
        boxShadow: '0 2px 8px rgb(0 0 0 / 0.1)',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        color: '#333',
      }}
    >
      <h2 style={{ marginBottom: '1.5rem', fontWeight: 700, color: '#28a745' }}>
        Gestione Comunicazioni
      </h2>

      {/* COMUNICAZIONE CORRENTE */}
      {pubblicata.data_pubblicazione && (
        <div
          style={{
            backgroundColor: '#e9f7ef',
            padding: '1rem',
            borderRadius: 8,
            marginBottom: '1.5rem',
            whiteSpace: 'pre-wrap',
            color: '#155724',
            boxShadow: 'inset 0 0 5px #28a745',
          }}
        >
          <strong style={{ fontSize: '1.1rem' }}>{pubblicata.titolo}</strong>
          <p style={{ marginTop: '0.25rem', lineHeight: 1.5 }}>{pubblicata.corpo}</p>
          <small style={{ fontSize: '0.85rem', color: '#2d5d3a' }}>
            Ultima pubblicazione:{' '}
            {new Date(pubblicata.data_pubblicazione).toLocaleString('it-IT', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </small>
        </div>
      )}

      {/* FORM NUOVA COMUNICAZIONE */}
      <label htmlFor="titolo" style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
        Titolo nuovo messaggio
      </label>
      <input
        id="titolo"
        name="titolo"
        type="text"
        value={nuovaComunicazione.titolo}
        onChange={handleChange}
        placeholder="Scrivi qui il titolo"
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: '1rem',
          borderRadius: 6,
          border: '1px solid #ccc',
          marginBottom: '1rem',
          outlineColor: '#28a745',
        }}
      />

      <label htmlFor="corpo" style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>
        Corpo nuovo messaggio
      </label>
      <textarea
        id="corpo"
        name="corpo"
        value={nuovaComunicazione.corpo}
        onChange={handleChange}
        placeholder="Scrivi qui il corpo del messaggio"
        rows={6}
        style={{
          width: '100%',
          padding: '0.5rem 0.75rem',
          fontSize: '1rem',
          borderRadius: 6,
          border: '1px solid #ccc',
          resize: 'vertical',
          outlineColor: '#28a745',
          marginBottom: '1.5rem',
          fontFamily: 'inherit',
          lineHeight: 1.4,
        }}
      />

      {/* MESSAGGI DI STATO */}
      {error   && <p style={{ color: '#dc3545', marginBottom: '1rem' }}>{error}</p>}
      {success && <p style={{ color: '#28a745', marginBottom: '1rem' }}>{success}</p>}

      {/* PULSANTI */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button
          onClick={handleCancella}
          disabled={saving}
          style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            color: '#721c24',
            padding: '0.5rem 1.25rem',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Cancella
        </button>

        <button
          onClick={handlePubblica}
          disabled={saving}
          style={{
            backgroundColor: '#28a745',
            border: 'none',
            color: '#fff',
            padding: '0.5rem 1.25rem',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 700,
          }}
        >
          {saving ? 'Pubblico…' : 'Pubblica'}
        </button>
      </div>

      {/* AVVISO FINALE */}
      <div
        style={{
          marginTop: '2rem',
          padding: '1rem 1.25rem',
          backgroundColor: '#fff3cd',
          borderRadius: 6,
          border: '1px solid #ffeeba',
          color: '#856404',
          fontSize: '0.9rem',
          lineHeight: 1.4,
        }}
      >
        ⚠️ Pubblicando una nuova comunicazione, quella precedente verrà sovrascritta definitivamente.
      </div>
    </div>
  );
}
