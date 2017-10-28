const _ = require('lodash');
const SettingDB = require('../database/settingDB');
const ProjectSettingsDB = require('../database/projectSettingsDB');
const usersService = require('./usersService');

const LINKS_FOR_FREE_ACCOUNT_KEY = 'linksForFreeAccount';
const LINKS_FOR_PREMIUM_ACCOUNT_KEY = 'linksForPremiumAccount';

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
  return Promise.all([
    usersService.getUserId(accessToken, userId),
    ProjectSettingsDB.get(LINKS_FOR_FREE_ACCOUNT_KEY),
    ProjectSettingsDB.get(LINKS_FOR_PREMIUM_ACCOUNT_KEY)
  ])
  .then(([id, linksForFree, linksForPremium]) => {
    const settingsToUpdate = _.pick(body, ['ageRange', 'distRange', 'invisible', 'interestType', 'accountType', 'notifications'])

    if (body.accountType && body.accountType === 'free') {
      settingsToUpdate.superLinksCount = linksForFree;
    } else if (body.accountType && body.accountType === 'premium') {
      settingsToUpdate.superLinksCount = linksForPremium;
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


module.exports.defaultSettings = () => {
  return ProjectSettingsDB.get(LINKS_FOR_FREE_ACCOUNT_KEY)
    .then((value) => ({
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
      notifications: true,
      superLinksCount: value
    }))
}
