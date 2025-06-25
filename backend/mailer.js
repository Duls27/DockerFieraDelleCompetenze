const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: '9066a7001@smtp-brevo.com',
    pass: 'OUxfFGCdIakTHEYm',
  },
});


const sendCodiciEmail = async (toEmail, codiciCapi, codiciOspiti, codiciStand, nome_zona, nome_gruppo) => {
const htmlContent = `
  <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
    <h2 style="color: #2e7d32;">🎉 Registrazione approvata!</h2>
      <p><strong>Gruppo:</strong> ${nome_gruppo} <br/>
      <strong>Zona:</strong> ${nome_zona}</p>

    <p>Ecco i tuoi codici per la <strong>Fiera delle Competenze</strong>! 👏</p>
    <p><em>Ricordati che questi codici serviranno ad ognuno per validare il proprio voto!</em></p>

    <h4 style="color: #1976d2;">👔 Capi:</h4>
    <ul>
      ${
        codiciCapi.length > 0 
          ? codiciCapi.map(c => `<li>✅ ${c}</li>`).join('') 
          : '<li><em>Nessun capo registrato</em></li>'
      }
    </ul>

    <h4 style="color: #f57c00;">🎟️ Squadriglie:</h4>

    <p style="margin-top: 1em;">
      Questi sono i codici da dare alle squadriglie per autenticare il loro voto.</strong>
    </p>

    <ul>
      ${
        codiciOspiti.length > 0 
          ? codiciOspiti.map(c => `<li>🎫 ${c}</li>`).join('') 
          : '<li><em>Nessun ospite registrato</em></li>'
      }
    </ul>

    <h4 style="color: #0097a7;">🏕️ Stand:</h4>

    <p style="margin-top: 1em;">
      Le squadriglie che espongono, se ne avete, dovranno esporre questo numero per farsi votare! <br/>
      <strong>Siate creativi, così che vi votino più persone! 🎨✨</strong>
    </p>

    <ul>
      ${
        codiciStand.length > 0 
          ? codiciStand.map(c => `<li>📍 ${c}</li>`).join('') 
          : '<li><em>Nessuno stand registrato</em></li>'
      }
    </ul>

    <hr style="margin-top: 2em; border: none; border-top: 1px solid #ccc;"/>

    <p style="font-size: 0.9em; color: #666;">
      Questo è un messaggio automatico, ti preghiamo di non rispondere.<br/>
      In caso di problemi o per informazioni, contatta il tuo <strong>IABZ</strong>!
    </p>
  </div>
`;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM, // esempio: "Fiera delle Competenze <fiera@tuodominio.it>"
      to: toEmail,
      subject: 'Codici accesso Fiera delle Competenze',
      html: htmlContent,
    });
  } catch (error) {
    console.error('Errore invio email:', error);
    throw error; // Rilancia per gestirlo nel chiamante
  }
};

const sendAdminCredentialsEmail = async (toEmail, username, passwordPlain) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2 style="color: #1565c0;">🔐 Credenziali Accesso Amministratore</h2>
      <p>Ciao,</p>
      <p>Ti sono state assegnate le credenziali per accedere al pannello amministrativo della <strong>Fiera delle Competenze</strong>.</p>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Password:</strong> ${passwordPlain}</p>

      Se dimentichi la password o la perdi, chiedi ad un altro amministratore di reinviartela.

      <hr style="margin-top: 2em; border: none; border-top: 1px solid #ccc;"/>
      <p style="font-size: 0.9em; color: #666;">
        Questo è un messaggio automatico, ti preghiamo di non rispondere.<br/>
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: toEmail,
      subject: 'Credenziali Accesso Amministratore - Fiera delle Competenze',
      html: htmlContent,
    });
    console.log(`Email credenziali admin inviata a ${toEmail}`);
  } catch (error) {
    console.error('Errore invio email credenziali admin:', error);
    throw error;
  }
};

module.exports = {
  sendCodiciEmail,
  sendAdminCredentialsEmail,
};