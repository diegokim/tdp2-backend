const denouncesService = require('../services/denouncesService');
const aux = require('../utils/auxiliar.functions.js')

module.exports.list = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return aux.validateAdminToken(accessToken)
    .then(() => denouncesService.list(accessToken))
    .then((denounces) => {
      aux.onLog('Response: denounces', denounces.length);
      return res.status(200).json(denounces)
    })
    .catch((err) => aux.onError('List denounces', res, err))
}

module.exports.update = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return aux.validateAdminToken(accessToken)
    .then(() => validateDenounce(req.body))
    .then(() => denouncesService.update(req.body))
    .then((denounce) => {
      aux.onLog('Response:', denounce);
      return res.status(200).json(denounce)
    })
    .catch((err) => aux.onError('Update denounce', res, err))
}

const validateDenounce = (denounce) => {
  const validDenounce =
    denounce.sendUID &&
    denounce.recUID &&
    denounce.status;

  return validDenounce ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'invalid denounce' })
}
