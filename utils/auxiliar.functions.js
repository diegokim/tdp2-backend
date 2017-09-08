module.exports.onError = (funName, res, err) => {
  if (err.stack) {
    console.log('Error in: ' + funName + ': ' + err.stack);
  } else {
    console.log('Error in: ' + funName + ': ' + err);
  }
  return res.status(err.status || 500).json(err.message);
}
