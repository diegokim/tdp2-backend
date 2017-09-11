const authService = require('../services/authService');
const aux = require('../utils/auxiliar.functions.js')

module.exports.login = (req, res) => {
  console.log('Request:', req.url)
  const accessToken = req.headers.authorization;

  return accessToken === undefined || accessToken.length === 0 ?
  aux.onError('Login', res, { status: 400, message: 'Missing Auth token'}) :
  authService.login(accessToken)
    .then((imagesArray) => {
      if (imagesArray.name) {
        console.log('Response: profile');
        return res.status(200).json(imagesArray)
      }
      console.log('Response: images');
      return res.status(201).json(imagesArray)
    })
    .catch((err) => aux.onError('Login', res, err))
}
