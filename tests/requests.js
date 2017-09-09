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
