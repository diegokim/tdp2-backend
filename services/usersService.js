const _ = require('lodash');
const UsersDB = require('../database/usersDB');
const faceAPI = require('../clients/faceAPI');
const settingsService = require('./settingsService');

/**
 * Get User
 *
 */
module.exports.get = (accessToken, userId) => {
  const promises = [
    this.getProfile(accessToken, userId),
    settingsService.get(accessToken, userId)
  ]
  return Promise.all(promises)
    .then(([profile, settings]) => ({ profile, settings }))
}


/**
 * Get Profile.
 *
 */
module.exports.getProfile = (accessToken, userId) => {
  return this.getUserId(accessToken, userId)
    .then((id) => UsersDB.get(id))
    .catch((err) => Promise.reject(err))
    .then((userProfile) => {
      return userProfile || Promise.reject({ status: 404, message: 'user is not login' })
    })
}


/**
 * Update profile.
 *
 */
module.exports.updateProfile = (accessToken, body, userId) => {
  return this.getUserId(accessToken, userId)
    .then((id) => {
      const profileToUpdate = _.pick(body, ['photo', 'photos', 'description', 'location']);
      // profileToUpdate.location = [-58.381584, -34.603736];

      return UsersDB.updateProfile(Object.assign({}, profileToUpdate, { id }))
    })
    .then((profile) => (_.omit(profile, ['photo', 'photos'])))
}

/**
 * Create Profile
 *
 */
module.exports.createProfile = (profile) => {
  const newUser = new UsersDB(profile);
  return UsersDB.create(newUser);
}

/**
 * Create Complete User
 *
 */
module.exports.createUser = (profile) => {
  const newUser = new UsersDB(profile);

  return UsersDB.create(newUser)
    .then(() => settingsService.defaultSettings())
    .then((defaultSettings) => settingsService.create(Object.assign(defaultSettings, { id: profile.id })))
  ;
}

/**
 * Block User
 *
 */
module.exports.blockUser = (userId) => {
  return UsersDB.updateProfile({ status: 'blocked', id: userId })
}


/**
 * Get user id
 *
 */
module.exports.getUserId = (accessToken, userId) => {
  return Promise.resolve(userId || faceAPI.getProfile(accessToken, ['id']))
}
