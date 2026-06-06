const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL Pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'reviews_db'
});

pool.on('error', (err) => {
  console.error('Pool error:', err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes

// POST: Recevoir avis depuis n8n
app.post('/api/reviews', async (req, res) => {
  try {
    const { text, sentiment, channel } = req.body;
    
    if (!text || !sentiment) {
      return res.status(400).json({ error: 'text et sentiment requis' });
    }

    const query = `
      INSERT INTO reviews (text, sentiment, channel)
      VALUES ($1, $2, $3)
      RETURNING id, text, sentiment, channel, created_at
    `;
    
    const result = await pool.query(query, [text, sentiment, channel || 'n8n']);
    const review = result.rows[0];

    console.log('Avis reçu:', review);
    res.status(201).json({ success: true, review });
  } catch (err) {
    console.error('POST error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Récupérer tous avis
app.get('/api/reviews', async (req, res) => {
  try {
    const query = 'SELECT * FROM reviews ORDER BY created_at DESC LIMIT 100';
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('GET error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Statistiques
app.get('/api/stats', async (req, res) => {
  try {
    const totalQuery = 'SELECT COUNT(*) FROM reviews';
    const positifsQuery = `SELECT COUNT(*) FROM reviews WHERE sentiment = 'POSITIF'`;
    const negatifsQuery = `SELECT COUNT(*) FROM reviews WHERE sentiment = 'NÉGATIF'`;

    const [total, positifs, negatifs] = await Promise.all([
      pool.query(totalQuery),
      pool.query(positifsQuery),
      pool.query(negatifsQuery)
    ]);

    const totalCount = parseInt(total.rows[0].count);
    const positifsCount = parseInt(positifs.rows[0].count);
    const negatifsCount = parseInt(negatifs.rows[0].count);
    const taux = totalCount > 0 ? Math.round((positifsCount / totalCount) * 100) : 0;

    res.json({
      total: totalCount,
      positifs: positifsCount,
      negatifs: negatifsCount,
      taux
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET: Dashboard HTML
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Écoute
app.listen(PORT, () => {
  console.log(`\n🚀 API serveur sur http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`📡 DB: PostgreSQL connecté\n`);
});