const request = require('superagent');
const baseUrl = 'http://localhost:5000'

module.exports.login = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/login')
    .set({'Authorization': accessToken})
    .send()
    .catch((err) => err)
);
