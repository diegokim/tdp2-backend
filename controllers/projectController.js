const projectService = require('../services/projectService');
const reportsService = require('../services/reportsService');

const aux = require('../utils/auxiliar.functions.js')
const auth = require('../utils/auth.functions.js');

// configs
module.exports.updateConfig = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;
  const configName = req.params.configName
  const body = req.body;

  return auth.validateAdminToken(accessToken)
    .then(() => validateConfigId(configName))
    .then(() => validateConf(body))
    .then(() => projectService.updateConfig(configName, body.value))
    .then(() => res.status(204).json())
    .catch((err) => aux.onError('Update project config', res, err))
}

module.exports.getConfigs = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;

  return auth.validateAdminToken(accessToken)
    .then(() => projectService.getConfigs())
    .then((configs) => {
      aux.onLog('Response:', configs);
      return res.status(200).json(configs)
    })
    .catch((err) => aux.onError('Get project config', res, err))
}

// advertising
module.exports.getAdvertising = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;

  return auth.validateAdminToken(accessToken)
    .then(() => projectService.getAdvertising())
    .then((advers) => {
      aux.onLog('Response:', advers.length);
      return res.status(200).json(advers)
    })
    .catch((err) => aux.onError('Get project advertising', res, err))
}

module.exports.createAdvertising = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;
  const body = req.body;

  return auth.validateAdminToken(accessToken)
    .then(() => validateAdvert(body))
    .then(() => projectService.createAdvertising(body))
    .then((advert) => {
      aux.onLog('Response: advertising created');
      return res.status(200).json(advert)
    })
    .catch((err) => aux.onError('Create project advertising', res, err))
}

module.exports.deleteAdvertising = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;
  const advertId = req.params.advertId

  return auth.validateAdminToken(accessToken)
    .then(() => validateAdvertId(advertId))
    .then(() => projectService.deleteAdvertising(advertId))
    .then(() => res.status(204).json())
    .catch((err) => aux.onError('Delete project advertising', res, err))
}

// hidden language
module.exports.getHiddenWords = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;

  return auth.validateAdminToken(accessToken)
    .then(() => projectService.getHiddenWords())
    .then((words) => {
      aux.onLog('Response:', words);
      return res.status(200).json(words)
    })
    .catch((err) => aux.onError('Get project hidden words', res, err))
}

module.exports.createHiddenWord = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;
  const body = req.body;

  return auth.validateAdminToken(accessToken)
    .then(() => validateHiddenWord(body))
    .then(() => projectService.createHiddenWord(body.word))
    .then((advert) => {
      aux.onLog('Response: advertising created');
      return res.status(200).json(advert)
    })
    .catch((err) => aux.onError('Create project hidden word', res, err))
}

module.exports.editHiddenWord = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;
  const wordId = req.params.wordId
  const body = req.body;

  return auth.validateAdminToken(accessToken)
    .then(() => validateWordId(wordId))
    .then(() => projectService.editHiddenWord(wordId, body.word))
    .then(() => res.status(204).json())
    .catch((err) => aux.onError('Edit project hidden word', res, err))
}

module.exports.deleteHiddenWord = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;
  const wordId = req.params.wordId

  return auth.validateAdminToken(accessToken)
    .then(() => validateWordId(wordId))
    .then(() => projectService.deleteHiddenWord(wordId))
    .then(() => res.status(204).json())
    .catch((err) => aux.onError('Delete project hidden word', res, err))
}

// reports
module.exports.getReports = (req, res) => {
  aux.onLog('Request:', `${req.method} ${req.url}`)
  const accessToken = req.headers.authorization;
  const filters = req.body;

  return auth.validateAdminToken(accessToken)
    .then(() => reportsService.filter(filters))
    .then((report) => {
      aux.onLog('Response:', report);
      return res.status(200).json(report)
    })
    .catch((err) => aux.onError('Get user reports', res, err))
}

const validateConf = (conf) => {
  const validConf = conf.value;

  return validConf ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing value' })
}

const validateConfigId = (configId) => {
  return configId ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing configId' })
}

const validateAdvert = (advert) => {
  const validAdvert = advert.image || advert.link;

  return validAdvert ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing image' })
}

const validateAdvertId = (advertId) => {
  return advertId ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing advertId' })
}

const validateHiddenWord = (word) => {
  const validWord = word.word;

  return validWord ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing word' })
}

const validateWordId = (wordId) => {
  return wordId ?
    Promise.resolve() :
    Promise.reject({ status: 400, message: 'missing wordId' })
}
