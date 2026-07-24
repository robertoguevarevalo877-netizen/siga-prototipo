import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../App.jsx';

export default function Login() {
  const { iniciarSesion } = useAuth();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const data = await api.login(correo, contrasena);
      iniciarSesion(data.token, data.usuario);
    } catch (err) {
      // CP02: mensaje genérico sin especificar cuál dato falló
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="card auth-card">
      <h1>Iniciar sesión</h1>
      <p className="subtitle">Sistema Web de Gestión Agrícola</p>
      <form onSubmit={handleSubmit}>
        <label>Correo</label>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

        <label>Contraseña</label>
        <input type="password" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />

        {error && <div className="error-msg">{error}</div>}

        <button type="submit" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <div className="demo-box">
        <strong>Cuentas de demostración</strong>
        <p>victor.demo@siga.com / Demo1234 (administrador)</p>
        <p>roberto.demo@siga.com / Demo1234 (agricultor)</p>
      </div>

      <p>
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </div>
  );
}
