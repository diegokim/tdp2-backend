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
      const paramsToSearch = {
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

      return Promise.all([
        UsersDB.search(paramsToSearch),
        SettingsDB.search(paramsToSearch)
      ])
    })
    .then(([candByProf, candBySet]) => {
      return candByProf.filter((cand) => (candBySet.filter(($cand) => ($cand.id === cand.id)).length > 0))
    })
    .then((candidates) => {
      candidates.map((candidate) => (delete candidate.photos));
      return candidates;
    })
}
