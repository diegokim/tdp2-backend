const _ = require('lodash');
const LinkDB = require('../database/linkDB');
const UsersDB = require('../database/usersDB');
const SettingsDB = require('../database/settingDB');
const faceAPI = require('../clients/faceAPI');
const usersService = require('./usersService');

/**
 * Get Candidates.
 *
 */
module.exports.getCandidates = (accessToken, userId) => {
  return Promise.resolve(userId ? { id: userId } : faceAPI.getProfile(accessToken, ['id']))
    .then((fbProfile) => usersService.get(accessToken, fbProfile.id))
    .then((user) => {
      const paramsToSearch = filterParamsToSearch(user);

      return Promise.all([
        UsersDB.search(paramsToSearch),
        SettingsDB.search(paramsToSearch)
        // TOD0: search people linked
        // TOD0: new people
      ])
    })
    .then(([candByProf, candBySet]) => {
      return candByProf.filter((cand) => (candBySet.filter(($cand) => ($cand.id === cand.id)).length > 0))
    })
    .then((candidates) => {
      const parsedCandidates = candidates.map((candidate) => (_.omit(candidate._doc, ['photos'])));
      return parsedCandidates;
    })
}

/**
 * Link User action
 *
 */
module.exports.link = (accessToken, userId, action) => {
  return faceAPI.getProfile(accessToken, ['id'])
    .then(({ id }) => {
      return Promise.all([
        UsersDB.get(id),
        UsersDB.get(userId)
      ])
      .then(([u1, u2]) => (u1 && u2 ? true : Promise.reject({ status: 404, message: 'user does not exist' })))
      .then(() => {
        const newLink = new LinkDB({ sendUID: id, recUID: userId, action });
        return LinkDB.create(newLink);
      })
      .then(() => LinkDB.existsLink(id, userId))
      .then((existsLink) => {
        return (existsLink) ?
          Promise.resolve({ link: true }) : // coming soon --> Notification
          Promise.resolve({ link: false })
      })
    })
}


const filterParamsToSearch = (user) => {
  return {
    id: user.profile.id,
    age: user.profile.age,
    gender: user.profile.gender,
    interests: user.profile.interests,
    ageRange: user.settings.ageRange,
    distRange: user.settings.distRange,
    invisible: user.settings.invisible,
    interestType: user.settings.interestType
    // location: user.profile.location // TOD0
  };
}
