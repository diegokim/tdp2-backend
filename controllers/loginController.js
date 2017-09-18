const loginService = require('../services/loginService');
const aux = require('../utils/auxiliar.functions.js')

module.exports.login = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return aux.validateToken(accessToken)
    .then(() => loginService.login(accessToken))
    .then((imagesOrUser) => {
      if (imagesOrUser.profile) {
        aux.onLog('Response: ', imagesOrUser); //sacar foto y fotos
        return res.status(200).json(imagesOrUser)
      }
      aux.onLog('Response: images');
      return res.status(201).json(imagesOrUser)
    })
    .catch((err) => aux.onError('Login', res, err))
}
