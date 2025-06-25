import React, { useState } from 'react';

const AdminAuth = () => {
  const [regData, setRegData] = useState({ nome: '', cognome: '', email: '', password: '' });
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const registraAdmin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/registrazione-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Registrazione admin OK! ID: ${data.admin.id}`);
      } else {
        setMessage(`Errore: ${data.error || 'Problema sconosciuto'}`);
      }
    } catch (err) {
      setMessage(`Errore di rete: ${err.message}`);
    }
  };

  const loginAdmin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/login-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Login effettuato con successo!');
        setToken(data.token);
      } else {
        setMessage(`Errore: ${data.error || 'Problema sconosciuto'}`);
      }
    } catch (err) {
      setMessage(`Errore di rete: ${err.message}`);
    }
  };

  const testProtectedRoute = async () => {
    setMessage('');
    if (!token) {
      setMessage('Devi prima fare il login per ottenere il token!');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/admin-only-route', {
        headers: { Authorization: 'Bearer ' + token }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Risposta protetta: ${data.message}`);
      } else {
        setMessage(`Errore: ${data.error || 'Accesso negato'}`);
      }
    } catch (err) {
      setMessage(`Errore di rete: ${err.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 20 }}>
      <h2>Registrazione Amministratore</h2>
      <form onSubmit={registraAdmin}>
        <input type="text" name="nome" placeholder="Nome" value={regData.nome} onChange={handleRegChange} required /><br/><br/>
        <input type="text" name="cognome" placeholder="Cognome" value={regData.cognome} onChange={handleRegChange} required /><br/><br/>
        <input type="email" name="email" placeholder="Email" value={regData.email} onChange={handleRegChange} required /><br/><br/>
        <input type="password" name="password" placeholder="Password" value={regData.password} onChange={handleRegChange} required /><br/><br/>
        <button type="submit">Registrati</button>
      </form>

      <hr />

      <h2>Login Amministratore</h2>
      <form onSubmit={loginAdmin}>
        <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleLoginChange} required /><br/><br/>
        <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleLoginChange} required /><br/><br/>
        <button type="submit">Login</button>
      </form>

      <hr />

      <h3>Token JWT:</h3>
      <textarea readOnly value={token} style={{ width: '100%', height: 80 }}></textarea>

      <button onClick={testProtectedRoute} style={{ marginTop: 10 }}>Testa rotta protetta</button>

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
};

export default AdminAuth;
