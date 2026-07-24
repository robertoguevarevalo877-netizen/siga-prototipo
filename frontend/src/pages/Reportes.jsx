import React, { useState } from 'react';
import { api } from '../api.js';

export default function Reportes() {
  const [filtros, setFiltros] = useState({ desde: '', hasta: '' });
  const [reporte, setReporte] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function generarReporte(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const params = {};
      if (filtros.desde) params.desde = filtros.desde;
      if (filtros.hasta) params.hasta = filtros.hasta;
      const data = await api.reporteProduccion(params); // CP06
      setReporte(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="page">
      <h1>Reporte de producción</h1>

      <div className="card">
        <form className="inline-form" onSubmit={generarReporte}>
          <label>Desde</label>
          <input
            type="date"
            value={filtros.desde}
            onChange={(e) => setFiltros((f) => ({ ...f, desde: e.target.value }))}
          />
          <label>Hasta</label>
          <input
            type="date"
            value={filtros.hasta}
            onChange={(e) => setFiltros((f) => ({ ...f, hasta: e.target.value }))}
          />
          <button type="submit" disabled={cargando}>
            {cargando ? 'Generando...' : 'Generar reporte'}
          </button>
        </form>
        {error && <div className="error-msg">{error}</div>}
      </div>

      {reporte && (
        <div className="card">
          <h2>Producción total del periodo: {reporte.produccion_total_kg} kg</h2>
          <table>
            <thead>
              <tr>
                <th>Cultivo</th>
                <th>Tipo</th>
                <th>N° cosechas</th>
                <th>Producción (kg)</th>
              </tr>
            </thead>
            <tbody>
              {reporte.detalle_por_cultivo.map((r) => (
                <tr key={r.cultivo_id}>
                  <td>{r.cultivo}</td>
                  <td>{r.tipo}</td>
                  <td>{r.numero_cosechas}</td>
                  <td>{r.produccion_total_kg}</td>
                </tr>
              ))}
              {reporte.detalle_por_cultivo.length === 0 && (
                <tr>
                  <td colSpan="4">No hay datos de producción para el periodo seleccionado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
