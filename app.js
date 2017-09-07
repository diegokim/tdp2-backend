const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');

const statusController = require('./controllers/statusController');
const authController = require('./controllers/authController');
const database = require('./database/database');

const app = express();
const port = process.env.PORT || 5000;

database.connect()
  .then(() => database.drop())
  .then(() => database.initialize());

//  Middleware cors
app.use(cors());

//  Body parser middleware
app.use(bodyParser.json());

//  Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//  Routes
router.get('/ping', (req, res) => statusController.ping(req, res));
router.get('/login', (req, res) => authController.login(req, res));

app.use(router);

//  Setting the invalid enpoint message for any other route
app.get('*', (req, res) => {
  res.status(400).json({ message: 'Invalid endpoint' });
});

//  Start server on port
app.listen(port, () => {
  console.log('Server started at port ' + port);
});
