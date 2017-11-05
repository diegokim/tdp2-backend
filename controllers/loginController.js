const loginService = require('../services/loginService');
const aux = require('../utils/auxiliar.functions.js')
const auth = require('../utils/auth.functions.js')

module.exports.login = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;

  return auth.validateToken(accessToken)
    .catch(isValidError)
    .then(() => loginService.login(accessToken))
    .then((imagesOrUser) => {
      if (imagesOrUser.profile) {
        const responseToLog = { profile: aux.parseProfileToLog(imagesOrUser.profile), settings: imagesOrUser.settings };
        aux.onLog('Response: ', responseToLog);
        return res.status(200).json(imagesOrUser)
      }
      aux.onLog('Response: images');
      return res.status(201).json(imagesOrUser)
    })
    .catch((err) => aux.onError('Login', res, err))
}

const isValidError = (error) => {
  if (error.status === 404) {
    return Promise.resolve();
  }
  return Promise.reject(error);
}
