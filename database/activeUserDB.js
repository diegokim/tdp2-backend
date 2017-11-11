const mongoose = require('mongoose')
const _ = require('lodash');

//  Active Users Schema
const ActiveUserSchema = mongoose.Schema({
  id: {
    type: String
  },
  name: {
    type: String
  },
  month: {
    type: Number
  },
  year: {
    type: Number
  },
  accountType: {
    type: String,
    default: 'free'
  }
})

// eslint-disable-next-line
const ActiveUser = module.exports = mongoose.model('ActiveUser', ActiveUserSchema)

module.exports.create = function (activeUser) {
  return activeUser.save()
}

module.exports.list = function () {
  return ActiveUser.find({}).then(normalizeResponse)
}

module.exports.search = function (params) {
  const query = _.pick(params, ['id', 'year', 'month']);

  return ActiveUser.find(query).then(normalizeResponse);
}

module.exports.updateActiveUser = function (id, year, month) {
  return ActiveUser.findOne({ id })
    .then((existActiveUser) => {
      return (existActiveUser === null) ?
        Promise.reject({ status: 404, message: 'active user not found' }) :
        existActiveUser.update({ year, month })
    })
}

const normalizeResponse = (res) => {
  if (_.isArray(res)) {
    return res.map(normalizeResponse);
  }
  return res ? res.toObject() : res;
}
