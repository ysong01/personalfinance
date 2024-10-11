const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Initialize the app and middleware
const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Routes
app.get('/transactions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transactions ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.post('/transactions', async (req, res) => {
  const { date, store, amount } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO transactions (date, store, amount) VALUES ($1, $2, $3) RETURNING *',
      [date, store, amount]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.delete('/transactions/:id', async (req, res) => {
  const id = req.params.id;
  try {
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
