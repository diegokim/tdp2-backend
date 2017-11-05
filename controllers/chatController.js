const chatService = require('../services/chatService');
const aux = require('../utils/auxiliar.functions.js')
const auth = require('../utils/auth.functions.js');

module.exports.sendMessage = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;
  const userToId = req.params.userId;
  const messageBody = req.body;

  return validateMessage(messageBody.message)
    .then(() => validateUserId(userToId))
    .then(() => auth.validateToken(accessToken))
    .then((userId) => chatService.sendMessage(accessToken, userId, userToId, messageBody))
    .then(() => {
      aux.onLog('Response: message sended', messageBody);
      return res.status(201).json({})
    })
    .catch((err) => aux.onError('Chat Message', res, err))
}

const validateMessage = (message) => {
  return (message) ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing message' })
}

const validateUserId = (userId) => {
  return (userId) ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing userId' })
}
