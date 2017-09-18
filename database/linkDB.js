const mongoose = require('mongoose')

//  Link Schema
const LinkSchema = mongoose.Schema({
  sendUID: {
    type: String
  },
  recUID: {
    type: String
  },
  action: {
    type: String // link, super-link, reject
  }
})

// eslint-disable-next-line
const Link = module.exports = mongoose.model('Link', LinkSchema)

module.exports.create = function (link) {
  const query = { sendUID: link.sendUID, recUID: link.recUID };

  return Link.findOne(query)
    .then((resp) => {
      const promise = link.save();
      if (resp) {
        promise.then(() => Link.remove({ _id: resp.__id }))
      }
      return promise;
    })
}

module.exports.existsLink = function (userId1, userId2) {
  const query = { $or: [
    { sendUID: userId1, recUID: userId2, action: 'link' },
    { sendUID: userId2, recUID: userId1, action: 'link' }
  ]}

  return Link.find(query)
    .then((res) => (res.length === 2))
}

module.exports.getLinks = function (userId) {
  const sendQuery = { sendUID: userId, action: 'link' };

  return Link.find(sendQuery)
    .then((links) => {
      const recQuery = links.map((link) => ({ sendUID: link.recUID, recUID: userId, action: 'link' }))

      return recQuery.length ? Link.find({ $or: recQuery }) : [];
    })
}
