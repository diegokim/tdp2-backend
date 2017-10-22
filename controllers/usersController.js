const usersService = require('../services/usersService');
const linkService = require('../services/linkService');
const aux = require('../utils/auxiliar.functions.js')
const auth = require('../utils/auth.functions.js');

module.exports.get = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return auth.validateToken(accessToken)
    .then((userId) => usersService.getProfile(accessToken, userId))
    .then((profile) => {
      aux.onLog('Response:', aux.parseProfileToLog(profile));
      return res.status(200).json(profile)
    })
    .catch((err) => aux.onError('Get Profile', res, err))
}

module.exports.getUserProfile = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;
  const userId = req.params.userId;

  return auth.validateAdminToken(accessToken)
    .then(() => validateUserId(userId))
    .then(() => usersService.getProfile(accessToken, userId))
    .then((profile) => {
      aux.onLog('Response:', aux.parseProfileToLog(profile));
      return res.status(200).json(profile)
    })
    .catch((err) => aux.onError('Get user profile', res, err))
}

module.exports.update = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return validateProfile(req.body)
    .then(() => auth.validateToken(accessToken))
    .then((userId) => usersService.updateProfile(accessToken, req.body, userId))
    .then((profile) => {
      aux.onLog('Response:', aux.parseProfileToLog(profile));
      return res.status(200).json(profile)
    })
    .catch((err) => aux.onError('Update Profile', res, err))
}

module.exports.getCandidates = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return auth.validateToken(accessToken)
    .then((userId) => linkService.getCandidates(accessToken, userId))
    .then((profiles) => {
      aux.onLog('Response:', profiles.length);
      return res.status(200).json({ profiles })
    })
    .catch((err) => aux.onError('Get Candidates', res, err))
}

module.exports.addAction = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;
  const userToId = req.params.userId;
  const body = req.body;

  return validateUserId(userToId)
    .then(() => validateAction(body.action))
    .then(() => auth.validateToken(accessToken))
    .then((userId) => linkService.addAction(accessToken, userToId, body, userId))
    .then((response) => {
      aux.onLog('Response:', response);
      return res.status(200).json(response)
    })
    .catch((err) => aux.onError('Link', res, err))
}

module.exports.getLinks = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;

  return auth.validateToken(accessToken)
    .then((userId) => linkService.getLinks(accessToken, userId))
    .then((profileLinks) => {
      aux.onLog('Response:', profileLinks.length);
      return res.status(200).json({ profiles: profileLinks })
    })
    .catch((err) => aux.onError('Link', res, err))
}

module.exports.deleteLink = (req, res) => {
  const accessToken = req.headers.authorization;
  const userIdTo = req.params.userId;
  aux.onLog('Request: Delete link', userIdTo);

  return validateUserId(userIdTo)
    .then(() => auth.validateToken(accessToken))
    .then((userId) => linkService.deleteLink(accessToken, userIdTo, userId))
    .then(() => {
      aux.onLog('Response: deleted', userIdTo);
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
