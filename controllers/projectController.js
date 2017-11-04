const projectService = require('../services/projectService');

const aux = require('../utils/auxiliar.functions.js')
const auth = require('../utils/auth.functions.js');

module.exports.updateConfig = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;
  const configName = req.params.configName
  const body = req.body;

  return auth.validateAdminToken(accessToken)
    .then(() => validateConfigId(configName))
    .then(() => validateConf(body))
    .then(() => projectService.updateConfig(configName, body.value))
    .then(() => res.status(204).json())
    .catch((err) => aux.onError('Update project config', res, err))
}

module.exports.getConfigs = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;

  return auth.validateAdminToken(accessToken)
    .then(() => projectService.getConfigs())
    .then((configs) => {
      aux.onLog('Response:', configs);
      return res.status(200).json(configs)
    })
    .catch((err) => aux.onError('Get project config', res, err))
}

const validateConf = (conf) => {
  const validConf = conf.value;

  return validConf ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing value' })
}

const validateConfigId = (configId) => {
  return configId ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing configId' })
}
