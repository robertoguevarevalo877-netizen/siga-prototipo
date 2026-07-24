import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '', rol: 'agricultor' });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMensaje('');
    setCargando(true);
    try {
      await api.registro(form);
      setMensaje('Cuenta creada correctamente. Ya puedes iniciar sesión.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card auth-card">
      <h1>Crear cuenta</h1>
      <form onSubmit={handleSubmit}>
        <label>Nombre completo</label>
        <input value={form.nombre} onChange={(e) => actualizar('nombre', e.target.value)} required />

        <label>Correo</label>
        <input type="email" value={form.correo} onChange={(e) => actualizar('correo', e.target.value)} required />

        <label>Contraseña</label>
        <input
          type="password"
          value={form.contrasena}
          onChange={(e) => actualizar('contrasena', e.target.value)}
          minLength={6}
          required
        />

        <label>Rol</label>
        <select value={form.rol} onChange={(e) => actualizar('rol', e.target.value)}>
          <option value="agricultor">Agricultor</option>
          <option value="administrador">Administrador</option>
        </select>

        {error && <div className="error-msg">{error}</div>}
        {mensaje && <div className="success-msg">{mensaje}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>
      </form>
      <p>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
