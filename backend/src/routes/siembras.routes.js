const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

async function validarPropiedadCultivo(req, cultivoId) {
  const [rows] = await pool.query('SELECT * FROM cultivos WHERE id = ?', [cultivoId]);
  const cultivo = rows[0];
  if (!cultivo) return { error: 404, mensaje: 'Cultivo no encontrado.' };
  if (req.user.rol !== 'administrador' && cultivo.usuario_id !== req.user.id) {
    return { error: 403, mensaje: 'No puedes operar sobre este cultivo.' };
  }
  return { cultivo };
}

// RF04: registrar una siembra asociada a un cultivo existente
router.post('/', async (req, res) => {
  const { cultivo_id, fecha_siembra, observaciones } = req.body;

  if (!cultivo_id || !fecha_siembra) {
    return res.status(400).json({ error: 'El cultivo y la fecha de siembra son obligatorios.' });
  }

  const check = await validarPropiedadCultivo(req, cultivo_id);
  if (check.error) return res.status(check.error).json({ error: check.mensaje });

  const [result] = await pool.query(
    'INSERT INTO siembras (cultivo_id, fecha_siembra, observaciones) VALUES (?, ?, ?)',
    [cultivo_id, fecha_siembra, observaciones || null]
  );

  return res.status(201).json({ id: result.insertId, cultivo_id, fecha_siembra, observaciones });
});

// Listar siembras (opcionalmente filtradas por cultivo)
router.get('/', async (req, res) => {
  const { cultivo_id } = req.query;
  const esAdmin = req.user.rol === 'administrador';

  let query = `SELECT s.* FROM siembras s JOIN cultivos c ON c.id = s.cultivo_id WHERE 1=1`;
  const params = [];

  if (!esAdmin) {
    query += ' AND c.usuario_id = ?';
    params.push(req.user.id);
  }
  if (cultivo_id) {
    query += ' AND s.cultivo_id = ?';
    params.push(cultivo_id);
  }
  query += ' ORDER BY s.fecha_siembra DESC';

  const [rows] = await pool.query(query, params);
  return res.json(rows);
});

module.exports = router;
