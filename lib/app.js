const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/cars', async(req, res) => {
  try {
    const data = await client.query(`
        SELECT cars.id, make, model, "releaseYear", "stillProduced", "energyType", owner_id, category_id, categories.name AS category FROM cars
        INNER JOIN categories
          ON categories.id = cars.category_id`);
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/cars/:id', async(req, res) => {
  try {
    const data = await client.query(`
        SELECT cars.id, make, model, "releaseYear","stillProduced", "energyType",
        owner_id, category_id, categories.name AS category FROM cars
        INNER JOIN categories
          ON categories.id = cars.category_id
        WHERE cars.id = $1;`,
      [req.params.id] //eslint-disable-line
    );
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/cars/', async(req, res) => {
  try {
    const data = await client.query(
      'INSERT INTO cars ' +
      '(make, model, "releaseYear", "stillProduced", "energyType", owner_id, category_id) ' +
      'VALUES ($1, $2, $3, $4, $5, $6, $7) ' +
      'RETURNING *;',
      [
        req.body.make,
        req.body.model,
        req.body.releaseYear,
        req.body.stillProduced,
        req.body.energyType,
        1,
        req.body.category_id
      ]
    );

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/cars/:id', async(req, res) => {
  try {
    const data = await client.query(
      'UPDATE cars ' +
      'SET ' +
        'make = $1, ' +
        'model = $2, ' +
        '"releaseYear" = $3, ' +
        '"stillProduced" = $4, ' +
        '"energyType" = $5, ' +
        'owner_id = $6, ' +
        'category_id = $7' +
      'WHERE ' +
        'id = $8 ' +
      'RETURNING *',
      [
        req.body.make,
        req.body.model,
        req.body.releaseYear,
        req.body.stillProduced,
        req.body.energyType,
        1,
        req.body.category_id,
        req.params.id
      ]
    );

    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/cars/:id', async(req, res) => {
  try {
    const data = await client.query(
      'DELETE FROM cars ' +
      'WHERE id = $1 ' +
      'RETURNING *',
      [req.params.id]
    );
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/categories', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT * FROM categories
    `);
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/categories', async (req, res) => {
  try {
    const data = await client.query(`
      INSERT INTO categories
      (name)
      VALUES ($1)
      RETURNING *;
    `, [req.body.name]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
