const _ = require('lodash');
const mongoose = require('mongoose')

//  Setting Schema
const SettingSchema = mongoose.Schema({
  id: {
    type: String
  },
  ageRange: {
    type: Object
  },
  distRange: {
    type: Object
  },
  invisible: {
    type: Boolean
  },
  interestType: {
    type: String
  }
})

// eslint-disable-next-line
const Setting = module.exports = mongoose.model('Setting', SettingSchema)

module.exports.create = function (setting) {
  return setting.save()
}

module.exports.get = function (id) {
  const query = { id };

  return Setting.findOne(query).then(normalizeResponse);
}

module.exports.updateSetting = function (setting) {
  return Setting.findOne({ id: setting.id })
  .then((existSetting) => {
    return (existSetting === null) ?
      Promise.reject({ status: 404, message: 'user is not login' }) :
      existSetting.update(setting)
  })
  .then(() => Setting.findOne({ id: setting.id })).then(normalizeResponse);
}


/**
 * Search:
 *  - users that have "invisible" in false
 *  - users that are searching my same interestType
 *
 */
module.exports.search = function (params) { // diferent id than I
  const interestType = (params.interestType === 'friends') ?
    { interestType: 'friends' } :
    { $or: [{ interestType: params.gender }, { interestType: 'both' }]}

  const query = {
    $and: [
      { invisible: false },
      interestType
    ]
  }

  return Setting.find(query).then(normalizeResponse);
}

const normalizeResponse = (res) => {
  if (_.isArray(res)) {
    return res.map(normalizeResponse);
  }
  return res ? res.toObject() : res;
}
