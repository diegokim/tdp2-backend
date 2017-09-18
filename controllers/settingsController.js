const settingsService = require('../services/settingsService');
const aux = require('../utils/auxiliar.functions.js')

module.exports.get = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return aux.validateToken(accessToken)
    .then(() => settingsService.get(accessToken))
    .then((settings) => {
      aux.onLog('Response:', settings);
      return res.status(200).json(settings)
    })
    .catch((err) => aux.onError('Get Settings', res, err))
}

module.exports.update = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return aux.validateToken(accessToken)
    .then(() => validateSettings(req.body))
    .then(() => settingsService.update(accessToken, req.body))
    .then((settings) => {
      aux.onLog('Response:', settings);
      return res.status(200).json(settings)
    })
    .catch((err) => aux.onError('Settings Profile', res, err))
}

const validateSettings = (settings) => {
  const validSettings =
    settings.ageRange ||
    settings.distRange ||
    settings.invisible ||
    settings.interestType;

  return validSettings ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'Invalid settings' })
}
