const mongoose = require('mongoose');
const UsersDB = require('./usersDB');
const SettingDB = require('./settingDB');
const LinkDB = require('./linkDB');

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
module.exports.initialize = function ({ users = [], settings = [], links = [] }) {
  // create indexes
  state.db.connection.collections.users.createIndex({ location: '2dsphere' })

  // create data
  const createUserProfiles = [];
  const createUserSettings = [];
  const createUserLink = [];
  users.forEach((user) => {
    const newUser = new UsersDB(user);
    createUserProfiles.push(UsersDB.create(newUser));
  })
  settings.forEach((setting) => {
    const newSetting = new SettingDB(setting);
    createUserSettings.push(SettingDB.create(newSetting));
  })
  links.forEach((link) => {
    const newLink = new LinkDB(link);
    createUserLink.push(LinkDB.create(newLink));
  })

  return Promise.all(createUserProfiles)
    .then(() => Promise.all(createUserSettings))
    .then(() => Promise.all(createUserLink))
  ;
}
