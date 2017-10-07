const chatService = require('../services/chatService');
const aux = require('../utils/auxiliar.functions.js')

module.exports.sendMessage = (req, res) => {
  aux.onLog('Request:', req.url)
  const accessToken = req.headers.authorization;
  const userId = req.params.userId;
  const messageBody = req.body;

  return aux.validateToken(accessToken)
    .then(() => validateMessage(messageBody.message))
    .then(() => validateUserId(userId))
    .then(() => chatService.sendMessage(accessToken, userId, messageBody))
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
