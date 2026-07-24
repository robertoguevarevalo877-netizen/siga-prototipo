const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// RF03: listar cultivos del agricultor autenticado (o todos si es admin)
router.get('/', async (req, res) => {
  const esAdmin = req.user.rol === 'administrador';
  const [rows] = await pool.query(
    esAdmin
      ? 'SELECT c.*, u.nombre AS agricultor FROM cultivos c JOIN usuarios u ON u.id = c.usuario_id ORDER BY c.creado_en DESC'
      : 'SELECT * FROM cultivos WHERE usuario_id = ? ORDER BY creado_en DESC',
    esAdmin ? [] : [req.user.id]
  );
  return res.json(rows);
});

// RF03: registrar un cultivo nuevo
router.post('/', async (req, res) => {
  const { nombre, tipo } = req.body;
  if (!nombre || !tipo) {
    return res.status(400).json({ error: 'Nombre y tipo del cultivo son obligatorios.' });
  }

  const [result] = await pool.query(
    'INSERT INTO cultivos (usuario_id, nombre, tipo) VALUES (?, ?, ?)',
    [req.user.id, nombre, tipo]
  );

  return res.status(201).json({ id: result.insertId, nombre, tipo, estado: 'Activo' });
});

// RF03: editar un cultivo existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, tipo, estado } = req.body;

  const [rows] = await pool.query('SELECT * FROM cultivos WHERE id = ?', [id]);
  const cultivo = rows[0];
  if (!cultivo) return res.status(404).json({ error: 'Cultivo no encontrado.' });
  if (req.user.rol !== 'administrador' && cultivo.usuario_id !== req.user.id) {
    return res.status(403).json({ error: 'No puedes editar este cultivo.' });
  }

  await pool.query(
    'UPDATE cultivos SET nombre = COALESCE(?, nombre), tipo = COALESCE(?, tipo), estado = COALESCE(?, estado) WHERE id = ?',
    [nombre || null, tipo || null, estado || null, id]
  );

  return res.json({ mensaje: 'Cultivo actualizado correctamente.' });
});

// RF07: consultar estado e historial (siembras y cosechas) de un cultivo
router.get('/:id/historial', async (req, res) => {
  const { id } = req.params;

  const [cultivoRows] = await pool.query('SELECT * FROM cultivos WHERE id = ?', [id]);
  const cultivo = cultivoRows[0];
  if (!cultivo) return res.status(404).json({ error: 'Cultivo no encontrado.' });
  if (req.user.rol !== 'administrador' && cultivo.usuario_id !== req.user.id) {
    return res.status(403).json({ error: 'No puedes consultar este cultivo.' });
  }

  const [siembras] = await pool.query(
    'SELECT * FROM siembras WHERE cultivo_id = ? ORDER BY fecha_siembra DESC',
    [id]
  );
  const [cosechas] = await pool.query(
    'SELECT * FROM cosechas WHERE cultivo_id = ? ORDER BY fecha_cosecha DESC',
    [id]
  );

  return res.json({ cultivo, siembras, cosechas });
});

module.exports = router;
