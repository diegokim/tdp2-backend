const UsersDB = require('../database/usersDB');
const faceAPI = require('../clients/faceAPI');
const firebaseAPI = require('../clients/firebaseAPI');

/**
 * Send chat message
 *
 */
module.exports.sendMessage = (accessToken, userIdTo, chatMessage) => {
  return faceAPI.getProfile(accessToken, ['id'])
  .then(({ id }) => {
    return Promise.all([
      UsersDB.get(id),
      UsersDB.get(userIdTo)
    ])
    .then(([u1, u2]) => (u1 && u2 ? true : Promise.reject({ status: 404, message: 'user does not exist' })))
    .then(() => firebaseAPI.sendMessage(id, userIdTo, chatMessage))
  });
}
