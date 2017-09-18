const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');

const settingsController = require('./controllers/settingsController');
const statusController = require('./controllers/statusController');
const usersController = require('./controllers/usersController');
const loginController = require('./controllers/loginController');
const database = require('./database/database');

const mocks = require('./database/mocks');
const profiles = mocks.mockProfiles();
const settings = mocks.mockSettings();

const app = express();
const port = process.env.PORT || 5000;
const ENV = process.env.ENV;

database.connect()
  .then(() => database.drop())
  .then(() => database.initialize(ENV === 'env_test' ? {} : { users: profiles, settings }));

//  Middleware cors
app.use(cors());

//  Body parser middleware
app.use(bodyParser.json());

//  Routes
router.get('/ping', (req, res) => statusController.ping(req, res));
router.get('/login', (req, res) => loginController.login(req, res));

// Users
router.get('/user/candidates', (req, res) => usersController.getCandidates(req, res));
router.put('/user/:userId/link', (req, res) => usersController.link(req, res));
router.get('/user/links', (req, res) => usersController.getLinks(req, res));

// Profile
router.get('/profile', (req, res) => usersController.get(req, res)); // users/profile
router.patch('/profile', (req, res) => usersController.update(req, res));

// Settings
router.get('/settings', (req, res) => settingsController.get(req, res));
router.patch('/settings', (req, res) => settingsController.update(req, res));

app.use(router);

//  Setting the invalid enpoint message for any other route
app.get('*', (req, res) => {
  res.status(400).json({ message: 'Invalid endpoint' });
});

//  Start server on port
app.listen(port, () => {
  console.log('Server started at port ' + port);
});
