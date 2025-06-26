const express = require('express');
const router = express.Router();
const pool = require('./db');
const logger  = require('./logger');

const { sendCodiciEmail } = require('./mailer');
const { sendAdminCredentialsEmail } = require('./mailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto  = require('crypto');
const { log } = require('console');
const { Logger } = require('winston');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

//funcions
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Accesso negato' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token non valido' });
    req.user = user;
    next();
  });
}

//GET methods

// --- GET: prendi il messaggio unico
router.get('/notizia', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT titolo, corpo, data_pubblicazione FROM comunicazioni WHERE id = 1'
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Nessuna notizia attualmente disponibile' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    logger.error('Errore recupero messaggio notizie:', error);
    res.status(500).json({ message: 'Errore server' });
  }
});

// --- GET lista amministratori ---
router.get('/amministratori', async (req, res) => {
  logger.info('Ricevuta richiesta GET /amministratori');
  try {
    const query = `
      SELECT id, nome, cognome, username
      FROM amministratori
      ORDER BY cognome, nome
    `;
    const { rows } = await pool.query(query);
    logger.info(`Restituiti ${rows.length} amministratori`);
    res.json(rows);  // esempio: [{ id:1, nome:'Anna', cognome:'Rossi', username:'arossi' }, ...]
  } catch (error) {
    logger.error('Errore fetching amministratori:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});


// -- GET Stand List
router.get('/stand/list', async (req, res) => {
  logger.info('Ricevuta richiesta GET /stand/list');
  try {
    const result = await pool.query(`
      SELECT nome_zona, nome_gruppo, nome_squadriglia, vote_autenticator
      FROM stand
      ORDER BY nome_zona, nome_gruppo, nome_squadriglia
    `);
    logger.info(`Recuperati ${result.rows.length} stand`);
    res.json(result.rows);
  } catch (err) {
    logger.error('Errore recupero stand:', err);
    res.status(500).json({ message: 'Errore interno server' });
  }
});


// --- GET registrazioni in attesa di approvazione
router.get('/registrazioni-generali/pendenti', async (req, res) => {
  logger.info('Ricevuta richiesta GET /registrazioni-generali/pendenti');
  try {
    const result = await pool.query(
      `SELECT * FROM registrazioni_generali WHERE approvata = false ORDER BY creato_il ASC`
    );
    logger.info(`Trovate ${result.rows.length} registrazioni pendenti`);
    res.json(result.rows);
  } catch (error) {
    logger.error('Errore fetching registrazioni pendenti:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});


// --- GET registrazioni approvate
router.get('/registrazioni-generali/approvate', async (req, res) => {
  logger.info('Ricevuta richiesta GET /registrazioni-generali/approvate');
  try {
    const result = await pool.query(
      `SELECT * FROM registrazioni_generali WHERE approvata = true ORDER BY creato_il ASC`
    );
    logger.info(`Trovate ${result.rows.length} registrazioni approvate`);
    res.json(result.rows);
  } catch (error) {
    logger.error('Errore fetching registrazioni approvate:', error);
    res.status(500).json({ error: 'Errore server' });
  }
});


// --- GET: restituisce modalita_fiera per qualunque config_name
router.get('/configurazione/:name', async (req, res) => {
  const configName = req.params.name;
  logger.info(`Richiesta GET /configurazione/${configName}`);

  // opzionale: validazione dei nomi ammessi
  const nomiAmmessi = ['votazioni', 'registrazioni'];
  if (!nomiAmmessi.includes(configName)) {
    logger.warn(`Parametro non valido: ${configName}`);
    return res.status(400).json({ message: 'Parametro non valido' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT modalita_fiera FROM configurazione WHERE config_name = $1',
      [configName]
    );

    if (rows.length === 0) {
      logger.warn(`Configurazione non trovata: ${configName}`);
      return res.status(404).json({ message: 'Configurazione non trovata' });
    }

    const { modalita_fiera } = rows[0];
    logger.info(`Modalità fiera (${configName}): ${modalita_fiera}`);
    res.json({ modalita_fiera });
  } catch (err) {
    logger.error('Errore nel recupero configurazione:', err);
    res.status(500).json({ message: 'Errore nel recupero configurazione' });
  }
});


// --- GET: Cerca ids per utenti già iscritti
router.get('/cerca', async (req, res) => {
  try {
    const zona = req.query.zona;
    const gruppo = req.query.gruppo;

    if (!zona) {
      return res.status(400).json({ error: 'Parametro "zona" è obbligatorio' });
    }

    let capiQuery = `SELECT nome_zona, nome_gruppo, vote_autenticator FROM capi WHERE nome_zona = $1`;
    let ospitiQuery = `SELECT nome_zona, nome_gruppo, vote_autenticator FROM ospiti WHERE nome_zona = $1`;
    let standQuery = `SELECT nome_zona, nome_gruppo, nome_squadriglia, vote_autenticator FROM stand WHERE nome_zona = $1`;

    const params = [zona];

    if (gruppo) {
      capiQuery += ` AND nome_gruppo = $2`;
      ospitiQuery += ` AND nome_gruppo = $2`;
      standQuery += ` AND nome_gruppo = $2`;
      params.push(gruppo);
    }

    const [capiResult, ospitiResult, standResult] = await Promise.all([
      pool.query(capiQuery, params),
      pool.query(ospitiQuery, params),
      pool.query(standQuery, params),
    ]);

    const capi = capiResult.rows;
    const ospiti = ospitiResult.rows;
    const stand = standResult.rows;

    res.json({ capi, ospiti, stand });
  } catch (error) {
    logger.error('Errore durante la ricerca utenti iscritti:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});


/*  GET  /live-results
    Ritorna:
    {
      winnersOspiti : { miglior_impresa:{…}, impresa_green:{…}, impresa_innovativa:{…} },
      winnersCapi   : { miglior_impresa:{…} },
      stats         : { totalOspiti, votersOspiti, percentOspiti, totalCapi, votersCapi, percentCapi }
    }
*/

router.get('/live-results', async (req, res) => {
  const limit = parseInt(req.query.limit) || 3;
  try {
    const queryTopOspiti = (colonna) => `
      SELECT 
        s.vote_autenticator, 
        s.nome_squadriglia, 
        s.nome_zona,
        s.nome_gruppo, 
        COUNT(*) AS voti
      FROM voti_ospiti v
      JOIN stand s ON s.vote_autenticator = v.${colonna}
      WHERE v.${colonna} IS NOT NULL
      GROUP BY s.vote_autenticator, s.nome_squadriglia, s.nome_zona, s.nome_gruppo
      ORDER BY voti DESC
      LIMIT $1
    `;

    const queryTopCapi = `
      SELECT 
        s.vote_autenticator, 
        s.nome_squadriglia, 
        s.nome_zona,
        s.nome_gruppo, 
        COUNT(*) AS voti
      FROM voti_capi v
      JOIN stand s ON s.vote_autenticator = v.miglior_impresa
      WHERE v.miglior_impresa IS NOT NULL
      GROUP BY s.vote_autenticator, s.nome_squadriglia, s.nome_zona, s.nome_gruppo
      ORDER BY voti DESC
      LIMIT $1
    `;

    const [topMigliorImpresaOspiti, topGreen, topInnovativa, topCapi] = await Promise.all([
      pool.query(queryTopOspiti('miglior_impresa'), [limit]),
      pool.query(queryTopOspiti('impresa_green'), [limit]),
      pool.query(queryTopOspiti('impresa_innovativa'), [limit]),
      pool.query(queryTopCapi, [limit]),
    ]);

    const [
      ospitiTotali,
      ospitiVotanti,
      capiTotali,
      capiVotanti
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM ospiti'),
      pool.query('SELECT COUNT(DISTINCT codice_verifica) FROM voti_ospiti'),
      pool.query('SELECT COUNT(*) FROM capi'),
      pool.query('SELECT COUNT(DISTINCT codice_verifica) FROM voti_capi'),
    ]);

    res.json({
      ospiti: {
        miglior_impresa: topMigliorImpresaOspiti.rows,
        impresa_green: topGreen.rows,
        impresa_innovativa: topInnovativa.rows,
      },
      capi: {
        miglior_impresa: topCapi.rows,
      },
      percentuali: {
        ospiti: Math.round((Number(ospitiVotanti.rows[0].count) / Number(ospitiTotali.rows[0].count)) * 100),
        capi: Math.round((Number(capiVotanti.rows[0].count) / Number(capiTotali.rows[0].count)) * 100),
      },
      totali: {
        ospiti: {
          votanti: Number(ospitiVotanti.rows[0].count),
          totali: Number(ospitiTotali.rows[0].count),
        },
        capi: {
          votanti: Number(capiVotanti.rows[0].count),
          totali: Number(capiTotali.rows[0].count),
        }
      }
    });
  } catch (err) {
    logger.error('Errore nel recupero risultati live:', err);
    res.status(500).json({ message: 'Errore nel calcolo dei risultati live' });
  }
});


//POST methods

// --- POST: Inserimento registrazione generale
router.post('/registrazione-generale', async (req, res) => {
  const {
    email,
    numero_capi,
    nome_zona,
    nome_gruppo,
    numero_stand,
    nome_squadriglie,
    numero_squadriglie_ospiti
  } = req.body;

  try {
    // 1. Controllo duplicati
    const check = await pool.query(
      `SELECT * FROM registrazioni_generali WHERE nome_gruppo = $1 AND nome_zona = $2`,
      [nome_gruppo, nome_zona]
    );

    if (check.rows.length > 0) {
      return res.status(400).json({ message: 'Una registrazione per questo gruppo e zona è già stata inviata.' });
    }

    // 2. Inserimento
    await pool.query(
      `INSERT INTO registrazioni_generali (
        email, numero_capi, nome_zona, nome_gruppo,
        numero_stand, nome_squadriglie, numero_squadriglie_ospiti
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        email,
        numero_capi,
        nome_zona,
        nome_gruppo,
        numero_stand,
        nome_squadriglie,
        numero_squadriglie_ospiti
      ]
    );

    // 3. Risposta positiva
    res.status(200).json({
      message: 'Registrazione inviata con successo. Sarà valida solo dopo conferma da parte di un amministratore. Riceverai un’email con i dati di conferma.'
    });

  } catch (err) {
    logger.error('Errore registrazione generale:', err);
    res.status(500).json({ message: 'Errore durante la registrazione. Riprova più tardi.' });
  }
});
// --- POST: Login admin
router.post('/login-admin', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username e password sono obbligatori' });
  }

  try {
    // Cerca admin in DB
    const result = await pool.query('SELECT * FROM amministratori WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Username non valido' });
    }

    const admin = result.rows[0];

    // Controlla password (bcrypt)
    const hashFromDb = admin.password.trim();
    const passwordOk = await bcrypt.compare(password, hashFromDb);

    if (!passwordOk) {
      return res.status(401).json({ error: 'Password errata' });
    }

    // Crea JWT (payload minimale con id e username)
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (err) {
    logger.error('Errore login amministratore:', err);
    res.status(500).json({ error: 'Errore server' });
  }
});

// --- POST: Approvazione Registrazione Ospite
router.post('/approva-registrazione/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  // Funzioni di utilità (rimangono invariate)
  const formattaTreCifre = (num) => num.toString().padStart(3, '0');
  const generaNumeroRandom = (cifre) => {
    const min = Math.pow(10, cifre - 1);
    const max = Math.pow(10, cifre) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };
  const generaVoteAutenticatorUnico = async (prefisso, cifre, tabella) => {
    let unique = false;
    let token;
    while (!unique) {
      const numero = generaNumeroRandom(cifre);
      token = `${prefisso}${numero}`;

      const query = `SELECT 1 FROM ${tabella} WHERE vote_autenticator = $1 LIMIT 1`;
      const { rowCount } = await pool.query(query, [token]);
      if (rowCount === 0) unique = true;
    }
    return token;
  };

  try {
    const { rows } = await pool.query('SELECT * FROM registrazioni_generali WHERE id = $1', [id]);
    if (rows.length === 0) {
      logger.warn(`Registrazione con id ${id} non trovata`);
      return res.status(404).json({ error: 'Registrazione non trovata' });
    }

    const registrazione = rows[0];
    if (registrazione.approvata) {
      logger.info(`Registrazione con id ${id} già approvata`);
      return res.status(400).json({ error: 'Registrazione già approvata' });
    }

    await pool.query('UPDATE registrazioni_generali SET approvata = true WHERE id = $1', [id]);
    logger.info(`Registrazione con id ${id} approvata`);

    const maxResult = await pool.query(`SELECT MAX(CAST(vote_autenticator AS INTEGER)) AS max_vote FROM stand`);
    let maxVote = maxResult.rows[0].max_vote;
    if (!maxVote) maxVote = 0;

    const standNames = registrazione.nome_squadriglie || [];
    for (let i = 0; i < standNames.length; i++) {
      const numeroFormattato = formattaTreCifre(maxVote + i + 1);
      await pool.query(
        `INSERT INTO stand (nome_squadriglia, nome_gruppo, nome_zona, vote_autenticator, registrazione_id)
         VALUES ($1, $2, $3, $4, $5)`,
        [standNames[i], registrazione.nome_gruppo, registrazione.nome_zona, numeroFormattato, registrazione.id]
      );
    }
    logger.info(`Inseriti ${standNames.length} stand per registrazione ${id}`);

    const totaleOspiti = (registrazione.numero_squadriglie_ospiti || 0) + (standNames.length || 0);
    for (let i = 0; i < totaleOspiti; i++) {
      const voteAuthenticator = await generaVoteAutenticatorUnico('O-', 4, 'ospiti');
      await pool.query(
        `INSERT INTO ospiti (nome_gruppo, nome_zona, vote_autenticator, registrazione_id)
         VALUES ($1, $2, $3, $4)`,
        [registrazione.nome_gruppo, registrazione.nome_zona, voteAuthenticator, registrazione.id]
      );
    }
    logger.info(`Inseriti ${totaleOspiti} ospiti per registrazione ${id}`);

    for (let i = 0; i < registrazione.numero_capi; i++) {
      const voteAuthenticator = await generaVoteAutenticatorUnico('C-', 3, 'capi');
      await pool.query(
        `INSERT INTO capi (nome_zona, nome_gruppo, vote_autenticator, registrazione_id)
         VALUES ($1, $2, $3, $4)`,
        [registrazione.nome_zona, registrazione.nome_gruppo, voteAuthenticator, registrazione.id]
      );
    }
    logger.info(`Inseriti ${registrazione.numero_capi} capi per registrazione ${id}`);

    res.json({ message: 'Registrazione approvata e dati inseriti con nuovi vote_autenticator' });
  } catch (error) {
    logger.error('Errore durante approvazione registrazione:', error);
    res.status(500).json({ error: 'Errore server durante approvazione' });
  }
});


router.post('/notizia/pubblica', async (req, res) => {
  const { titolo, corpo } = req.body;

  if (!titolo || !corpo) {
    return res.status(400).json({ message: 'Titolo e corpo sono obbligatori' });
  }

  try {
    // Aggiorna la riga con id = 1
    const query = `
      UPDATE comunicazioni
      SET titolo = $1, corpo = $2, data_pubblicazione = NOW()
      WHERE id = 1
      RETURNING *;
    `;

    const result = await pool.query(query, [titolo, corpo]);

    // Se nessuna riga aggiornata, potresti fare INSERT (se preferisci)
    if (result.rowCount === 0) {
      const insertQuery = `
        INSERT INTO comunicazioni (id, titolo, corpo, data_pubblicazione)
        VALUES (1, $1, $2, NOW())
        RETURNING *;
      `;
      const insertResult = await pool.query(insertQuery, [titolo, corpo]);
      return res.status(201).json(insertResult.rows[0]);
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Errore aggiornamento comunicazione:', error);
    return res.status(500).json({ message: 'Errore server' });
  }
});

// --- POST: aggiorna modalita_fiera per qualunque config_name
// Es.: POST /configurazione/votazioni   { "modalita_fiera": true }
router.post('/configurazione/:name', async (req, res) => {
  const configName = req.params.name;           // votazioni | registrazioni …
  const { modalita_fiera } = req.body;

  // valida il body
  if (typeof modalita_fiera !== 'boolean') {
    return res.status(400).json({ error: 'modalita_fiera deve essere booleano' });
  }

  // (opzionale) limita i nomi ammessi
  const nomiAmmessi = ['votazioni', 'registrazioni'];
  if (!nomiAmmessi.includes(configName)) {
    return res.status(400).json({ error: 'Parametro name non valido' });
  }

  try {
    // aggiorna la riga corrispondente
    const { rowCount } = await pool.query(
      'UPDATE configurazione SET modalita_fiera = $1 WHERE config_name = $2',
      [modalita_fiera, configName]
    );

    if (rowCount === 0) {
      // nessuna riga con quel config_name
      return res.status(404).json({ error: 'Configurazione non trovata' });
    }

    logger.info(`modalita_fiera (${configName}) aggiornata a: ${modalita_fiera}`);
    res.json({ success: true, modalita_fiera });
  } catch (err) {
    logger.error('Errore aggiornamento modalita_fiera:', err);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});



// --- POST /invia-email Ospite con codici
router.post('/invia-email/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    // Recupera la registrazione dal DB
    const { rows } = await pool.query('SELECT * FROM registrazioni_generali WHERE id = $1', [id]);
    if (rows.length === 0) {
      logger.warn(`Registrazione con id ${id} non trovata per invio email`);
      return res.status(404).json({ error: 'Registrazione non trovata' });
    }

    const registrazione = rows[0];

    // Recupera i codici capi
    const capiRes = await pool.query(
      'SELECT vote_autenticator FROM capi WHERE nome_zona = $1 AND nome_gruppo = $2',
      [registrazione.nome_zona, registrazione.nome_gruppo]
    );
    const codiciCapi = capiRes.rows.map(r => r.vote_autenticator);

    // Recupera i codici ospiti
    const ospitiRes = await pool.query(
      'SELECT vote_autenticator FROM ospiti WHERE nome_zona = $1 AND nome_gruppo = $2',
      [registrazione.nome_zona, registrazione.nome_gruppo]
    );
    const codiciOspiti = ospitiRes.rows.map(r => r.vote_autenticator);

    // Recupera i codici stand con nome squadriglia
    const standRes = await pool.query(
      'SELECT nome_squadriglia, vote_autenticator FROM stand WHERE nome_zona = $1 AND nome_gruppo = $2',
      [registrazione.nome_zona, registrazione.nome_gruppo]
    );
    const codiciStand = standRes.rows.map(r => `${r.nome_squadriglia} - ${r.vote_autenticator}`);

    // Invia l'email
    await sendCodiciEmail(registrazione.email, codiciCapi, codiciOspiti, codiciStand, registrazione.nome_zona, registrazione.nome_gruppo);

    // Aggiorna email_sended a true
    await pool.query('UPDATE registrazioni_generali SET email_sended = true WHERE id = $1', [id]);

    logger.info(`Email inviata con successo a ${registrazione.email} per registrazione id ${id}`);
    res.json({ message: 'Email inviata con successo!' });
  } catch (error) {
    logger.error('Errore durante invio email:', error);
    res.status(500).json({ error: 'Errore durante l\'invio email' });
  }
});


router.post('/amministratori/send-password/:id', async (req, res) => {
  const adminId = req.params.id;

  try {
    // Prendi admin dal DB (senza password)
    const result = await pool.query(
      'SELECT nome, cognome, email, username FROM amministratori WHERE id = $1',
      [adminId]
    );

    if (result.rows.length === 0) {
      logger.warn(`Amministratore con id ${adminId} non trovato per invio password`);
      return res.status(404).json({ error: 'Amministratore non trovato' });
    }

    const admin = result.rows[0];

    // ── Genera password random e hash ──
    const plainPassword = crypto.randomBytes(8).toString('base64').slice(0, 10);
    const hashPassword  = await bcrypt.hash(plainPassword, 10);

    // ── Aggiorna la password hashata nel DB ──
    await pool.query(
      'UPDATE amministratori SET password = $1 WHERE id = $2',
      [hashPassword, adminId]
    );

    // ── Invia l'email con username e password in chiaro ──
    await sendAdminCredentialsEmail(
      admin.email,
      admin.username,
      plainPassword,
      `${admin.nome} ${admin.cognome}`
    );

    logger.info(`Password rigenerata e inviata via email a amministratore ${admin.username} (${admin.email})`);

    res.json({ message: 'Email inviata con successo' });

  } catch (error) {
    logger.error('Errore invio email admin:', error);
    res.status(500).json({ error: 'Errore durante l\'invio dell\'email' });
  }
});

router.post('/amministratori', async (req, res) => {
  const { nome, cognome, email } = req.body;

  if (!nome || !cognome || !email) {
    return res.status(400).json({ error: 'Nome, cognome ed email sono obbligatori' });
  }

  try {
    /* ── Username base: nome.cognome ── */
    const base = `${nome.trim().toLowerCase().replace(/\s+/g, '')}.` +
                 `${cognome.trim().toLowerCase().replace(/\s+/g, '')}`;
    let username = base;
    let suffix   = 1;

    // Se l'username esiste, aggiungi .1, .2, ...
    while (true) {
      const { rowCount } = await pool.query(
        'SELECT 1 FROM amministratori WHERE username = $1 LIMIT 1',
        [username]
      );
      if (rowCount === 0) break;
      username = `${base}.${suffix++}`;
    }

    await pool.query(
      `INSERT INTO amministratori (nome, cognome, username, email)
      VALUES ($1, $2, $3, $4)`,
      [nome.trim(), cognome.trim(), username, email.trim()]
    );

    logger.info(`Amministratore creato: username=${username}, email=${email}`);
    res.json({
      message: 'Amministratore creato con successo',
    });
  } catch (error) {
    logger.error('Errore creazione admin:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

router.post('/voti-ospiti', async (req, res) => {
  const { codice_verifica, miglior_impresa, impresa_green, impresa_innovativa } = req.body;

  if (!codice_verifica) {
    return res.status(400).json({ message: 'Codice di verifica mancante' });
  }

  try {
    // 1. Verifica che il codice_verifica esista nella tabella ospiti
    const ospiteRes = await pool.query(
      'SELECT vote_autenticator FROM ospiti WHERE vote_autenticator = $1',
      [codice_verifica]
    );
    if (ospiteRes.rowCount === 0) {
      logger.warn(`Codice verifica non valido: ${codice_verifica}`);
      return res.status(400).json({ status: 'invalid', message: 'Codice di verifica non valido' });
    }

    // 2. Verifica che i codici votati esistano nella tabella stand (controllo unico con Set)
    const codiciDaVerificare = [...new Set([miglior_impresa, impresa_green, impresa_innovativa].filter(Boolean))];

    if (codiciDaVerificare.length > 0) {
      const queryText = `
        SELECT vote_autenticator
        FROM stand
        WHERE vote_autenticator = ANY($1)
      `;
      const standRes = await pool.query(queryText, [codiciDaVerificare]);

      if (standRes.rowCount !== codiciDaVerificare.length) {
        logger.warn(`Codici votati non validi per codice_verifica ${codice_verifica}: ${codiciDaVerificare}`);
        return res.status(400).json({
          status: 'invalid',
          message: 'Alcuni codici votati non sono validi',
        });
      }
    }

    // 3. Controlla se esiste già un voto per questo codice_verifica
    const votoRes = await pool.query(
      'SELECT * FROM voti_ospiti WHERE codice_verifica = $1',
      [codice_verifica]
    );

    if (votoRes.rowCount === 0) {
      // Inserisci nuovo voto
      await pool.query(
        `INSERT INTO voti_ospiti (codice_verifica, miglior_impresa, impresa_green, impresa_innovativa)
         VALUES ($1, $2, $3, $4)`,
        [codice_verifica, miglior_impresa || null, impresa_green || null, impresa_innovativa || null]
      );
      logger.info(`Nuovo voto ospiti inserito per codice_verifica: ${codice_verifica}`);
    } else {
      // Aggiorna solo i campi presenti (non vuoti), lasciando invariati gli altri
      const current = votoRes.rows[0];
      const nuovoMiglior = miglior_impresa || current.miglior_impresa;
      const nuovoGreen = impresa_green || current.impresa_green;
      const nuovoInnovativa = impresa_innovativa || current.impresa_innovativa;

      await pool.query(
        `UPDATE voti_ospiti
         SET miglior_impresa = $2, impresa_green = $3, impresa_innovativa = $4
         WHERE codice_verifica = $1`,
        [codice_verifica, nuovoMiglior, nuovoGreen, nuovoInnovativa]
      );
      logger.info(`Voto ospiti aggiornato per codice_verifica: ${codice_verifica}`);
    }

    // 4. Recupera il voto aggiornato dal database
    const votoAggiornatoRes = await pool.query(
      'SELECT * FROM voti_ospiti WHERE codice_verifica = $1',
      [codice_verifica]
    );
    const voto = votoAggiornatoRes.rows[0];

    // Funzione di supporto per ottenere i dettagli da stand
    const getDettagli = async (codice) => {
      if (!codice) return null;
      const res = await pool.query(
        'SELECT nome_squadriglia, nome_zona FROM stand WHERE vote_autenticator = $1',
        [codice]
      );
      return res.rowCount > 0 ? res.rows[0] : null;
    };

    // Prepara i dettagli da codici salvati nel db
    const dettagli = {};
    dettagli.miglior_impresa = (await getDettagli(voto.miglior_impresa)) || { nome_squadriglia: '—', nome_zona: '—' };
    dettagli.impresa_green = (await getDettagli(voto.impresa_green)) || { nome_squadriglia: '—', nome_zona: '—' };
    dettagli.impresa_innovativa = (await getDettagli(voto.impresa_innovativa)) || { nome_squadriglia: '—', nome_zona: '—' };

    const dettagliFrontend = {
      miglior_impresa: {
        squadriglia: dettagli.miglior_impresa.nome_squadriglia,
        zona: dettagli.miglior_impresa.nome_zona,
      },
      impresa_green: {
        squadriglia: dettagli.impresa_green.nome_squadriglia,
        zona: dettagli.impresa_green.nome_zona,
      },
      impresa_innovativa: {
        squadriglia: dettagli.impresa_innovativa.nome_squadriglia,
        zona: dettagli.impresa_innovativa.nome_zona,
      },
    };

    res.json({
      status: votoRes.rowCount === 0 ? 'created' : 'updated',
      dettagli: dettagliFrontend,
    });

  } catch (err) {
    logger.error('Errore nel salvataggio del voto ospiti:', err);
    res.status(500).json({ message: 'Errore interno server' });
  }
});


// --- POST: gestione voti capi
router.post('/voti-capi', async (req, res) => {
  const { codice_verifica, miglior_impresa } = req.body;

  if (!codice_verifica) {
    return res.status(400).json({ message: 'Codice di verifica mancante' });
  }

  try {
    // 1. Verifica che il codice_verifica esista nella tabella capi
    const capoRes = await pool.query(
      'SELECT vote_autenticator FROM capi WHERE vote_autenticator = $1',
      [codice_verifica]
    );

    if (capoRes.rowCount === 0) {
      logger.warn(`Codice verifica capi non valido: ${codice_verifica}`);
      return res.status(400).json({ status: 'invalid', message: 'Codice di verifica non valido' });
    }

    // 2. Verifica che il codice votato esista nella tabella stand
    if (miglior_impresa) {
      const standRes = await pool.query(
        'SELECT nome_squadriglia, nome_zona FROM stand WHERE vote_autenticator = $1',
        [miglior_impresa]
      );

      if (standRes.rowCount === 0) {
        logger.warn(`Codice votato capi non valido: ${miglior_impresa} per codice_verifica ${codice_verifica}`);
        return res.status(400).json({ status: 'invalid', message: 'Codice votato non valido' });
      }
    }

    // 3. Controlla se esiste già un voto per questo codice_verifica
    const votoRes = await pool.query(
      'SELECT * FROM voti_capi WHERE codice_verifica = $1',
      [codice_verifica]
    );

    // Funzione helper per ottenere dettagli stand
    const getDettagli = async (codice) => {
      if (!codice) return null;
      const res = await pool.query(
        'SELECT nome_squadriglia, nome_zona FROM stand WHERE vote_autenticator = $1',
        [codice]
      );
      return res.rowCount > 0 ? res.rows[0] : null;
    };

    let status;

    if (votoRes.rowCount === 0) {
      // Inserisci nuovo voto
      await pool.query(
        `INSERT INTO voti_capi (codice_verifica, miglior_impresa)
         VALUES ($1, $2)`,
        [codice_verifica, miglior_impresa || null]
      );
      logger.info(`Nuovo voto capi inserito per codice_verifica: ${codice_verifica}`);
      status = 'created';
    } else {
      // Aggiorna solo se miglior_impresa non vuoto, altrimenti lascia il valore
      const current = votoRes.rows[0];
      const nuovoMiglior = miglior_impresa || current.miglior_impresa;

      await pool.query(
        `UPDATE voti_capi SET miglior_impresa = $2, updated_at = NOW()
         WHERE codice_verifica = $1`,
        [codice_verifica, nuovoMiglior]
      );
      logger.info(`Voto capi aggiornato per codice_verifica: ${codice_verifica}`);
      status = 'updated';
    }

    // Prepara dettagli per il frontend
    const dettagliMiglior = (await getDettagli(miglior_impresa)) || { nome_squadriglia: '—', nome_zona: '—' };

    const dettagliFrontend = {
      miglior_impresa: {
        squadriglia: dettagliMiglior.nome_squadriglia,
        zona: dettagliMiglior.nome_zona,
      },
    };

    res.json({
      status,
      dettagli: dettagliFrontend,
    });
  } catch (err) {
    logger.error('Errore nel salvataggio del voto capi:', err);
    res.status(500).json({ message: 'Errore interno server' });
  }
});


// --- PUT: aggiorna l’email di una registrazione generale
router.put('/registrazioni-generali/:id/email', async (req, res) => {
  const { id } = req.params;
  const { email } = req.body;

  // 1. Validazione minima dell’input ------------------------------
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Indirizzo e-mail non valido' });
  }

  try {
    // 2. Aggiornamento nel DB (solo il campo email) ---------------
    const query = `
      UPDATE registrazioni_generali
      SET email = $1
      WHERE id = $2
      RETURNING id, email, creato_il;
    `;
    const { rows } = await pool.query(query, [email, id]);

    if (rows.length === 0) {
      logger.warn(`Registrazione con id ${id} non trovata per aggiornamento email`);
      return res.status(404).json({ message: 'Registrazione non trovata' });
    }

    // 3. Risposta --------------------------------------------------
    logger.info(`Email aggiornata per registrazione id ${id} a ${email}`);
    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    logger.error('Errore PUT /registrazioni-generali/:id/email', err);
    return res.status(500).json({ message: 'Errore interno del server' });
  }
});


// --- DELETE /registrazione-generale/:id
router.delete('/eliminaregistrazione-ospiti/:id', async (req, res) => {
  const id = req.params.id;

  try {
    // Elimina la registrazione con quell'id
    const result = await pool.query('DELETE FROM registrazioni_generali WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      logger.warn(`Tentativo di eliminare registrazione non trovata con id ${id}`);
      return res.status(404).json({ error: 'Registrazione non trovata' });
    }

    logger.info(`Registrazione con id ${id} eliminata con successo`);
    return res.json({ message: 'Registrazione eliminata con successo' });
  } catch (error) {
    logger.error('Errore eliminazione registrazione:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});


// DELETE amministratore per id
router.delete('/amministratori/:id', async (req, res) => {
  const adminId = parseInt(req.params.id, 10);

  // Blocca la cancellazione dell'amministratore con id 1
  if (adminId === 1) {
    logger.warn('Tentativo di eliminare l\'amministratore con ID 1, operazione bloccata');
    return res.status(403).json({ error: 'L\'amministratore con ID 1 non può essere eliminato.' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM amministratori WHERE id = $1 RETURNING *',
      [adminId]
    );

    if (result.rowCount === 0) {
      logger.warn(`Amministratore con id ${adminId} non trovato per eliminazione`);
      return res.status(404).json({ error: 'Amministratore non trovato' });
    }

    logger.info(`Amministratore con id ${adminId} eliminato con successo`);
    res.json({ message: 'Amministratore eliminato con successo' });
  } catch (error) {
    logger.error('Errore eliminazione admin:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});





module.exports = router;
