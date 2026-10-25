const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());
app.use(cors({ origin: origins }));
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, service: 'Mini CRM API' }));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
