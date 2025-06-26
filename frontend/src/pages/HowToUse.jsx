import React from 'react';

const HowToUse = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#d4edda', padding: '1rem' }}>
      {/* Bottone torna alla home fuori dal box */}
      <div style={{ marginBottom: '1rem' }}>
      </div>

      {/* Box centrale */}
      <div
        style={{
          maxWidth: '720px',
          margin: '0 auto',
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 6px 15px rgba(0,0,0,0.1)',
          color: '#444',
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        }}
      >
        <h1
          style={{
            color: '#4caf50',
            fontWeight: '700',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '2.2rem',
          }}
        >
          📚 Come usare l’app della Fiera delle Competenze
        </h1>

        {/* 🔧 Sezione 0: Home e Notizie in tempo reale */}
        <section style={{ marginBottom: 40 }}> {/* 🔧 */}
          <h2
            style={{
              color: '#fbc02d',
              fontSize: '1.8rem',
              marginBottom: 12,
              fontWeight: '600',
            }}
          >
            🏠 0. Home e Notizie in tempo reale {/* 🔧 */}
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}> {/* 🔧 */}
            Nella <strong>Home</strong> trovi ora una sezione <em>“Notizie e comunicazioni”</em> che gli
            organizzatori possono aggiornare in tempo reale durante la Fiera. Tienila d&rsquo;occhio — qui
            compariranno avvisi importanti, cambi di programma e tutte le informazioni utili mentre
            l&rsquo;evento è in corso! {/* 🔧 */}
          </p>
        </section>

        {/* Sezione 1: Registrazione */}
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              color: '#fbc02d',
              fontSize: '1.8rem',
              marginBottom: 12,
              fontWeight: '600',
            }}
          >
            📝 1. Registrazione
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            La registrazione deve essere effettuata <strong>esclusivamente dai capi reparto</strong>. 
            Una volta completata, i capi riceveranno i codici di accesso da distribuire ai ragazzi (Esploratori, Guide) e ai responsabili degli stand.

            Una volta approvata la registrazione, da un amministratore,  <strong>i codici verranno inviati all'email </strong> indicata in fase di registrazione.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Questi codici sono necessari per poter votare e accedere alle diverse funzionalità dell’app.
          </p>
          <div
            style={{
              backgroundColor: '#fff3cd',
              color: '#856404',
              padding: '1rem',
              borderRadius: '8px',
              fontWeight: '600',
              marginTop: '1rem',
              border: '1px solid #ffeeba',
            }}
          >
            ⚠️ <strong>La registrazione sarà comunque approvata da un amministratore.</strong> <br />
            In caso di problemi o inserimenti errati, contattare il proprio <em>IABZ</em> che potrà eliminare o modificare le registrazioni.
          </div>
        </section>

        {/* Sezione 2: Votazione Esploratori e Guide */}
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              color: '#fbc02d',
              fontSize: '1.8rem',
              marginBottom: 12,
              fontWeight: '600',
            }}
          >
            ⭐ 2. Votazione Esploratori e Guide
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            I ragazzi (Esploratori e Guide) possono votare uno stand per ogni categoria:
          </p>
          <ul
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              paddingLeft: '1.4rem',
              color: '#555',
              marginBottom: '1rem',
            }}
          >
            <li>
              <strong>Miglior impresa:</strong> il voto per l’attività più riuscita e interessante.
            </li>
            <li>
              <strong>Impresa più green:</strong> per l’attività che si distingue per sostenibilità ambientale.
            </li>
            <li>
              <strong>Impresa più innovativa:</strong> per l’attività con l’idea più creativa e originale.
            </li>
          </ul>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Per votare è necessario utilizzare un codice di verifica personale, che inizia con <code>O-</code> seguito da 4 cifre, fornito ai partecipanti dai loro capi.
          </p>
          <p style={{ fontWeight: '600', color: '#a67c00' }}>
            ⚠️ È obbligatorio inserire almeno un voto e il codice corretto per poter inviare la votazione. Inviando una seconda volta il voto, se presistente, questo verrà modificato. 
          </p>
        </section>

        {/* Sezione 3: Votazione Capi */}
        <section style={{ marginBottom: 40 }}>
          <h2
            style={{
              color: '#fbc02d',
              fontSize: '1.8rem',
              marginBottom: 12,
              fontWeight: '600',
            }}
          >
            🏆 3. Votazione Capi Reparto
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            I capi reparto esprimono il loro voto allo stand che merita il titolo di:
          </p>
          <ul
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              paddingLeft: '1.4rem',
              color: '#555',
              marginBottom: '1rem',
            }}
          >
            <li>
              <strong>Miglior impresa:</strong> il voto per l’attività che il capo ritiene la migliore.
            </li>
          </ul>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Per votare, i capi devono inserire il voto numerico e il proprio codice di verifica, che inizia con <code>C-</code> seguito da 3 cifre, ricevuto al momento della registrazione.
          </p>
          <p style={{ fontWeight: '600', color: '#a67c00' }}>
            ⚠️ È obbligatorio inserire un voto e un codice valido per inviare la votazione. Inviando una seconda volta il voto, se presistente, questo verrà modificato. 
          </p>
        </section>

        {/* Sezione 4: Lista Stand */}
        <section>
          <h2
            style={{
              color: '#fbc02d',
              fontSize: '1.8rem',
              marginBottom: 12,
              fontWeight: '600',
            }}
          >
            📋 4. Lista Stand
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Qui puoi consultare la lista completa degli stand partecipanti alla Fiera delle Competenze.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            La tabella mostra per ogni stand:
          </p>
          <ul
            style={{
              fontSize: '1.1rem',
              lineHeight: 1.6,
              paddingLeft: '1.4rem',
              color: '#555',
              marginBottom: '1rem',
            }}
          >
            <li><strong>Zona e Gruppo:</strong> luogo di appartenenza;</li>
            <li><strong>Squadriglia:</strong> la squadriglia responsabile dello stand;</li>
            <li><strong>Codice voto:</strong> il codice da utilizzare per la votazione.</li>
          </ul>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
            Il codice voto è quello che troverete esposto anche sugli stand dei partecipanti!
          </p>
          <p style={{ fontWeight: '600', color: '#a67c00' }}>
            ⚠️ Questo elenco serve per orientarti e recuperare i codici di voto, quindi consultalo con attenzione!
          </p>
        </section>
      </div>
    </div>
  );
};

export default HowToUse;
