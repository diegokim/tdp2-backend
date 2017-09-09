const _ = require('lodash');
const UsersDB = require('../database/usersDB');
const faceAPI = require('../clients/faceAPI');

/**
 * Get Profile.
 *
 */
module.exports.getProfile = (accessToken) => {
  return faceAPI.getProfile(accessToken, ['id'])
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
}

/**
 * Create Profile
 *
 */
module.exports.saveProfile = (profile) => {
  const newUser = new UsersDB(profile);
  return UsersDB.create(newUser);
}
