const path = require('path');

module.exports.start = (req, res) => {
  let file = req.url;
  if (file === '/') {
    file = '/index.html';
  }

  res.sendFile(path.join(__dirname, './views', file));
}
