# SIGA — Sistema Web de Gestión Agrícola

Prototipo funcional construido según la Parte 2 del proyecto (React + Node.js/Express + MySQL),
cubriendo las cinco funcionalidades mínimas: gestión de usuarios, gestión de entidades
principales (cultivos, insumos), registro de operaciones (siembras, cosechas), consulta de
información y reporte básico.

## Estructura

```
SIGA/
├── backend/     # API REST (Express + MySQL)
└── frontend/    # Interfaz web (React + Vite)
```

## 1. Ejecutar en local

### Base de datos
1. Instala MySQL (o usa una instancia ya existente).
2. Ejecuta el script: `mysql -u root -p < backend/database/schema.sql`

### Backend
```bash
cd backend
cp .env.example .env      # edita DB_USER, DB_PASSWORD, JWT_SECRET
npm install
npm run seed               # crea las 2 cuentas de demostración
npm run dev                # http://localhost:4000
```

### Frontend
```bash
cd frontend
cp .env.example .env       # confirma que VITE_API_URL apunte al backend
npm install
npm run dev                # http://localhost:5173
```

Cuentas de demostración (creadas por `npm run seed`):
- `victor.demo@siga.com` / `Demo1234` (administrador)
- `roberto.demo@siga.com` / `Demo1234` (agricultor)

## 2. Desplegarlo para obtener el enlace público

Yo no tengo acceso a internet ni a cuentas de hosting, así que el despliegue real deben
hacerlo ustedes. Es rápido — una opción sencilla y gratuita:

**Base de datos:** crear una base MySQL gratuita en [Railway](https://railway.app) o
[Clever Cloud](https://www.clever-cloud.com/).

**Backend (API):**
1. Suban la carpeta `backend/` a un repositorio de GitHub.
2. En [Render](https://render.com) → "New Web Service" → conecten el repo.
3. Build command: `npm install` — Start command: `npm start`.
4. Agreguen las variables de entorno (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `CORS_ORIGIN`) con los datos de su base de datos.
5. Al desplegar, Render les da una URL como `https://siga-api.onrender.com`.

**Frontend:**
1. Suban la carpeta `frontend/` a GitHub (puede ser el mismo repo, en otra carpeta).
2. En [Vercel](https://vercel.com) o [Netlify](https://netlify.com) → importar el repo.
3. Configuren la variable `VITE_API_URL` apuntando a la URL del backend en Render
   (ej. `https://siga-api.onrender.com/api`).
4. Al desplegar, obtendrán el enlace público, por ejemplo `https://siga-prototipo.vercel.app`.

Ese último enlace es el que deben pegar en la sección **"Enlace de despliegue"** del
documento Word, reemplazando `[completar]`.

## Funcionalidades implementadas (RF01–RF08)

| RF | Descripción | Dónde |
|----|-------------|-------|
| RF01 | Registrar, editar y listar usuarios | `backend/src/routes/auth.routes.js` |
| RF02 | Iniciar/cerrar sesión con correo y contraseña cifrada | `auth.routes.js` + `middleware/auth.js` |
| RF03 | Registrar, editar y listar cultivos | `cultivos.routes.js` |
| RF04 | Registrar siembras asociadas a un cultivo | `siembras.routes.js` |
| RF05 | Registrar cosechas (fecha y cantidad) | `cosechas.routes.js` |
| RF06 | Registrar y actualizar inventario de insumos | `insumos.routes.js` |
| RF07 | Consultar estado e historial de siembras/cosechas | `GET /cultivos/:id/historial` |
| RF08 | Reporte básico de producción por cultivo/periodo | `reportes.routes.js` |
