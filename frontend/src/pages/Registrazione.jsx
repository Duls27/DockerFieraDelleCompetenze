import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

const Registrazione = () => {
  const [formData, setFormData] = useState({
    email: '',
    numero_capi: '',
    nome_zona: '',
    nome_gruppo: '',
    numero_stand: '',
    nome_squadriglie: [],
    numero_squadriglie_ospiti: '',
  });

  const [message, setMessage] = useState(null);       
  const [messageType, setMessageType] = useState(null); 

  const showSquadriglie = parseInt(formData.numero_stand, 10) > 0;

  useEffect(() => {
    const numero = parseInt(formData.numero_stand, 10);
    if (numero > 0) {
      setFormData(prev => {
        const oldArr = prev.nome_squadriglie;
        const newArr = [...oldArr];

        if (newArr.length < numero) {
          for (let i = newArr.length; i < numero; i++) {
            newArr.push('');
          }
        } else if (newArr.length > numero) {
          newArr.splice(numero);
        }

        return { ...prev, nome_squadriglie: newArr };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        nome_squadriglie: [],
      }));
    }
  }, [formData.numero_stand]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (['numero_capi', 'numero_stand', 'numero_squadriglie_ospiti'].includes(name)) {
      let numValue = value;

      if (name === 'numero_stand') {
        let intValue = parseInt(value, 10);
        if (!isNaN(intValue) && intValue > 20) {
          intValue = 20;
        }
        numValue = isNaN(intValue) ? '' : intValue.toString();
      }

      setFormData(prev => ({
        ...prev,
        [name]: numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSquadrigliaChange = (index, value) => {
    setFormData(prev => {
      const newSquadriglie = [...prev.nome_squadriglie];
      newSquadriglie[index] = value;
      return {
        ...prev,
        nome_squadriglie: newSquadriglie
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const squadrigliePulite = formData.nome_squadriglie
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (showSquadriglie && parseInt(formData.numero_stand, 10) !== squadrigliePulite.length) {
      setMessageType('error');
      setMessage(`Il numero di stand (${formData.numero_stand}) deve corrispondere al numero di nomi squadriglie inseriti (${squadrigliePulite.length}).`);
      return;
    }

    try {
      await axios.post(`${API_BASE}/registrazione-generale`, {
        ...formData,
        nome_squadriglie: squadrigliePulite,
      });
      setMessageType('success');
      setMessage('Registrazione inviata con successo! Attendi l\'approvazione, poi riceverai un\'email');
      setFormData({
        email: '',
        numero_capi: '',
        nome_zona: '',
        nome_gruppo: '',
        numero_stand: '',
        nome_squadriglie: [],
        numero_squadriglie_ospiti: '',
      });
    } catch (error) {
      setMessageType('error');
      setMessage('Errore durante la registrazione.');
      console.error(error);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#d4edda',
        minHeight: '100vh',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >


      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-sm"
        style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}
      >
        <h2 className="mb-4 text-success text-center">Registrazione</h2>
        <h3 className="mb-4 text-success text-center" style={{fontWeight: 'normal'}}>
        <span role="img" aria-label="capi">⚜️</span> A cura di <strong>un</strong> capo per reparto! ⚜️
        </h3>

        {/* Email */}
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className="form-control"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Numero Capi */}
        <div className="mb-3">
          <label className="form-label">Numero Capi</label>
          <input
            type="number"
            name="numero_capi"
            className="form-control"
            min="0"
            value={formData.numero_capi}
            onChange={handleChange}
            required
            placeholder="0"
          />
        </div>

        {/* Zona */}
        <div className="mb-3">
          <label className="form-label">Zona</label>
          <select
            name="nome_zona"
            className="form-select"
            value={formData.nome_zona}
            onChange={handleChange}
            required
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

        {/* Nome Gruppo */}
        <div className="mb-3">
          <label className="form-label">Nome Gruppo</label>
          <input
            type="text"
            name="nome_gruppo"
            className="form-control"
            value={formData.nome_gruppo}
            onChange={handleChange}
            required
          />
        </div>

        {/* Numero Squadriglie Espositrici */}
        <div className="mb-3">
          <label className="form-label">Numero Squadriglie Espositrici</label>
          <input
            type="number"
            name="numero_stand"
            className="form-control"
            min="0"
            max="20"
            value={formData.numero_stand}
            onChange={handleChange}
            required
            placeholder="0"
          />
        </div>

        {/* Nome Squadriglie Espositrici */}
        {showSquadriglie && (
          <div className="mb-3">
            <label className="form-label">Nome Squadriglie Espositrici</label>
            {formData.nome_squadriglie.map((nome, index) => (
              <input
                key={index}
                type="text"
                className="form-control mb-2"
                value={nome}
                onChange={(e) => handleSquadrigliaChange(index, e.target.value)}
                required
              />
            ))}
          </div>
        )}

        {/* Numero Squadriglie Ospiti */}
        <div className="mb-3">
          <label className="form-label">Numero Squadriglie Ospiti</label>
          <input
            type="number"
            name="numero_squadriglie_ospiti"
            className="form-control"
            min="0"
            value={formData.numero_squadriglie_ospiti}
            onChange={handleChange}
            required
            placeholder="0"
          />
        </div>

        <button type="submit" className="btn btn-success w-100">Invia Registrazione</button>

        {message && (
          <div
            className={`mt-3 alert ${
              messageType === 'success' ? 'alert-success' : 'alert-danger'
            }`}
            role="alert"
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default Registrazione;
