const ENV = process.env.ENV;
const TEST_ENV = 'env_test';
const ADMIN_TOKEN = '02ba3f90-b5a3-4576-ba69-93df1c6772ec';

module.exports.onError = (funName, res, err) => {
  if (err.stack && ENV !== TEST_ENV) {
    console.log('Error in: ' + funName + ': ' + JSON.stringify(err.stack));
  } else if (ENV !== TEST_ENV) {
    console.log('Error in: ' + funName + ': ' + JSON.stringify(err));
  }
  return res.status(err.status || 500).json({ message: err.message });
}

module.exports.onLog = (message = '', details = '') => {
  if (ENV !== TEST_ENV) {
    console.log(message, details);
  }
}

module.exports.validateToken = (accessToken) => {
  return accessToken === undefined || accessToken.length === 0 ?
    Promise.reject({ status: 400, message: 'Missing Auth token'}) :
    Promise.resolve();
}

module.exports.validateAdminToken = (accessToken) => { // eslint-disable-line
  return accessToken === undefined || accessToken !== ADMIN_TOKEN ?
    Promise.reject({ status: 401, message: 'Invalid Token'}) :
    Promise.resolve();
}

module.exports.loginAdminUser = (user) => {
  return user && user.user === 'admin' && user.password === '1234567890' ?
    Promise.resolve({ token: ADMIN_TOKEN }) :
    Promise.reject({ status: 403, message: 'Invalid Account'})
}

module.exports.parseProfileToLog = (profile) => {
  const profileToLog = Object.assign({}, profile);
  delete profileToLog.photo;
  delete profileToLog.photos;

  return profileToLog;
}
