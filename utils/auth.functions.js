const _ = require('lodash');
const faceAPI = require('../clients/faceAPI');
const usersService = require('../services/usersService');

const ADMIN_TOKEN = '02ba3f90-b5a3-4576-ba69-93df1c6772ec';

module.exports.validateToken = (accessToken) => {
  return accessToken === undefined || accessToken.length === 0 ?
    Promise.reject({ status: 400, message: 'Missing Auth token'}) :
    validateProfile(accessToken);
}

module.exports.validateAdminToken = (accessToken) => {
  return accessToken === undefined || accessToken !== ADMIN_TOKEN ?
    Promise.reject({ status: 401, message: 'Invalid Token'}) :
    Promise.resolve();
}

module.exports.loginAdminUser = (user) => {
  return user && user.user === 'admin' && user.password === '1234567890' ?
    Promise.resolve({ token: ADMIN_TOKEN }) :
    Promise.reject({ status: 403, message: 'Invalid Account'})
}

const validateProfile = (accessToken) => {
  return faceAPI.getProfile(accessToken, ['id'])
    .then(({ id }) => usersService.getProfile('any-access-token', id).catch(_.noop))
    .then((profile) => {
      if (!profile) {
        return Promise.reject({ status: 404, message: 'user does not exist' });
      } else if (profile.status !== 'blocked') {
        return Promise.resolve(profile.id); // TOD0: should be inside a context
      }
      return Promise.reject({ status: 403, message: 'Blocked user'})
    })
}
