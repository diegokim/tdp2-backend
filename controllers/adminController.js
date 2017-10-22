const aux = require('../utils/auxiliar.functions.js');
const auth = require('../utils/auth.functions.js');
const path = require('path');

module.exports.start = (req, res) => {
  let file = req.url;
  if (file === '/') { // main
    file = '/index.html';
  }

  return res.sendFile(path.join(__dirname, '../admin-views', file));

  // Token Authorization

  // const accessToken = req.headers.authorization;
  // return aux.validateAdminToken(accessToken)
  //   .then(() => res.sendFile(path.join(__dirname, '../admin-views', file)))
  //   .catch((err) => aux.onError('Admin View', res, err))
}

module.exports.login = (req, res) => {
  aux.onLog('Request:', req.url)
  const user = req.body;

  return auth.loginAdminUser(user)
    .then((token) => {
      aux.onLog('Response: ', token);
      return res.status(201).json(token)
    })
    .catch((err) => aux.onError('Admin Login', res, err))
}
