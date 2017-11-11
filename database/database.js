const mongoose = require('mongoose');
const UsersDB = require('./usersDB');
const SettingDB = require('./settingDB');
const LinkDB = require('./linkDB');
const DenouncesDB = require('./denouncesDB');
const ActiveUserDB = require('./activeUserDB');
const ProjectAdvertisingDB = require('./projectAdvertisingDB');
const ProjectHiddenLanguageDB = require('./projectHiddenLanguageDB');
const ProjectSettingsDB = require('./projectSettingsDB');

const configs = require('../config/configs').configs;

//  Uris for production and test environment
//  Usar variables de ambiente es mas seguro
const PRODUCTION_URI = process.env.PRODUCTION_URI || 'mongodb://127.0.0.1:27017/production';
const TEST_URI = process.env.TEST_URI || 'mongodb://127.0.0.1:27017/test';

//  Variable that holds the state of the database
const state = {
  'db':  null,
  'uri': null
};

//  Get the environment Test or Production from a environment variable
const env = process.env.ENV;

exports.ENV_TEST = 'env_test';
exports.ENV_PRODUCTION = 'env_production';

//  Connect to the database
module.exports.connect = function () {
  if (state.db) {
    return;
  }

  return new Promise((resolve, reject) => {
    state.uri = env === this.ENV_TEST ? TEST_URI : PRODUCTION_URI;
    mongoose.Promise = global.Promise;
    //  Database connection
    state.db = mongoose.connect(state.uri);
    //  On connection
    mongoose.connection.on('connected', () => {
      console.log('youre now connected to the database ' + state.uri);
      resolve()
    });
    //  On Error
    mongoose.connection.on('error', (err) => {
      console.log(err);
      reject(err);
    });
  });

};

//  Delete database
module.exports.drop = function () {
  if (state.db) {
    return state.db.connection.db.dropDatabase();
  }
  return Promise.reject('Drop Error');
};

// Initialize database
module.exports.initialize = function ({ profiles = [], settings = [], links = [], advertising = [], hiddenLanguage = [], activeUsers = [], denounces = {}, includeProjectConfs = false }) {
  // create indexes
  state.db.connection.collections.users.createIndex({ location: '2dsphere' })

  // create data
  const createUserProfiles = [];
  const createUserSettings = [];
  const createUserLink = [];
  const createDenounces = [];
  const createProjectConfigs = [];
  const createAdvertising = [];
  const createHiddenLanguage = [];
  const createActiveUsers = [];

  // create project configs
  if (includeProjectConfs) {
    for (const config of configs) {
      const newConfig = new ProjectSettingsDB(config);
      createProjectConfigs.push(ProjectSettingsDB.create(newConfig));
    }
  }

  profiles.forEach((user) => {
    const newUser = new UsersDB(user);
    createUserProfiles.push(UsersDB.create(newUser));
  });
  settings.forEach((setting) => {
    const newSetting = new SettingDB(setting);
    createUserSettings.push(SettingDB.create(newSetting));
  });
  links.forEach((link) => {
    const newLink = new LinkDB(link);
    createUserLink.push(LinkDB.create(newLink));
  });
  advertising.forEach((advert) => {
    const newAdvert = new ProjectAdvertisingDB(advert);
    createAdvertising.push(ProjectAdvertisingDB.create(newAdvert))
  });
  hiddenLanguage.forEach((word) => {
    const newWord = new ProjectHiddenLanguageDB(word);
    createHiddenLanguage.push(ProjectHiddenLanguageDB.create(newWord))
  });
  activeUsers.forEach((activeUser) => {
    const newActiveUser = new ActiveUserDB(activeUser);
    createActiveUsers.push(ActiveUserDB.create(newActiveUser));
  });
  (denounces.denounces || []).forEach((denounce) => {
    const newDenounce = new DenouncesDB(denounce);
    createDenounces.push(DenouncesDB.create(newDenounce));
  });
  (denounces.links || []).forEach((link) => {
    const newLink = new LinkDB(link);
    createUserLink.push(LinkDB.create(newLink));
  });

  return Promise.all(createUserProfiles)
    .then(() => Promise.all(createUserSettings))
    .then(() => Promise.all(createUserLink))
    .then(() => Promise.all(createDenounces))
    .then(() => Promise.all(createProjectConfigs))
    .then(() => Promise.all(createAdvertising))
    .then(() => Promise.all(createHiddenLanguage))
    .then(() => Promise.all(createActiveUsers))
  ;
}
