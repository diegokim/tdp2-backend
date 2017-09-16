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

  return Setting.findOne(query);
}

module.exports.updateSetting = function (setting) {
  return Setting.findOne({ id: setting.id })
  .then((existSetting) => {
    return (existSetting === null) ?
      Promise.reject({ status: 404, message: 'user is not login' }) :
      existSetting.update(setting)
  })
  .then(() => Setting.findOne({ id: setting.id }));
}

