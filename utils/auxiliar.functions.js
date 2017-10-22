const ENV = process.env.ENV;
const TEST_ENV = 'env_test';

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

module.exports.parseProfileToLog = (profile) => {
  const profileToLog = Object.assign({}, profile);
  delete profileToLog.photo;
  delete profileToLog.photos;

  return profileToLog;
}
