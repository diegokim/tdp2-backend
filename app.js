const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const cors = require('cors');

const settingsController = require('./controllers/settingsController');
const denouncesController = require('./controllers/denouncesController');
const statusController = require('./controllers/statusController');
const usersController = require('./controllers/usersController');
const loginController = require('./controllers/loginController');
const chatController = require('./controllers/chatController');
const projectController = require('./controllers/projectController');
const adminViewController = require('./controllers/adminController')
const database = require('./database/database');

const mocks = require('./database/mocks');
const profiles = mocks.mockProfiles();
const settings = mocks.mockSettings();
const links = mocks.mockLinks();
const denounces = mocks.mockDenounces();
const advertising = mocks.mockAdvertising();
const hiddenLanguage = mocks.mockHiddenLanguage();
const activeUsers = mocks.mockActiveUsers();

const app = express();
const port = process.env.PORT || 5000;
const ENV = process.env.ENV;

database.connect()
  .then(() => database.drop())
  .then(() => database.initialize(ENV === 'env_test' ? {} : { profiles, settings, links, denounces, advertising, hiddenLanguage, activeUsers, includeProjectConfs: true }));

//  Middleware cors
app.use(cors());

//  Body parser middleware
// app.use(bodyParser.json())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));


//  Routes
router.get('/ping', (req, res) => statusController.ping(req, res));
router.get('/login', (req, res) => loginController.login(req, res));

// Users
router.get('/users/me/candidates', (req, res) => usersController.getCandidates(req, res));
router.get('/users/me/links', (req, res) => usersController.getLinks(req, res));
router.put('/users/:userId/actions', (req, res) => usersController.addAction(req, res));
router.delete('/users/:userId', (req, res) => usersController.deleteLink(req, res));
router.delete('/users/me/account', (req, res) => usersController.deleteUser(req, res));

// Profile
router.get('/users/me/profile', (req, res) => usersController.get(req, res));
router.patch('/users/me/profile', (req, res) => usersController.update(req, res));

// Settings
router.get('/users/me/settings', (req, res) => settingsController.get(req, res));
router.patch('/users/me/settings', (req, res) => settingsController.update(req, res));

// Chat
router.post('/users/:userId/chats/message', (req, res) => chatController.sendMessage(req, res));

// Advertising
router.get('/users/advertising', (req, res) => usersController.getAdvertising(req, res));

// Admin
// Denounces
router.get('/users/denounces', (req, res) => denouncesController.list(req, res));
router.put('/users/denounces', (req, res) => denouncesController.update(req, res));

// Users
router.get('/users/:userId/profile', (req, res) => usersController.getUserProfile(req, res));

// Login
router.post('/admin/login', (req, res) => adminViewController.login(req, res));

// Project
  // Configs
router.get('/project/configs', (req, res) => projectController.getConfigs(req, res));
router.put('/project/configs/:configName', (req, res) => projectController.updateConfig(req, res));
  // Advertising
router.get('/project/advertising', (req, res) => projectController.getAdvertising(req, res));
router.post('/project/advertising', (req, res) => projectController.createAdvertising(req, res));
router.delete('/project/advertising/:advertId', (req, res) => projectController.deleteAdvertising(req, res));
  // Hidden language
router.get('/project/hiddenlanguage', (req, res) => projectController.getHiddenWords(req, res));
router.post('/project/hiddenlanguage', (req, res) => projectController.createHiddenWord(req, res));
router.patch('/project/hiddenlanguage/:wordId', (req, res) => projectController.editHiddenWord(req, res));
router.delete('/project/hiddenlanguage/:wordId', (req, res) => projectController.deleteHiddenWord(req, res));
  // Reports
router.post('/project/reports', (req, res) => projectController.getReports(req, res));

// Admin view
router.get('/*', (req, res) => adminViewController.start(req, res));

app.use(router);

//  Setting the invalid enpoint message for any other route
app.get('*', (req, res) => {
  res.status(400).json({ message: 'Invalid endpoint' });
});

//  Start server on port
app.listen(port, () => {
  console.log('Server started at port ' + port);
});
