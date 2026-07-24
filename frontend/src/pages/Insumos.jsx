import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [nuevo, setNuevo] = useState({ nombre: '', unidad: 'litros', cantidad_disponible: '' });
  const [edicion, setEdicion] = useState({});

  async function cargar() {
    try {
      const data = await api.listarInsumos();
      setInsumos(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crearInsumo(e) {
    e.preventDefault();
    setError('');
    try {
      await api.crearInsumo(nuevo);
      setNuevo({ nombre: '', unidad: 'litros', cantidad_disponible: '' });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function actualizarCantidad(insumo) {
    setError('');
    setMensaje('');
    const nuevaCantidad = edicion[insumo.id];
    if (nuevaCantidad === undefined || nuevaCantidad === '') return;
    try {
      await api.actualizarInsumo(insumo.id, Number(nuevaCantidad)); // CP05
      setMensaje(`Inventario de "${insumo.nombre}" actualizado a ${nuevaCantidad} ${insumo.unidad}.`);
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <h1>Insumos agrícolas</h1>

      <div className="card">
        <h2>Registrar nuevo insumo</h2>
        <form className="inline-form" onSubmit={crearInsumo}>
          <input
            placeholder="Nombre (ej. Fungicida biológico)"
            value={nuevo.nombre}
            onChange={(e) => setNuevo((f) => ({ ...f, nombre: e.target.value }))}
            required
          />
          <select value={nuevo.unidad} onChange={(e) => setNuevo((f) => ({ ...f, unidad: e.target.value }))}>
            <option value="litros">litros</option>
            <option value="kg">kg</option>
            <option value="unidades">unidades</option>
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Cantidad inicial"
            value={nuevo.cantidad_disponible}
            onChange={(e) => setNuevo((f) => ({ ...f, cantidad_disponible: e.target.value }))}
          />
          <button type="submit">Registrar</button>
        </form>
        {error && <div className="error-msg">{error}</div>}
        {mensaje && <div className="success-msg">{mensaje}</div>}
      </div>

      <div className="card">
        <h2>Inventario disponible</h2>
        <table>
          <thead>
            <tr>
              <th>Insumo</th>
              <th>Disponible</th>
              <th>Actualizar</th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((i) => (
              <tr key={i.id}>
                <td>{i.nombre}</td>
                <td>{i.cantidad_disponible} {i.unidad}</td>
                <td className="fila-accion">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Nueva cantidad"
                    value={edicion[i.id] ?? ''}
                    onChange={(e) => setEdicion((f) => ({ ...f, [i.id]: e.target.value }))}
                  />
                  <button onClick={() => actualizarCantidad(i)}>Guardar</button>
                </td>
              </tr>
            ))}
            {insumos.length === 0 && (
              <tr>
                <td colSpan="3">Todavía no hay insumos registrados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
