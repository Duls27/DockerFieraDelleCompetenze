/*
==========================================
Schema Database per "Fiera delle Competenze"
==========================================

Database: PostgreSQL

Questo schema è progettato specificamente per PostgreSQL (versione 12+ raccomandata),
sfruttando pienamente i suoi meccanismi di integrità referenziale, tipi avanzati,
e gestione di vincoli con azioni cascade e set null.

---

Panoramica:

1. Registrazioni generali di gruppi partecipanti, con dati anagrafici e organizzativi.
2. Anagrafiche di "capi", "ospiti" e "stand" collegati a ciascuna registrazione.
3. Tabelle di voto separate per capi e ospiti, collegate tramite codici univoci di autenticazione.

---

Caratteristiche tecniche:

- Uso di SERIAL per chiavi surrogate auto-incrementali.
- Foreign key con ON DELETE CASCADE per eliminazioni a cascata, garantendo coerenza.
- Foreign key con ON DELETE SET NULL per mantenere integrità referenziale nei campi voto, azzerando i riferimenti quando necessario.
- Indici creati per ottimizzare JOIN e ricerche.
- Tipi VARCHAR con lunghezza definita e uso di TIMESTAMP con/f senza timezone dove opportuno.
- Uso di array TEXT[] per campi multipli (es. nome_squadriglie).

---

Tabelle:

- registrazioni_generali
- configurazione
- amministratori
- stand
- ospiti
- capi
- voti_ospiti
- voti_capi
- comunicazioni

---

Integrità e comportamento:

- Cancellazione di una registrazione elimina automaticamente capi, ospiti e stand.
- Eliminazione di capi o ospiti cancella i rispettivi voti.
- Eliminazione di uno stand azzera automaticamente i riferimenti nei voti (campi miglior_impresa, etc.).
- I codici di autenticazione sono univoci e fondamentali per i riferimenti tra tabelle.

---

Questo schema consente di minimizzare la logica di gestione nel backend,
facilitando la manutenzione e garantendo la coerenza dati tramite il DB.

*/

-- =====================
-- 1. registrazioni_generali
-- =====================
CREATE TABLE registrazioni_generali (
  id SERIAL PRIMARY KEY,
  email VARCHAR(150) NOT NULL,
  numero_capi INTEGER NOT NULL,
  nome_zona VARCHAR(100) NOT NULL,
  nome_gruppo VARCHAR(100) NOT NULL,
  numero_stand INTEGER NOT NULL,
  nome_squadriglie TEXT[],
  numero_squadriglie_ospiti INTEGER NOT NULL,
  approvata BOOLEAN DEFAULT FALSE,
  creato_il TIMESTAMP DEFAULT NOW(),
  email_sended BOOLEAN DEFAULT FALSE
);

-- =====================
-- 2. configurazione
-- =====================
CREATE TABLE configurazione (
  id            SERIAL PRIMARY KEY,
  modalita_fiera BOOLEAN DEFAULT FALSE,
  config_name    VARCHAR(50) UNIQUE
);

INSERT INTO configurazione (modalita_fiera, config_name)
VALUES (FALSE, 'votazioni');

INSERT INTO configurazione (modalita_fiera, config_name)
VALUES (FALSE, 'registrazioni');

-- =====================
-- 3. amministratori
-- =====================
CREATE TABLE amministratori (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cognome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255),
  creato_il TIMESTAMP DEFAULT NOW()
);

INSERT INTO amministratori
        (nome,  cognome, email, username, password)
VALUES  ('Super', 'Admin', 'simone.dopti@gmail.com', 'super.admin', '');


-- =====================
-- 4. stand  (figlio di registrazioni_generali)
-- =====================
CREATE TABLE stand (
  id SERIAL PRIMARY KEY,
  nome_squadriglia VARCHAR(100),
  nome_gruppo VARCHAR(100),
  nome_zona VARCHAR(100),
  vote_autenticator VARCHAR(100) UNIQUE NOT NULL,
  registrazione_id INTEGER NOT NULL REFERENCES registrazioni_generali(id) ON DELETE CASCADE
);
CREATE INDEX idx_stand_registrazione ON stand(registrazione_id);

-- =====================
-- 5. ospiti (figlio di registrazioni_generali)
-- =====================
CREATE TABLE ospiti (
  id SERIAL PRIMARY KEY,
  nome_gruppo VARCHAR(100),
  nome_zona VARCHAR(100),
  vote_autenticator VARCHAR(100) UNIQUE NOT NULL,
  registrazione_id INTEGER NOT NULL REFERENCES registrazioni_generali(id) ON DELETE CASCADE
);
CREATE INDEX idx_ospiti_registrazione ON ospiti(registrazione_id);

-- =====================
-- 6. capi (figlio di registrazioni_generali)
-- =====================
CREATE TABLE capi (
  id SERIAL PRIMARY KEY,
  nome_zona VARCHAR(100),
  nome_gruppo VARCHAR(100),
  vote_autenticator VARCHAR(100) UNIQUE NOT NULL,
  registrazione_id INTEGER NOT NULL REFERENCES registrazioni_generali(id) ON DELETE CASCADE
);
CREATE INDEX idx_capi_registrazione ON capi(registrazione_id);

-- =================================================================
-- 7. voti_ospiti – FK a ospiti (cascade) + FK a stand (set null)
-- =================================================================
CREATE TABLE voti_ospiti (
  id SERIAL PRIMARY KEY,
  codice_verifica VARCHAR(10) NOT NULL REFERENCES ospiti (vote_autenticator) ON DELETE CASCADE,
  miglior_impresa     VARCHAR(100),
  impresa_green       VARCHAR(100),
  impresa_innovativa  VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_vo_miglior_impresa   FOREIGN KEY (miglior_impresa)    REFERENCES stand (vote_autenticator) ON DELETE SET NULL,
  CONSTRAINT fk_vo_impresa_green     FOREIGN KEY (impresa_green)      REFERENCES stand (vote_autenticator) ON DELETE SET NULL,
  CONSTRAINT fk_vo_impresa_innovativa FOREIGN KEY (impresa_innovativa) REFERENCES stand (vote_autenticator) ON DELETE SET NULL
);

-- ================================================================
-- 8. voti_capi – FK a capi (cascade) + FK a stand (set null)
-- ================================================================
CREATE TABLE voti_capi (
  id SERIAL PRIMARY KEY,
  codice_verifica VARCHAR(10) NOT NULL REFERENCES capi (vote_autenticator) ON DELETE CASCADE,
  miglior_impresa VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_vc_miglior_impresa FOREIGN KEY (miglior_impresa) REFERENCES stand (vote_autenticator) ON DELETE SET NULL
);

-- ================================================================
-- 8. Tabella per la sezione notizie
-- ================================================================

-- Crea la tabella con colonne per la comunicazione
CREATE TABLE comunicazioni (
    id INT PRIMARY KEY DEFAULT 1,
    titolo VARCHAR(255) NOT NULL,
    corpo TEXT NOT NULL,
    data_pubblicazione TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO comunicazioni (id, titolo, corpo, data_pubblicazione)
VALUES (
  1,
  'Benvenuto nella sezione comunicazioni',
  'Qui troverai le notizie e gli aggiornamenti più importanti riguardo la Fiera delle Competenze. La comunicazione verrà aggiornata regolarmente.',
  NOW()
);



/* Schema pronto e ottimizzato per PostgreSQL! */
