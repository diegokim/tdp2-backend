const uuid = require('uuid');
const ProjectSettingsDB = require('../database/projectSettingsDB');
const ProjectAdvertisingDB = require('../database/projectAdvertisingDB');
const ProjectHiddenLanguageDB = require('../database/projectHiddenLanguageDB');

// configs
module.exports.updateConfig = (configId, value) => {
  return ProjectSettingsDB.updateConfig(configId, value);
}

module.exports.getConfigs = () => {
  return ProjectSettingsDB.list()
    .then((configs) => {
      const objConfs = {};
      configs.forEach((config) => {
        delete config._id;
        delete config.__v; // TOD0: DO NOT
        objConfs[config.name] = config;
      });

      return objConfs;
    });
}

// advertising
module.exports.getAdvertising = () => {
  return ProjectAdvertisingDB.list();
}

module.exports.createAdvertising = (body) => {
  const id = uuid.v1();
  const newAdvert = new ProjectAdvertisingDB({ id, image: body.image || '', link: body.link || '' });

  return ProjectAdvertisingDB.create(newAdvert);
}

module.exports.deleteAdvertising = (advertId) => {
  return ProjectAdvertisingDB.removeAdvert(advertId);
}

module.exports.getRandomAdvertising = () => {
  return ProjectAdvertisingDB.list()
    .then((advertising) => {
      const length = advertising.length;

      return advertising[Math.floor(Math.random() * length)];
    });
}

// hidden language
module.exports.getHiddenWords = () => {
  return ProjectHiddenLanguageDB.list();
}

module.exports.createHiddenWord = (word) => {
  const id = uuid.v1();
  const newWord = new ProjectHiddenLanguageDB({ id, word });

  return ProjectHiddenLanguageDB.create(newWord);
}

module.exports.deleteHiddenWord = (wordId) => {
  return ProjectHiddenLanguageDB.removeWord(wordId);
}