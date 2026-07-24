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

// RF05: registrar una cosecha (fecha y cantidad) asociada a un cultivo
router.post('/', async (req, res) => {
  const { cultivo_id, fecha_cosecha, cantidad_kg } = req.body;

  if (!cultivo_id || !fecha_cosecha || cantidad_kg === undefined) {
    return res.status(400).json({ error: 'Cultivo, fecha y cantidad son obligatorios.' });
  }
  if (Number(cantidad_kg) <= 0) {
    return res.status(400).json({ error: 'La cantidad cosechada debe ser mayor a 0.' });
  }

  const check = await validarPropiedadCultivo(req, cultivo_id);
  if (check.error) return res.status(check.error).json({ error: check.mensaje });

  const [result] = await pool.query(
    'INSERT INTO cosechas (cultivo_id, fecha_cosecha, cantidad_kg) VALUES (?, ?, ?)',
    [cultivo_id, fecha_cosecha, cantidad_kg]
  );

  return res.status(201).json({ id: result.insertId, cultivo_id, fecha_cosecha, cantidad_kg });
});

// Listar cosechas (opcionalmente filtradas por cultivo)
router.get('/', async (req, res) => {
  const { cultivo_id } = req.query;
  const esAdmin = req.user.rol === 'administrador';

  let query = `SELECT co.* FROM cosechas co JOIN cultivos c ON c.id = co.cultivo_id WHERE 1=1`;
  const params = [];

  if (!esAdmin) {
    query += ' AND c.usuario_id = ?';
    params.push(req.user.id);
  }
  if (cultivo_id) {
    query += ' AND co.cultivo_id = ?';
    params.push(cultivo_id);
  }
  query += ' ORDER BY co.fecha_cosecha DESC';

  const [rows] = await pool.query(query, params);
  return res.json(rows);
});

module.exports = router;
