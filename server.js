const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
  secret: 'monSuperSecret', // 🔒 change en production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // mettre true si HTTPS
}));

// PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Retry pour requêtes DB
async function runWithRetry(query, params, retries = 5) {
  try {
    return await pool.query(query, params);
  } catch (err) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 50));
      return runWithRetry(query, params, retries - 1);
    } else {
      throw err;
    }
  }
}

// Création table users
(async () => {
  try {
    await runWithRetry(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        date_of_birth TEXT NOT NULL,
        gender TEXT NOT NULL
      );
    `);
    console.log("Tables prêtes ✅");
  } catch (err) {
    console.error("Erreur création tables :", err.message);
  }
})();

/* ---------------- ROUTES ---------------- */

// Page login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Page signup
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Page home protégée
app.get('/home', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Signup
app.post('/signup', async (req, res) => {
  const { full_name, email, password, date_of_birth, gender } = req.body;
  const sql = `INSERT INTO users (full_name, email, password, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5)`;
  const params = [full_name, email, password, date_of_birth, gender];

  try {
    await runWithRetry(sql, params);
    res.redirect('/login');
  } catch (err) {
    res.status(400).send('Erreur création utilisateur : ' + err.message);
  }
});

// Login
app.post('/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;

  try {
    const result = await runWithRetry(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [emailOrPhone, password]
    );

    if (result.rows.length > 0) {
      req.session.user = { email: emailOrPhone };
      res.redirect('/home');
    } else {
      res.status(401).send('Email ou mot de passe incorrect');
    }
  } catch (err) {
    console.error("Erreur login:", err.message);
    res.status(500).send('Erreur serveur');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    res.redirect('/login');
  });
});

/* ---------------- START SERVER ---------------- */
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
