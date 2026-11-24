require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const { login } = require('./src/auth');
const api = require('./src/routes');

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  console.error('Imposta MONGODB_URI e JWT_SECRET nel file .env (vedi .env.example)');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.post('/api/auth/login', login);
app.use('/api', api);
app.use('/api', (req, res) => res.status(404).json({ message: 'Risorsa non trovata' }));

// Gestione centralizzata degli errori: ogni errore diventa una risposta JSON leggibile
app.use((err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  else if (err.name === 'CastError') { status = 400; message = 'Identificativo non valido'; }
  else if (err.code === 11000) { status = 409; message = 'Valore già presente: ' + Object.keys(err.keyValue).join(', '); }
  if (status === 500) { console.error(err); message = 'Errore del server'; }
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 3000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => { console.log('MongoDB connesso'); app.listen(PORT, () => console.log('App su http://localhost:' + PORT)); })
  .catch((e) => { console.error('Connessione a MongoDB fallita:', e.message); process.exit(1); });
