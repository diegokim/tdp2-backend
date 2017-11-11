const _ = require('lodash');
const mongoose = require('mongoose')

//  Project Hidden Language Schema
const ProjectHiddenLanguageSchema = mongoose.Schema({
  id: {
    type: String
  },
  word: {
    type: String
  }
})

// eslint-disable-next-line
const ProjectHiddenLanguage = module.exports = mongoose.model('ProjectHiddenLanguage', ProjectHiddenLanguageSchema)

module.exports.create = function (setting) {
  return setting.save()
}

module.exports.list = function () {
  return ProjectHiddenLanguage.find({}).then(normalizeResponse);
}

module.exports.editWord = function (id, word) {
  const query = { id };

  return ProjectHiddenLanguage.findOne(query)
    .then((existWord) => {
      return (existWord === null) ?
        Promise.reject({ status: 404, message: 'word not found' }) :
        existWord.update({ word })
    })
}

module.exports.removeWord = function (id) {
  const query = { id };

  return ProjectHiddenLanguage.remove(query);
}

const normalizeResponse = (res) => {
  if (_.isArray(res)) {
    return res.map(normalizeResponse);
  }
  return res ? res.toObject() : res;
}
