module.exports.onError = (funName, res, err) => {
  if (err.stack) {
    console.log('Error in: ' + funName + ': ' + JSON.stringify(err.stack));
  } else {
    console.log('Error in: ' + funName + ': ' + JSON.stringify(err));
  }
  return res.status(err.status || 500).json(err.message);
}
