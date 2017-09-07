const authService = require('../services/authService');
const aux = require('../utils/auxiliar.functions.js')

module.exports.login = (req, res) => {
  console.log('Request:', req.url)
  const accessToken = req.headers.authorization;

  return accessToken === undefined || accessToken.length === 0 ?
  aux.onError('Login', res, { status: 400, message: 'Missing Auth token'}) :
  authService.login(accessToken)
    .then((imagesArray) => {
      console.log('Response:', imagesArray.length, 'photos');
      return res.status(200).json(imagesArray)
    })
    .catch((err) => aux.onError('Login', res, err))
}
