const usersService = require('../services/usersService');
const linkService = require('../services/linkService');
const aux = require('../utils/auxiliar.functions.js')

module.exports.get = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return accessToken === undefined || accessToken.length === 0 ?
  aux.onError('Get Profile', res, { status: 400, message: 'Missing Auth token'}) :
  usersService.getProfile(accessToken)
    .then((profile) => {
      aux.onLog('Response:', profile); //sacar foto y fotos
      return res.status(200).json(profile)
    })
    .catch((err) => aux.onError('Get Profile', res, err))
}

module.exports.update = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return accessToken === undefined || accessToken.length === 0 ?
  aux.onError('Update Profile', res, { status: 400, message: 'Missing Auth token'}) :
  validateProfile(req.body)
    .then(() => usersService.updateProfile(accessToken, req.body))
    .then((profile) => {
      aux.onLog('Response:', profile); //sacar foto y fotos
      return res.status(200).json(profile)
    })
    .catch((err) => aux.onError('Update Profile', res, err))
}

module.exports.getCandidates = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return accessToken === undefined || accessToken.length === 0 ?
  aux.onError('Get Candidates', res, { status: 400, message: 'Missing Auth token'}) :
  linkService.getCandidates(accessToken)
    .then((profiles) => {
      aux.onLog('Response:', profiles.length);
      return res.status(200).json(profiles)
    })
    .catch((err) => aux.onError('Get Profile', res, err))
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
