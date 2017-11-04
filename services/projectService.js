const uuid = require('uuid');
const ProjectSettingsDB = require('../database/projectSettingsDB');
const ProjectAdvertisingDB = require('../database/projectAdvertisingDB');

// configs
module.exports.updateConfig = (configId, value) => {
  return ProjectSettingsDB.updateConfig(configId, value);
}

module.exports.getConfigs = () => {
  return ProjectSettingsDB.list();
}

// advertising
module.exports.getAdvertising = () => {
  return ProjectAdvertisingDB.list();
}

module.exports.createAdvertising = (image) => {
  const id = uuid.v1();
  const newAdvert = new ProjectAdvertisingDB({ id, image });

  return ProjectAdvertisingDB.create(newAdvert);
}

module.exports.deleteAdvertising = (advertId) => {
  return ProjectAdvertisingDB.removeAdvert(advertId);
}
