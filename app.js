const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const knex = require('knex');
const passport = require('passport');

const statusRoutes = require('./routes/statusRoutes');

const app = express();
const port = process.env.PORT || 5000;
const DATABASE_URL = process.env.DATABASE_URL;

const connection = DATABASE_URL || {
  user: 'postgres',
  database: 'postgres',
  port: 5432,
  host: 'localhost',
  password: 'postgres'
}

const dbClient = new knex({
  client: 'pg',
  debug: true,
  connection,
  ssl: true
});

//  Middleware cors
app.use(cors());

//  Body parser middleware
app.use(bodyParser.json());

//  Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//  Status routes
app.use(statusRoutes);

// DB test
app.get('/db', (req, res) => (
  dbClient('test_table')
  .select('*')
  .then((result) => {
    res.status(200).json({ result });
  })
))

//  Setting the invalid enpoint message for any other route
app.get('*', (req, res) => {
  res.status(400).json({ message: 'Invalid endpoint' });
});

//  Start server on port
app.listen(port, () => {
  console.log('Server started at port ' + port);
});
