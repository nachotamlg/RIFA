-- Crear base de datos
CREATE DATABASE IF NOT EXISTS rifa_db;
USE rifa_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de números de rifa
CREATE TABLE IF NOT EXISTS rifa_numbers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  number VARCHAR(255) NOT NULL,
  description TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_number (userId, number)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_user_id ON rifa_numbers(userId);
CREATE INDEX idx_number ON rifa_numbers(number);
