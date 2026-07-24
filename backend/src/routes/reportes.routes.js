const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// RF08: reporte básico de producción por cultivo y por periodo (ver CP06)
router.get('/produccion', async (req, res) => {
  const { desde, hasta, cultivo_id } = req.query;
  const esAdmin = req.user.rol === 'administrador';

  const params = [];
  let query = `
    SELECT c.id AS cultivo_id, c.nombre AS cultivo, c.tipo,
           COALESCE(SUM(co.cantidad_kg), 0) AS produccion_total_kg,
           COUNT(co.id) AS numero_cosechas
    FROM cultivos c
    LEFT JOIN cosechas co ON co.cultivo_id = c.id
  `;
  const condiciones = [];

  if (desde) {
    condiciones.push('(co.fecha_cosecha IS NULL OR co.fecha_cosecha >= ?)');
    params.push(desde);
  }
  if (hasta) {
    condiciones.push('(co.fecha_cosecha IS NULL OR co.fecha_cosecha <= ?)');
    params.push(hasta);
  }
  if (cultivo_id) {
    condiciones.push('c.id = ?');
    params.push(cultivo_id);
  }
  if (!esAdmin) {
    condiciones.push('c.usuario_id = ?');
    params.push(req.user.id);
  }

  if (condiciones.length) {
    query += ' WHERE ' + condiciones.join(' AND ');
  }

  query += ' GROUP BY c.id, c.nombre, c.tipo ORDER BY produccion_total_kg DESC';

  const [rows] = await pool.query(query, params);

  const totalGeneral = rows.reduce((acc, r) => acc + Number(r.produccion_total_kg), 0);

  return res.json({
    periodo: { desde: desde || null, hasta: hasta || null },
    produccion_total_kg: totalGeneral,
    detalle_por_cultivo: rows,
  });
});

module.exports = router;
