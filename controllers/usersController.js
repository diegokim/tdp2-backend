const usersService = require('../services/usersService');
const linkService = require('../services/linkService');
const aux = require('../utils/auxiliar.functions.js')

module.exports.get = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return aux.validateToken(accessToken)
    .then(() => usersService.getProfile(accessToken))
    .then((profile) => {
      aux.onLog('Response:', aux.parseProfileToLog(profile));
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
      aux.onLog('Response:', aux.parseProfileToLog(profile));
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

module.exports.addAction = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;
  const userId = req.params.userId;
  const body = req.body;

  return aux.validateToken(accessToken)
    .then(() => validateAction(body.action))
    .then(() => validateUserId(userId))
    .then(() => linkService.addAction(accessToken, userId, body))
    .then((response) => {
      aux.onLog('Response:', response);
      return res.status(200).json(response)
    })
    .catch((err) => aux.onError('Link', res, err))
}

module.exports.getLinks = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return aux.validateToken(accessToken)
    .then(() => linkService.getLinks(accessToken))
    .then((profileLinks) => {
      aux.onLog('Response:', profileLinks.length);
      return res.status(200).json({ profiles: profileLinks })
    })
    .catch((err) => aux.onError('Link', res, err))
}

module.exports.deleteLink = (req, res) => {
  const accessToken = req.headers.authorization;
  const userId = req.params.userId;
  aux.onLog('Request: Delete link', userId);

  return aux.validateToken(accessToken)
    .then(() => validateUserId(userId))
    .then(() => linkService.deleteLink(accessToken, userId))
    .then(() => {
      aux.onLog('Response: deleted', userId);
      return res.status(204).json({})
    })
    .catch((err) => aux.onError('Delete link', res, err))
}

const validateProfile = (profile) => {
  const validProfile =
    profile.photo ||
    profile.photos ||
    profile.description ||
    profile.location;

  return validProfile ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing valid profile' })
}

const validateAction = (action) => {
  return (action) ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing action' })
}

const validateUserId = (userId) => {
  return (userId) ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing userId' })
}
