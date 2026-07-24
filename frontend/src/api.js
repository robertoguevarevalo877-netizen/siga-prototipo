const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('siga_token');
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'Ocurrió un error inesperado.');
  }
  return data;
}

export const api = {
  login: (correo, contrasena) => request('/auth/login', { method: 'POST', body: { correo, contrasena } }),
  registro: (datos) => request('/auth/registro', { method: 'POST', body: datos }),

  listarCultivos: () => request('/cultivos'),
  crearCultivo: (datos) => request('/cultivos', { method: 'POST', body: datos }),
  historialCultivo: (id) => request(`/cultivos/${id}/historial`),

  crearSiembra: (datos) => request('/siembras', { method: 'POST', body: datos }),
  crearCosecha: (datos) => request('/cosechas', { method: 'POST', body: datos }),

  listarInsumos: () => request('/insumos'),
  crearInsumo: (datos) => request('/insumos', { method: 'POST', body: datos }),
  actualizarInsumo: (id, cantidad_disponible) =>
    request(`/insumos/${id}`, { method: 'PUT', body: { cantidad_disponible } }),

  reporteProduccion: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reportes/produccion${query ? `?${query}` : ''}`);
  },
};

export { getToken };
