require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { login } = require('./src/auth');
const api = require('./src/routes');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Connessione al database riusata tra le richieste (serve su Vercel)
let connessione = null;
function connetti() {
  if (!connessione) connessione = mongoose.connect(process.env.MONGODB_URI);
  return connessione;
}
app.use(async (req, res, next) => {
  try { await connetti(); next(); }
  catch (e) { connessione = null; next(e); }
});

app.post('/api/auth/login', login);
app.use('/api', api);
app.use('/api', (req, res) => res.status(404).json({ message: 'Risorsa non trovata' }));

app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  else if (err.name === 'CastError') { status = 400; message = 'Identificativo non valido'; }
  else if (err.code === 11000) { status = 409; message = 'Valore già presente: ' + Object.keys(err.keyValue).join(', '); }
  if (status === 500) { console.error(err); message = 'Errore del server'; }
  res.status(status).json({ message });
});

// In locale: node server.js avvia il server. Su Vercel il file viene solo importato.
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  connetti()
    .then(() => { console.log('MongoDB connesso'); app.listen(PORT, () => console.log('App su http://localhost:' + PORT)); })
    .catch((e) => { console.error('Connessione a MongoDB fallita:', e.message); process.exit(1); });
}

module.exports = app;
