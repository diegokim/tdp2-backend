const UsersDB = require('../database/usersDB');
const HiddenLanguageDB = require('../database/projectHiddenLanguageDB');
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
    .then(() => filterLanguage(chatMessage))
    .then((filteredMessage) => firebaseAPI.sendMessage(id, userIdTo, { message: filteredMessage }))
  });
}

const filterLanguage = ({ message }) => {
  return HiddenLanguageDB.list()
    .then((hiddenLanguage) => hiddenLanguage.map((word) => word.word))
    .then((hiddenWords) => {
      const filterMessaje = hiddenWords.reduce((accumulator, currentValue) => {
        return accumulator.replace(new RegExp(currentValue, 'g'), '***');
      }, message);

      return filterMessaje;
    })
}

