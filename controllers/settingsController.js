const settingsService = require('../services/settingsService');
const aux = require('../utils/auxiliar.functions.js')
const auth = require('../utils/auth.functions.js');

module.exports.get = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return auth.validateToken(accessToken)
    .then((userId) => settingsService.get(accessToken, userId))
    .then((settings) => {
      aux.onLog('Response:', settings);
      return res.status(200).json(settings)
    })
    .catch((err) => aux.onError('Get Settings', res, err))
}

module.exports.update = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return validateSettings(req.body)
    .then(() => auth.validateToken(accessToken))
    .then((userId) => settingsService.update(accessToken, req.body, userId))
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
    settings.accountType ||
    settings.notifications ||
    settings.interestType;

  return validSettings ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'Invalid settings' })
}
