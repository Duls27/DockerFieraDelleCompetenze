import React, { useState, useEffect } from 'react';

const HowToUse = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d4edda', padding: 'clamp(1rem, 4vw, 2rem)' }}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>📚 Come usare l’app della Fiera delle Competenze</h1>

        {/* 🔗 Indice */}
        <div style={indexBox}>
          <h3 style={{ marginBottom: '0.5rem', color: '#388e3c' }}>📑 Indice</h3>
          <ul style={{ listStyle: 'none', paddingLeft: 0, lineHeight: '1.8' }}>
            <li><button onClick={() => scrollTo('notizie')} style={btnStyle}>📢 Notizie e Comunicazioni</button></li>
            <li><button onClick={() => scrollTo('votazioni')} style={btnStyle}>⭐ Votazioni</button></li>
            <li><button onClick={() => scrollTo('registrazione')} style={btnStyle}>📝 Registrazione (a cura dei capi)</button></li>
          </ul>
        </div>

        {/* 📢 Notizie */}
        <section id="notizie" style={sectionStyle}>
          <h2 style={macroTitleStyle}>📢 Notizie e Comunicazioni</h2>
          <p style={pStyle}>
            Nella <strong>Home</strong> trovi una sezione <em>“Notizie e comunicazioni”</em> aggiornata in tempo reale dagli organizzatori.
            Qui compariranno avvisi importanti, cambi di programma e tutte le informazioni utili mentre l’evento è in corso!
          </p>
        </section>

        {/* ⭐ Votazioni */}
        <section id="votazioni" style={sectionStyle}>
          <h2 style={macroTitleStyle}>⭐ Votazioni</h2>

          <p style={{ ...alertStyle, textAlign: 'center', marginBottom: '1.5rem' }}>
            ⚠️ È obbligatorio esprimere almeno un voto per una delle categorie. <br />
            Puoi votare anche una sola categoria alla volta. <br />
            Se invii nuovamente un voto, quello precedente verrà aggiornato. <br />
            Dopo l’invio, vedrai sempre a schermo un messaggio con l’esito della votazione.
          </p>

          <h3 style={subTitleStyle}>🎯 Voto Esploratori e Guide</h3>
          <p style={pStyle}>Ogni squadriglia può esprimere un voto per ciascuna categoria:</p>
          <ul style={ulStyle}>
            <li><strong>Miglior impresa</strong></li>
            <li><strong>Impresa più green</strong></li>
            <li><strong>Impresa più innovativa</strong></li>
          </ul>
          <p style={pStyle}>
            È necessario usare il proprio codice di squadriglia che inizia con <code>O-</code> e ha 4 cifre.
          </p>

          <h3 style={subTitleStyle}>🧭 Voto Capi Reparto</h3>
          <p style={pStyle}>
            I capi votano per un solo stand nella categoria <strong>Miglior impresa</strong>.
          </p>
          <p style={pStyle}>
            Il codice per i capi inizia con <code>C-</code> e ha 3 cifre.
          </p>

          <h3 style={subTitleStyle}>📋 Lista Stand</h3>
          <p style={pStyle}>In caso ti dimentichi il numeor di uno stand, controlla la lista! </p>
          <p style={pStyle}>Potrai trovare: </p>
          <ul style={ulStyle}>
            <li><strong>Zona e Gruppo</strong></li>
            <li><strong>Squadriglia</strong> espositrice</li>
            <li><strong>Codice voto</strong> </li>
          </ul>
          <p style={alertStyle}>⚠️ Il codice è visibile anche sugli stand fisici.</p>
        </section>

        {/* 📝 Registrazione */}
        <section id="registrazione" style={sectionStyle}>
          <h2 style={macroTitleStyle}>📝 Registrazione (a cura dei capi)</h2>
          <p style={pStyle}>
            La registrazione deve essere effettuata <strong>esclusivamente dai capi reparto</strong>.
            Una volta completata, i capi riceveranno i seguenti codici:
          </p>
          <ul style={ulStyle}>
            <li>
              <strong>Capi:</strong> un codice unico per ogni capo.
            </li>
            <li>
              <strong>Ospiti:</strong> un codice per ogni squadriglia. Questi codici non sono associati direttamente alle squadriglie, ma sia chi espone sia chi è ospite ha diritto a uno di questi codici per votare.
            </li>
            <li>
              <strong>Stand:</strong> un codice <strong>associato</strong> a ogni squadriglia, da esporre in modo visibile per permettere alla squadriglia di essere votata. Siate creativi per farvi notare e raccogliere più voti!
            </li>
          </ul>
          <p style={pStyle}>I codici sono indispensabili per usare l’app e accedere alla votazione.</p>
          <div style={warningBox}>
            ⚠️ <strong>La registrazione sarà approvata da un amministratore.</strong><br />
            In caso di errori, contattare il proprio <em>IABZ</em> per assistenza.
          </div>
        </section>

        {/* 🔝 Pulsante torna su */}
        {showScrollTop && (
          <button style={scrollTopBtnStyle} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            🔝
          </button>
        )}
      </div>
    </div>
  );
};

// 🔧 Stili ottimizzati mobile-first
const containerStyle = {
  maxWidth: '720px',
  margin: '0 auto',
  backgroundColor: 'white',
  padding: 'clamp(1rem, 5vw, 2rem)',
  borderRadius: '12px',
  boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
};

const titleStyle = {
  color: '#4caf50',
  fontWeight: '700',
  textAlign: 'center',
  fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
  marginBottom: '1.5rem',
};

const indexBox = {
  backgroundColor: '#e8f5e9',
  padding: '1rem',
  borderRadius: '10px',
  marginBottom: '2rem',
  border: '1px solid #c8e6c9',
};

const btnStyle = {
  background: 'none',
  border: 'none',
  color: '#2e7d32',
  fontSize: '1.1rem',
  textAlign: 'left',
  cursor: 'pointer',
  padding: 0,
  width: '100%',
};

const sectionStyle = { marginBottom: 48 };
const macroTitleStyle = {
  fontSize: 'clamp(1.4rem, 4vw, 1.9rem)',
  fontWeight: '700',
  color: '#fbc02d',
  marginBottom: '1rem',
};
const subTitleStyle = {
  fontSize: 'clamp(1.2rem, 3vw, 1.4rem)',
  fontWeight: '600',
  color: '#388e3c',
  marginTop: '1.5rem',
  marginBottom: '0.5rem',
};
const pStyle = { fontSize: 'clamp(1rem, 2.5vw, 1.1rem)', lineHeight: 1.6 };
const ulStyle = {
  fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
  lineHeight: 1.6,
  paddingLeft: '1.4rem',
  marginBottom: '1rem',
};
const alertStyle = { fontWeight: '600', color: '#a67c00' };
const warningBox = {
  backgroundColor: '#fff3cd',
  color: '#856404',
  padding: '1rem',
  borderRadius: '8px',
  fontWeight: '600',
  marginTop: '1rem',
  border: '1px solid #ffeeba',
};
const scrollTopBtnStyle = {
  position: 'fixed',
  bottom: '1rem',
  right: '1rem',
  padding: '0.6rem 1rem',
  fontSize: '1rem',
  borderRadius: '100px',
  backgroundColor: '#4caf50',
  color: 'white',
  border: 'none',
  boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  zIndex: 1000,
};

export default HowToUse;
