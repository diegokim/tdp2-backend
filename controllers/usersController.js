const usersService = require('../services/usersService');
const aux = require('../utils/auxiliar.functions.js')

module.exports.get = (req, res) => {
  console.log('Request:', req.url)
  const accessToken = req.headers.authorization;

  return accessToken === undefined || accessToken.length === 0 ?
  aux.onError('Get Profile', res, { status: 400, message: 'Missing Auth token'}) :
  usersService.getProfile(accessToken)
    .then((profile) => {
      console.log('Response:', profile);
      return res.status(200).json(profile)
    })
    .catch((err) => aux.onError('Get Profile', res, err))
}

module.exports.update = (req, res) => {
  console.log('Request:', req.url)
  const accessToken = req.headers.authorization;

  return accessToken === undefined || accessToken.length === 0 ?
  aux.onError('Update Profile', res, { status: 400, message: 'Missing Auth token'}) :
  validateProfile(req.body)
    .then(() => usersService.updateProfile(accessToken, req.body))
    .then((profile) => {
      console.log('Response:', profile);
      return res.status(200).json(profile)
    })
    .catch((err) => aux.onError('Update Profile', res, err))
}

const validateProfile = (profile) => {
  const validProfile =
    profile.photo ||
    profile.photos ||
    profile.description;

  return validProfile ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing valid profile' })
}
