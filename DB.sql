CREATE DATABASE IF NOT EXISTS 4c_lab_manager;
USE 4c_lab_manager;
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  role ENUM('admin','superadmin','formateur','apprenant') NOT NULL
);

INSERT INTO users (name, email, password, role)
VALUES 
('farah', 'farahcharfi@4clab.tn', '$2a$10$hashSuperAdmin', 'superadmin'),
('hatem', 'hatemboulila@4clab.tn', '$2a$10$hashAdmin', 'admin');
SELECT * FROM users;
INSERT INTO users (name, email, password, role)
VALUES 
('mariem', 'mariem@4clab.tn', 'Fr8vqqm172/*', 'formateur');
UPDATE users 
SET password = '$2b$10$GTT0w8DFGscV9mQaPK1ZUueWJr3d53wLTJAFIv6QTp0sVexaGRmJy' 
WHERE email = 'mariem@4clab.tn';
DELETE FROM users WHERE email = 'farahcharfi@4clab.tn';
-- Supprimer les doublons si nécessaire
DELETE FROM users WHERE email = 'farahcharfi@4clab.tn';
DELETE FROM users WHERE email = 'hatemboulila@4clab.tn';
DELETE FROM users WHERE email = 'mariem@4clab.tn';

-- Réinsérer avec les bons hash
INSERT INTO users (name, email, password, role) VALUES
('farah', 'farahcharfi@4clab.tn', '$2b$10$M/Ek8QgnUVF7QaB75cQxt.0lqzO6szy7ogertqRbsxpMCunEcrYeC', 'superadmin'),
('hatem', 'hatemboulila@4clab.tn', '$2b$10$NeDWm5u5n6/xhXL7VUgC9OSFkyFHhJBnXp9bVqRKP/ULntvTWLJwa', 'admin'),
('mariem', 'mariem@4clab.tn', '$2b$10$3vPk1H3s.5e56RAyTiHcUOdHPH0GkYpMa1otaDiDny.1tdOK5CU6S', 'formateur');
SELECT * FROM users;

