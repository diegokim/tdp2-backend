const _ = require('lodash');
const SettingDB = require('../database/settingDB');
const faceAPI = require('../clients/faceAPI');

/**
 * Get Settings
 *
 */
module.exports.get = (accessToken, userId) => {
  return Promise.resolve(userId ? { id: userId } : faceAPI.getProfile(accessToken, ['id']))
    .then((fbProfile) => SettingDB.get(fbProfile.id))
    .catch((err) => Promise.reject(err))
    .then((settings) => {
      return settings || Promise.reject({ status: 404, message: 'user is not login' })
    })
}

/**
 * Update Settings
 *
 */
module.exports.update = (accessToken, body) => {
  return faceAPI.getProfile(accessToken, ['id'])
    .then((fbProfile) => {
      const settingsToUpdate = _.pick(body, ['ageRange', 'distRange', 'invisible', 'interestType'])
      return SettingDB.updateSetting(Object.assign({}, settingsToUpdate, { id: fbProfile.id }))
    })
}

/**
 * Create Setting
 *
 */
module.exports.create = (setting) => {
  const newSetting = new SettingDB(setting);
  return SettingDB.create(newSetting);
}
