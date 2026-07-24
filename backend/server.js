const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const cultivosRoutes = require('./src/routes/cultivos.routes');
const siembrasRoutes = require('./src/routes/siembras.routes');
const cosechasRoutes = require('./src/routes/cosechas.routes');
const insumosRoutes = require('./src/routes/insumos.routes');
const reportesRoutes = require('./src/routes/reportes.routes');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', servicio: 'SIGA API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/cultivos', cultivosRoutes);
app.use('/api/siembras', siembrasRoutes);
app.use('/api/cosechas', cosechasRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/reportes', reportesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SIGA API escuchando en el puerto ${PORT}`);
});
