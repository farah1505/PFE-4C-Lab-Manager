const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config(); // Pour gérer les variables d'environnement

const app = express();
app.use(cors());
app.use(express.json());

// Connexion MySQL avec gestion d'erreur améliorée
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Fr8vqqm172/*',
  database: process.env.DB_NAME || '4c_lab_manager',
  connectTimeout: 10000 // 10 secondes de timeout
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion MySQL:', err.message);
    console.error('Détails:', err);
    console.log('Vérifiez que MySQL est démarré et que les identifiants sont corrects');
    return;
  }
  console.log('✅ Connecté à MySQL - Base de données: 4c_lab_manager');
});

// Gestion de la perte de connexion
db.on('error', (err) => {
  console.error('❌ Erreur MySQL:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('La connexion à la base de données a été perdue');
  }
});

const SECRET_KEY = process.env.JWT_SECRET || '4c-lab-secret';

// Route d'accueil
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Serveur 4C Lab Manager API backend actif',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Route de test MySQL
app.get('/api/test', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      console.error('❌ Erreur test MySQL:', err);
      return res.status(500).json({ 
        success: false,
        error: 'Erreur de connexion à la base de données',
        details: err.message 
      });
    }
    res.json({ 
      success: true,
      message: 'MySQL fonctionne correctement', 
      result: results[0].result 
    });
  });
});

// REGISTER (Inscription)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role } = req.body;

  // Validation des entrées
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email et mot de passe obligatoires' 
    });
  }

  // Validation de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Format d\'email invalide' 
    });
  }

  // Validation du mot de passe
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Le mot de passe doit contenir au moins 6 caractères' 
    });
  }

  try {
    // Vérifier si l'utilisateur existe déjà
    db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
      if (err) {
        console.error('❌ Erreur vérification utilisateur:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Erreur serveur lors de la vérification' 
        });
      }

      if (results.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Cet email est déjà utilisé' 
        });
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      const userRole = role || 'apprenant';

      // Insérer l'utilisateur
      db.query(
        'INSERT INTO users (email, password, role, created_at) VALUES (?, ?, ?, NOW())',
        [email, hashedPassword, userRole],
        (err, result) => {
          if (err) {
            console.error('❌ Erreur insertion utilisateur:', err);
            return res.status(500).json({ 
              success: false, 
              message: 'Erreur lors de la création du compte' 
            });
          }

          console.log('✅ Nouvel utilisateur créé:', email, 'Role:', userRole);
          
          res.status(201).json({
            success: true,
            message: 'Compte créé avec succès',
            userId: result.insertId
          });
        }
      );
    });
  } catch (error) {
    console.error('❌ Erreur register:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

// LOGIN (Connexion)
app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;

  // Validation des entrées
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email et mot de passe obligatoires' 
    });
  }

  // Rechercher l'utilisateur
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('❌ Erreur DB login:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur' 
      });
    }

    if (results.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email ou mot de passe incorrect' 
      });
    }

    const user = results[0];

    // Vérifier si le rôle correspond (optionnel)
    if (role && user.role !== role) {
      return res.status(403).json({ 
        success: false, 
        message: `Accès refusé. Ce compte n'est pas un compte ${role}` 
      });
    }

    try {
      // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          message: 'Email ou mot de passe incorrect' 
        });
      }

      // Générer un token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email,
          role: user.role 
        },
        SECRET_KEY,
        { expiresIn: '24h' }
      );

      console.log('✅ Connexion réussie:', email, 'Role:', user.role);

      res.json({
        success: true,
        message: 'Connexion réussie',
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        }
      });
    } catch (error) {
      console.error('❌ Erreur comparaison mot de passe:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erreur serveur lors de l\'authentification' 
      });
    }
  });
});

// Middleware pour vérifier le token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token manquant' 
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token invalide ou expiré' 
    });
  }
};

// Route protégée exemple
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token valide',
    user: req.user
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route non trouvée' 
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(`🚀 Serveur 4C Lab Manager API démarré avec succès`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════');
  console.log('Routes disponibles:');
  console.log(`  GET  http://localhost:${PORT}/`);
  console.log(`  GET  http://localhost:${PORT}/api/test`);
  console.log(`  POST http://localhost:${PORT}/api/auth/register`);
  console.log(`  POST http://localhost:${PORT}/api/auth/login`);
  console.log(`  GET  http://localhost:${PORT}/api/auth/verify`);
  console.log('═══════════════════════════════════════════════');
  console.log('');
});