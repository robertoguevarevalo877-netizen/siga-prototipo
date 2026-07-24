import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Cultivos() {
  const [cultivos, setCultivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const [nuevoCultivo, setNuevoCultivo] = useState({ nombre: '', tipo: '' });
  const [seleccionado, setSeleccionado] = useState(null);
  const [historial, setHistorial] = useState(null);

  const [siembraForm, setSiembraForm] = useState({ fecha_siembra: '', observaciones: '' });
  const [cosechaForm, setCosechaForm] = useState({ fecha_cosecha: '', cantidad_kg: '' });

  async function cargarCultivos() {
    setCargando(true);
    try {
      const data = await api.listarCultivos();
      setCultivos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarCultivos();
  }, []);

  async function crearCultivo(e) {
    e.preventDefault();
    setError('');
    setMensaje('');
    try {
      await api.crearCultivo(nuevoCultivo);
      setMensaje(`Cultivo "${nuevoCultivo.nombre}" registrado correctamente.`); // CP03
      setNuevoCultivo({ nombre: '', tipo: '' });
      cargarCultivos();
    } catch (err) {
      setError(err.message);
    }
  }

  async function verHistorial(cultivo) {
    setSeleccionado(cultivo);
    setHistorial(null);
    try {
      const data = await api.historialCultivo(cultivo.id);
      setHistorial(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function registrarSiembra(e) {
    e.preventDefault();
    setError('');
    try {
      await api.crearSiembra({ cultivo_id: seleccionado.id, ...siembraForm });
      setSiembraForm({ fecha_siembra: '', observaciones: '' });
      verHistorial(seleccionado);
    } catch (err) {
      setError(err.message);
    }
  }

  async function registrarCosecha(e) {
    e.preventDefault();
    setError('');
    try {
      await api.crearCosecha({ cultivo_id: seleccionado.id, ...cosechaForm }); // CP04
      setCosechaForm({ fecha_cosecha: '', cantidad_kg: '' });
      verHistorial(seleccionado);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <h1>Cultivos</h1>

      <div className="card">
        <h2>Registrar nuevo cultivo</h2>
        <form className="inline-form" onSubmit={crearCultivo}>
          <input
            placeholder="Nombre (ej. Cultivo primaveral - lote 1)"
            value={nuevoCultivo.nombre}
            onChange={(e) => setNuevoCultivo((f) => ({ ...f, nombre: e.target.value }))}
            required
          />
          <input
            placeholder="Tipo (ej. Caña de azúcar)"
            value={nuevoCultivo.tipo}
            onChange={(e) => setNuevoCultivo((f) => ({ ...f, tipo: e.target.value }))}
            required
          />
          <button type="submit">Registrar</button>
        </form>
        {mensaje && <div className="success-msg">{mensaje}</div>}
        {error && <div className="error-msg">{error}</div>}
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Listado</h2>
          {cargando ? (
            <p>Cargando...</p>
          ) : cultivos.length === 0 ? (
            <p>Todavía no hay cultivos registrados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cultivos.map((c) => (
                  <tr key={c.id} className={seleccionado?.id === c.id ? 'fila-activa' : ''}>
                    <td>{c.nombre}</td>
                    <td>{c.tipo}</td>
                    <td><span className="badge">{c.estado}</span></td>
                    <td>
                      <button onClick={() => verHistorial(c)}>Ver historial</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2>Historial y operaciones</h2>
          {!seleccionado && <p>Selecciona un cultivo para ver su historial.</p>}
          {seleccionado && (
            <>
              <h3>{seleccionado.nombre}</h3>

              <div className="grid-2">
                <form onSubmit={registrarSiembra}>
                  <label>Nueva siembra</label>
                  <input
                    type="date"
                    value={siembraForm.fecha_siembra}
                    onChange={(e) => setSiembraForm((f) => ({ ...f, fecha_siembra: e.target.value }))}
                    required
                  />
                  <input
                    placeholder="Observaciones (opcional)"
                    value={siembraForm.observaciones}
                    onChange={(e) => setSiembraForm((f) => ({ ...f, observaciones: e.target.value }))}
                  />
                  <button type="submit">Registrar siembra</button>
                </form>

                <form onSubmit={registrarCosecha}>
                  <label>Nueva cosecha</label>
                  <input
                    type="date"
                    value={cosechaForm.fecha_cosecha}
                    onChange={(e) => setCosechaForm((f) => ({ ...f, fecha_cosecha: e.target.value }))}
                    required
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Cantidad (kg)"
                    value={cosechaForm.cantidad_kg}
                    onChange={(e) => setCosechaForm((f) => ({ ...f, cantidad_kg: e.target.value }))}
                    required
                  />
                  <button type="submit">Registrar cosecha</button>
                </form>
              </div>

              {historial && (
                <div className="historial">
                  <h4>Siembras</h4>
                  <ul>
                    {historial.siembras.map((s) => (
                      <li key={s.id}>{s.fecha_siembra} — {s.observaciones || 'sin observaciones'}</li>
                    ))}
                    {historial.siembras.length === 0 && <li>Sin siembras registradas.</li>}
                  </ul>
                  <h4>Cosechas</h4>
                  <ul>
                    {historial.cosechas.map((c) => (
                      <li key={c.id}>{c.fecha_cosecha} — {c.cantidad_kg} kg</li>
                    ))}
                    {historial.cosechas.length === 0 && <li>Sin cosechas registradas.</li>}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
