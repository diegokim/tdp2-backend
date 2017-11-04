const projectSettingsDB = require('../database/projectSettingsDB');

/**
 * Update project config
 *
 */
module.exports.updateConfig = (configId, value) => {
  return projectSettingsDB.updateConfig(configId, value);
}

/**
 * Get project config
 *
 */
module.exports.getConfigs = () => {
  return projectSettingsDB.list();
}
