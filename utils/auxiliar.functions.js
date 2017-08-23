module.exports.onError = (funName, res, err) => {
  if (err.message.stack) {
    console.log('Error in: ' + funName + ': ' + err.message.stack);
  } else {
    console.log('Error in: ' + funName + ': ' + err.message);
  }
  return res.status(err.status).json(err.message);
}
