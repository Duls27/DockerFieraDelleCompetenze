import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/login-admin`, { username, password });
      sessionStorage.setItem('token', res.data.token);
      navigate('/Admin'); // reindirizza alla pagina admin
    } catch (err) {
      setError(err.response?.data?.error || 'Errore durante login');
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        height: '100vh',
        width: '100vw',
        backgroundColor: '#d4edda',
        padding: '1rem',
        boxSizing: 'border-box',
        position: 'relative', // serve per contenere il bottone posizionato assolutamente
      }}
    >
      {/* Bottone torna alla home fisso in alto a sinistra */}
      <div style={{ position: 'fixed', top: '1rem', left: '1rem', zIndex: 1000 }}>
        <Link to="/" className="btn btn-outline-success btn-sm">
          ← Torna alla Home
        </Link>
      </div>

      <h2 className="text-center mb-4 text-success">Login Amministratore</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-sm"
        style={{ maxWidth: '400px', width: '100%' }}
      >
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-success w-100">
          Accedi
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
