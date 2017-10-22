const mongoose = require('mongoose')
const _ = require('lodash');

//  Denounce Schema
const DenounceSchema = mongoose.Schema({
  sendUID: {
    type: String
  },
  recUID: {
    type: String
  },
  sendUName: {
    type: String
  },
  recUName: {
    type: String
  },
  message: {
    type: String
  },
  status: {
    type: String // usuario bloqueado, aceptada, pendiente, rechazada
  }
})

// eslint-disable-next-line
const Denounce = module.exports = mongoose.model('Denounce', DenounceSchema)

module.exports.create = function (denounce) {
  return denounce.save()
}

module.exports.list = function () {
  return Denounce.find({}).then(normalizeResponse)
}

module.exports.search = function (params) {
  const query = _.pick(params, ['sendUID', 'recUID', 'status']);

  return Denounce.find(query).then(normalizeResponse);
}

module.exports.updateDenounce = function (sendUID, recUID, status) {
  return Denounce.findOne({ sendUID, recUID })
    .then((existDenounce) => {
      return (existDenounce === null) ?
        Promise.reject({ status: 404, message: 'denounce not found' }) :
        existDenounce.update({ status })
    })
}

const normalizeResponse = (res) => {
  if (_.isArray(res)) {
    return res.map(normalizeResponse);
  }
  return res ? res.toObject() : res;
}
