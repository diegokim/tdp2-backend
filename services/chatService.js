const UsersDB = require('../database/usersDB');
const usersService = require('./usersService');
const firebaseAPI = require('../clients/firebaseAPI');

/**
 * Send chat message
 *
 */
module.exports.sendMessage = (accessToken, userId, userIdTo, chatMessage) => {
  return usersService.getUserId(accessToken, userId)
  .then((id) => {
    return Promise.all([
      UsersDB.get(id),
      UsersDB.get(userIdTo)
    ])
    .then(([u1, u2]) => (u1 && u2 ? true : Promise.reject({ status: 404, message: 'user does not exist' })))
    .then(() => firebaseAPI.sendMessage(id, userIdTo, chatMessage))
  });
}
