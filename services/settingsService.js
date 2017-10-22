const _ = require('lodash');
const SettingDB = require('../database/settingDB');
const usersService = require('./usersService');

const LINKS_FOR_FREE_ACCOUNT = 1;
const LINKS_FOR_PREMIUM_ACCOUNT = 5;

/**
 * Get Settings
 *
 */
module.exports.get = (accessToken, userId) => {
  return usersService.getUserId(accessToken, userId)
    .then((id) => SettingDB.get(id))
    .catch((err) => Promise.reject(err))
    .then((settings) => {
      return settings || Promise.reject({ status: 404, message: 'user is not login' })
    })
}

/**
 * Update Settings
 *
 */
module.exports.update = (accessToken, body, userId) => {
  return usersService.getUserId(accessToken, userId)
    .then((id) => {
      const settingsToUpdate = _.pick(body, ['ageRange', 'distRange', 'invisible', 'interestType', 'accountType'])

      if (body.accountType && body.accountType === 'free') {
        settingsToUpdate.superLinksCount = LINKS_FOR_FREE_ACCOUNT;
      } else if (body.accountType && body.accountType === 'premium') {
        settingsToUpdate.superLinksCount = LINKS_FOR_PREMIUM_ACCOUNT;
      }

      return SettingDB.updateSetting(Object.assign({}, settingsToUpdate, { id }))
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


module.exports.defaultSettings = {
  ageRange: {
    min: 18,
    max: 150
  },
  distRange: {
    min: 1,
    max: 30
  },
  invisible: false,
  interestType: 'both',
  accountType: 'free',
  superLinksCount: 1
}
