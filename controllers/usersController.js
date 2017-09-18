const usersService = require('../services/usersService');
const linkService = require('../services/linkService');
const aux = require('../utils/auxiliar.functions.js')

module.exports.get = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return aux.validateToken(accessToken)
    .then(() => usersService.getProfile(accessToken))
    .then((profile) => {
      aux.onLog('Response:', profile); //sacar foto y fotos
      return res.status(200).json(profile)
    })
    .catch((err) => aux.onError('Get Profile', res, err))
}

module.exports.update = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return aux.validateToken(accessToken)
    .then(() => validateProfile(req.body))
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

  return aux.validateToken(accessToken)
    .then(() => linkService.getCandidates(accessToken))
    .then((profiles) => {
      aux.onLog('Response:', profiles.length);
      return res.status(200).json({ profiles })
    })
    .catch((err) => aux.onError('Get Candidates', res, err))
}

module.exports.link = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;
  const userId = req.params.userId;
  const action = req.body.action;

  return aux.validateToken(accessToken)
    .then(() => validateAction(userId, action))
    .then(() => linkService.link(accessToken, userId, action))
    .then((response) => {
      aux.onLog('Response:', response);
      return res.status(200).json(response)
    })
    .catch((err) => aux.onError('Link', res, err))
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

const validateAction = (userId, action) => {
  return (userId && action) ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing userId or action' })
}
