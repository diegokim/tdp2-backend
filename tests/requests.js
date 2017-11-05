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

module.exports.getUserProfile = (accessToken, userId) => Promise.resolve(
  request.get(baseUrl + `/users/${userId}/profile`)
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

module.exports.sendChatMessage = (accessToken, userId, body) => Promise.resolve(
  request.post(baseUrl + `/users/${userId}/chats/message`)
  .set({'Authorization': accessToken})
  .send(body)
  .catch((err) => err)
);

module.exports.deleteUser = (accessToken) => Promise.resolve(
  request.delete(baseUrl + '/users/me/account')
  .set({'Authorization': accessToken})
  .send()
  .catch((err) => err)
);

module.exports.getUserAdvertising = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/users/advertising')
  .set({'Authorization': accessToken})
  .send()
  .catch((err) => err)
);

module.exports.listDenounces = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/users/denounces')
  .set({'Authorization': accessToken})
  .send()
  .catch((err) => err)
);

module.exports.updateDenounce = (accessToken, body) => Promise.resolve(
  request.put(baseUrl + '/users/denounces')
  .set({'Authorization': accessToken})
  .send(body)
  .catch((err) => err)
);

module.exports.adminLogin = (body) => Promise.resolve(
  request.post(baseUrl + '/admin/login')
  .send(body)
  .catch((err) => err)
);

module.exports.getView = (accessToken, path) => Promise.resolve(
  request.get(baseUrl + `/${path}`)
  .set({'Authorization': accessToken})
  .send()
  .catch((err) => err)
);

module.exports.getReports = (accessToken, body = {}) => Promise.resolve(
  request.post(baseUrl + '/project/reports')
  .set({'Authorization': accessToken})
  .send(body)
  .catch((err) => err)
);

module.exports.getConfigs = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/project/configs')
  .set({'Authorization': accessToken})
  .send()
  .catch((err) => err)
);

module.exports.updateConfig = (accessToken, configName, body = {}) => Promise.resolve(
  request.put(baseUrl + `/project/configs/${configName}`)
  .set({'Authorization': accessToken})
  .send(body)
  .catch((err) => err)
);

module.exports.getProjectAdvertising = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/project/advertising')
  .set({'Authorization': accessToken})
  .send()
  .catch((err) => err)
);

module.exports.createProjectAdvertising = (accessToken, body = {}) => Promise.resolve(
  request.post(baseUrl + '/project/advertising')
  .set({'Authorization': accessToken})
  .send(body)
  .catch((err) => err)
);

module.exports.deleteProjectAdvertising = (accessToken, advertId) => Promise.resolve(
  request.delete(baseUrl + `/project/advertising/${advertId}`)
  .set({'Authorization': accessToken})
  .send()
  .catch((err) => err)
);

module.exports.getProjectHiddenWords = (accessToken) => Promise.resolve(
  request.get(baseUrl + '/project/hiddenlanguage')
  .set({'Authorization': accessToken})
  .send()
  .catch((err) => err)
);

module.exports.createProjectHiddenWord = (accessToken, body = {}) => Promise.resolve(
  request.post(baseUrl + '/project/hiddenlanguage')
  .set({'Authorization': accessToken})
  .send(body)
  .catch((err) => err)
);

module.exports.deleteProjectHiddenWord = (accessToken, wordId) => Promise.resolve(
  request.delete(baseUrl + `/project/hiddenlanguage/${wordId}`)
  .set({'Authorization': accessToken})
  .send()
  .catch((err) => err)
);


// TOD0: ADD FUNCTION TO PARSE RESPONSE AND REMOVE _id and __v
