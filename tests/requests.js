const request = require('superagent');
const baseUrl = 'http://localhost:5000'

module.exports.login = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/login')
    .set({'Authorization': accessToken})
    .send()
    .catch((err) => err)
);

module.exports.getProfile = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/profile')
    .set({'Authorization': accessToken})
    .send()
    .catch((err) => err)
);

module.exports.updateProfile = (accessToken, profile) => Promise.resolve(
  request.patch(baseUrl + '/profile')
    .set({'Authorization': accessToken})
    .send(profile)
    .catch((err) => err)
);

module.exports.getSettings = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/settings')
    .set({'Authorization': accessToken})
    .send()
    .catch((err) => err)
);

module.exports.updateSettings = (accessToken, settings) => Promise.resolve(
  request.patch(baseUrl + '/settings')
    .set({'Authorization': accessToken})
    .send(settings)
    .catch((err) => err)
);

module.exports.getCandidates = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/users/candidates')
    .set({'Authorization': accessToken})
    .send()
    .catch((err) => err)
);

module.exports.linkUser = (accessToken, userId, action) => Promise.resolve(
  request.put(baseUrl + `/users/${userId}/link`)
    .set({'Authorization': accessToken})
    .send({ action })
    .catch((err) => err)
);
