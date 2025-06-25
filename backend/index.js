// index.js
require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');  
const routes  = require('./routes');
const logger  = require('./logger'); 

const app = express();

app.use(cors());
app.use(express.json());

// ───── HTTP access-log ─────
// 'tiny' crea log compatti tipo: "GET / 200 12ms – 1.3kb"
app.use(morgan('tiny', {
  stream: { write: msg => logger.http(msg.trim()) }
}));

// ───── Altre rotte ─────
app.use('/', routes);

// ───── Avvio server ─────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server in ascolto sulla porta ${PORT}`);
});
