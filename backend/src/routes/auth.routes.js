const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// RF01: registrar usuario (agricultor o administrador)
router.post('/registro', async (req, res) => {
  try {
    const { nombre, correo, contrasena, rol } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
    }

    const [existentes] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [correo]);
    if (existentes.length > 0) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const rolFinal = rol === 'administrador' ? 'administrador' : 'agricultor';

    const [result] = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES (?, ?, ?, ?)',
      [nombre, correo, hash, rolFinal]
    );

    return res.status(201).json({
      mensaje: 'Cuenta creada correctamente.',
      usuario: { id: result.insertId, nombre, correo, rol: rolFinal },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al registrar el usuario.' });
  }
});

// RF02: iniciar sesión con correo y contraseña cifrada
router.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios.' });
    }

    const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
    const usuario = rows[0];

    // Mensaje genérico: no se especifica cuál dato falló (ver CP02)
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!coincide) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al iniciar sesión.' });
  }
});

// RF02: cerrar sesión (invalidación queda del lado del cliente al eliminar el token)
router.post('/logout', requireAuth, (req, res) => {
  return res.json({ mensaje: 'Sesión cerrada correctamente.' });
});

// RF01: listar usuarios (solo administrador)
router.get('/usuarios', requireAuth, requireRole('administrador'), async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, nombre, correo, rol, estado, creado_en FROM usuarios ORDER BY creado_en DESC'
  );
  return res.json(rows);
});

// RF01: editar usuario
router.put('/usuarios/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { nombre, rol, estado } = req.body;

  if (req.user.rol !== 'administrador' && Number(req.user.id) !== Number(id)) {
    return res.status(403).json({ error: 'No puedes editar otra cuenta.' });
  }

  await pool.query(
    'UPDATE usuarios SET nombre = COALESCE(?, nombre), rol = COALESCE(?, rol), estado = COALESCE(?, estado) WHERE id = ?',
    [nombre || null, req.user.rol === 'administrador' ? rol || null : null, req.user.rol === 'administrador' ? estado || null : null, id]
  );

  return res.json({ mensaje: 'Usuario actualizado correctamente.' });
});

module.exports = router;
