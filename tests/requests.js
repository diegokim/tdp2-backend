const request = require('superagent');
const baseUrl = 'http://localhost:5000'

module.exports.login = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/login')
    .set({'Authorization': accessToken})
    .send()
    .catch((err) => err)
);

module.exports.getProfile = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/users/me/profile')
    .set({'Authorization': accessToken})
    .send()
    .catch((err) => err)
);

module.exports.updateProfile = (accessToken, profile) => Promise.resolve(
  request.patch(baseUrl + '/users/me/profile')
    .set({'Authorization': accessToken})
    .send(profile)
    .catch((err) => err)
);

module.exports.getSettings = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/users/me/settings')
    .set({'Authorization': accessToken})
    .send()
    .catch((err) => err)
);

module.exports.updateSettings = (accessToken, settings) => Promise.resolve(
  request.patch(baseUrl + '/users/me/settings')
    .set({'Authorization': accessToken})
    .send(settings)
    .catch((err) => err)
);

module.exports.getCandidates = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/users/me/candidates')
    .set({'Authorization': accessToken})
    .send()
    .catch((err) => err)
);

module.exports.actionUser = (accessToken, userId, body) => Promise.resolve(
  request.put(baseUrl + `/users/${userId}/actions`)
    .set({'Authorization': accessToken})
    .send(body)
    .catch((err) => err)
);

module.exports.getLinks = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/users/me/links')
    .set({'Authorization': accessToken})
    .send()
    .catch((err) => err)
);

module.exports.deleteLink = (accessToken, userId) => Promise.resolve(
  request.delete(baseUrl + `/users/${userId}`)
  .set({'Authorization': accessToken})
  .send()
  .catch((err) => err)
);
