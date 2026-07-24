import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';

import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Cultivos from './pages/Cultivos.jsx';
import Insumos from './pages/Insumos.jsx';
import Reportes from './pages/Reportes.jsx';

export const AuthContext = createContext(null);
export function useAuth() {
  return useContext(AuthContext);
}

function cargarSesion() {
  const token = localStorage.getItem('siga_token');
  const usuario = localStorage.getItem('siga_usuario');
  if (token && usuario) return { token, usuario: JSON.parse(usuario) };
  return null;
}

function RutaPrivada({ children }) {
  const { sesion } = useAuth();
  return sesion ? children : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  const { sesion, cerrarSesion } = useAuth();
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">🌾 SIGA</div>
        {sesion && (
          <nav>
            <Link to="/cultivos">Cultivos</Link>
            <Link to="/insumos">Insumos</Link>
            <Link to="/reportes">Reportes</Link>
            <span className="user-chip">{sesion.usuario.nombre} ({sesion.usuario.rol})</span>
            <button onClick={cerrarSesion}>Salir</button>
          </nav>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  const [sesion, setSesion] = useState(cargarSesion);
  const navigate = useNavigate();

  const iniciarSesion = (token, usuario) => {
    localStorage.setItem('siga_token', token);
    localStorage.setItem('siga_usuario', JSON.stringify(usuario));
    setSesion({ token, usuario });
    navigate('/cultivos');
  };

  const cerrarSesion = () => {
    localStorage.removeItem('siga_token');
    localStorage.removeItem('siga_usuario');
    setSesion(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ sesion, iniciarSesion, cerrarSesion }}>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to={sesion ? '/cultivos' : '/login'} replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route
            path="/cultivos"
            element={
              <RutaPrivada>
                <Cultivos />
              </RutaPrivada>
            }
          />
          <Route
            path="/insumos"
            element={
              <RutaPrivada>
                <Insumos />
              </RutaPrivada>
            }
          />
          <Route
            path="/reportes"
            element={
              <RutaPrivada>
                <Reportes />
              </RutaPrivada>
            }
          />
        </Routes>
      </Layout>
    </AuthContext.Provider>
  );
}
