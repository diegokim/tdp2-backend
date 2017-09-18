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
  return Promise.resolve(userId ? { id: userId } : faceAPI.getProfile(accessToken, ['id']))
    .then((fbProfile) => UsersDB.get(fbProfile.id))
    .catch((err) => Promise.reject(err))
    .then((userProfile) => {
      return userProfile || Promise.reject({ status: 404, message: 'user is not login' })
    })
}

/**
 * Update profile.
 *
 */
module.exports.updateProfile = (accessToken, body) => {
  return faceAPI.getProfile(accessToken, ['id'])
    .then((fbProfile) => {
      const profileToUpdate = _.pick(body, ['photo', 'photos', 'description'])
      return UsersDB.updateProfile(Object.assign({}, profileToUpdate, { id: fbProfile.id }))
    })
    .then((profile) => (_.omit(profile._doc, ['photo', 'photos'])))
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
  const newSettings = Object.assign({}, defaultSettings, { id: profile.id })
  return UsersDB.create(newUser)
    .then(() => settingsService.create(newSettings))
  ;
}

const defaultSettings = {
  ageRange: {
    min: 18,
    max: 40
  },
  distRange: {
    min: 1,
    max: 22
  },
  invisible: false,
  interestType: 'both'
}
