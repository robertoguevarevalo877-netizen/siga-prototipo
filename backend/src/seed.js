// Crea las dos cuentas de demostración (una por integrante del equipo)
// con contraseña cifrada real. Ejecutar una sola vez: npm run seed
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  const cuentas = [
    { nombre: 'Victor Neira', correo: 'victor.demo@siga.com', contrasena: 'Demo1234', rol: 'administrador' },
    { nombre: 'Roberto Guevara', correo: 'roberto.demo@siga.com', contrasena: 'Demo1234', rol: 'agricultor' },
  ];

  for (const cuenta of cuentas) {
    const [existe] = await pool.query('SELECT id FROM usuarios WHERE correo = ?', [cuenta.correo]);
    if (existe.length > 0) {
      console.log(`Ya existe: ${cuenta.correo}`);
      continue;
    }
    const hash = await bcrypt.hash(cuenta.contrasena, 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena_hash, rol) VALUES (?, ?, ?, ?)',
      [cuenta.nombre, cuenta.correo, hash, cuenta.rol]
    );
    console.log(`Creado: ${cuenta.correo} / contraseña: ${cuenta.contrasena}`);
  }

  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
