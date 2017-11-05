const _ = require('lodash');
const mongoose = require('mongoose')

//  Project Advertising Schema
const ProjectAdvertisingSchema = mongoose.Schema({
  id: {
    type: String
  },
  image: {
    type: String
  }
})

// eslint-disable-next-line
const ProjectAdvertising = module.exports = mongoose.model('ProjectAdvertising', ProjectAdvertisingSchema)

module.exports.create = function (setting) {
  return setting.save()
}

module.exports.list = function () {
  return ProjectAdvertising.find({}).then(normalizeResponse);
}

module.exports.removeAdvert = function (id) {
  const query = { id };

  return ProjectAdvertising.remove(query);
}

const normalizeResponse = (res) => {
  if (_.isArray(res)) {
    return res.map(normalizeResponse);
  }
  return res ? res.toObject() : res;
}
