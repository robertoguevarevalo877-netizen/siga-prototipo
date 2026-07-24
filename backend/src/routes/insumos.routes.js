const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// RF06: listar insumos del agricultor (o todos si es admin)
router.get('/', async (req, res) => {
  const esAdmin = req.user.rol === 'administrador';
  const [rows] = await pool.query(
    esAdmin
      ? 'SELECT * FROM insumos ORDER BY actualizado_en DESC'
      : 'SELECT * FROM insumos WHERE usuario_id = ? ORDER BY actualizado_en DESC',
    esAdmin ? [] : [req.user.id]
  );
  return res.json(rows);
});

// RF06: registrar un nuevo insumo
router.post('/', async (req, res) => {
  const { nombre, unidad, cantidad_disponible } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre del insumo es obligatorio.' });

  const [result] = await pool.query(
    'INSERT INTO insumos (usuario_id, nombre, unidad, cantidad_disponible) VALUES (?, ?, ?, ?)',
    [req.user.id, nombre, unidad || 'litros', cantidad_disponible || 0]
  );

  return res.status(201).json({ id: result.insertId, nombre, unidad, cantidad_disponible });
});

// RF06: actualizar la cantidad disponible de un insumo (ver CP05)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cantidad_disponible } = req.body;

  const [rows] = await pool.query('SELECT * FROM insumos WHERE id = ?', [id]);
  const insumo = rows[0];
  if (!insumo) return res.status(404).json({ error: 'Insumo no encontrado.' });
  if (req.user.rol !== 'administrador' && insumo.usuario_id !== req.user.id) {
    return res.status(403).json({ error: 'No puedes editar este insumo.' });
  }

  await pool.query(
    'UPDATE insumos SET cantidad_disponible = ?, actualizado_en = NOW() WHERE id = ?',
    [cantidad_disponible, id]
  );

  return res.json({ mensaje: 'Inventario actualizado correctamente.' });
});

module.exports = router;
