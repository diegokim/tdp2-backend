const _ = require('lodash');
const mongoose = require('mongoose')

//  Project Settings Schema
const ProjectSettingSchema = mongoose.Schema({
  prettyName: {
    type: String
  },
  name: {
    type: String
  },
  value: {}
})

// eslint-disable-next-line
const ProjectSettings = module.exports = mongoose.model('ProjectSettings', ProjectSettingSchema)

module.exports.create = function (setting) {
  return setting.save()
}

module.exports.list = function () {
  return ProjectSettings.find({}).then(normalizeResponse);
}

module.exports.get = function (name) {
  const query = { name };

  return ProjectSettings.findOne(query).then(normalizeResponse).then((res) => res && res.value);
}

module.exports.updateConfig = function (name, value) {
  return ProjectSettings.findOne({ name })
    .then((existSetting) => {
      return (existSetting === null) ?
        this.create(new this.ProjectSettings({ name, value })) : // TOD0: CHECKEAR ESTO
        existSetting.update({ value })
    })
}

const normalizeResponse = (res) => {
  if (_.isArray(res)) {
    return res.map(normalizeResponse);
  }
  return res ? res.toObject() : res;
}
