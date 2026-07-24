-- SIGA - Sistema Web de Gestión Agrícola
-- Script de creación de base de datos (MySQL)

CREATE DATABASE IF NOT EXISTS siga_db CHARACTER SET utf8mb4;
USE siga_db;

-- RF01 / RF02: Gestión de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol ENUM('agricultor', 'administrador') NOT NULL DEFAULT 'agricultor',
  estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- RF03: Gestión de cultivos
CREATE TABLE IF NOT EXISTS cultivos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- RF04: Registro de siembras
CREATE TABLE IF NOT EXISTS siembras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cultivo_id INT NOT NULL,
  fecha_siembra DATE NOT NULL,
  observaciones VARCHAR(255),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cultivo_id) REFERENCES cultivos(id) ON DELETE CASCADE
);

-- RF05: Registro de cosechas
CREATE TABLE IF NOT EXISTS cosechas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cultivo_id INT NOT NULL,
  fecha_cosecha DATE NOT NULL,
  cantidad_kg DECIMAL(10,2) NOT NULL,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cultivo_id) REFERENCES cultivos(id) ON DELETE CASCADE
);

-- RF06: Gestión de insumos agrícolas
CREATE TABLE IF NOT EXISTS insumos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  unidad VARCHAR(30) NOT NULL DEFAULT 'litros',
  cantidad_disponible DECIMAL(10,2) NOT NULL DEFAULT 0,
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Los usuarios de demostración NO se insertan aquí porque la contraseña
-- debe quedar cifrada con bcrypt. Ejecuta "npm run seed" en /backend
-- (ver backend/src/seed.js) para crear las cuentas de demostración.
