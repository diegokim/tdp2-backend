const geolib = require('geolib');
const LinkDB = require('../database/linkDB');
const UsersDB = require('../database/usersDB');
const SettingsDB = require('../database/settingDB');
const faceAPI = require('../clients/faceAPI');
const firebaseAPI = require('../clients/firebaseAPI');
const usersService = require('./usersService');

const MAX_CANDIDATES = 5;

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
        SettingsDB.search(paramsToSearch),
        LinkDB.search({ sendUID: user.profile.id }),
        LinkDB.search({ recUID: user.profile.id, action: 'block' }),
        LinkDB.search({ recUID: user.profile.id, action: 'report' }),
        user
        // TOD0: new people
      ])
    })
    .then(([candByProf, candBySet, noCandByLink, blockedUsers, reportedUsers, user]) => {
      return filterCandidates(candByProf, candBySet, noCandByLink.concat(blockedUsers).concat(reportedUsers), user)
    })
    .then((candidates) => {
      const parsedCandidates = candidates.map((candidate) => candidate); // (_.omit(candidate._doc, ['photos']
      return parsedCandidates.splice(0, MAX_CANDIDATES);
    })
}

/**
 * Add action to user
 *
 */
module.exports.addAction = (accessToken, userIdTo, body) => {
  return faceAPI.getProfile(accessToken, ['id'])
    .then(({ id }) => {
      return Promise.all([
        UsersDB.get(id),
        UsersDB.get(userIdTo)
      ])
      .then(([u1, u2]) => (u1 && u2 ? true : Promise.reject({ status: 404, message: 'user does not exist' })))
      .then(() => {
        const newLink = new LinkDB({ sendUID: id, recUID: userIdTo, action: body.action, message: body.message });
        if (body.action === 'link') {
          return onLinkAction(id, userIdTo, newLink);
        } else if (body.action === 'super-link') {
          return LinkDB.create(newLink).then(() => onSuperLinkAction(id, userIdTo));
        } else if (body.action === 'block') {
          return LinkDB.create(newLink).then(() => onBlockAction(id, userIdTo));
        } else if (body.action === 'report') {
          return LinkDB.create(newLink).then(() => onReportAction(id, userIdTo));
        } else {
          return LinkDB.create(newLink);
        }
      })
    })
}

const onLinkAction = (id, userIdTo, newLink) => {
  return SettingsDB.get(id)
    .then((settings) => settings.interestType)
    .then((interestType) => {
      newLink.type = interestType;
      return LinkDB.create(newLink);
    })
    .then(() => LinkDB.existsLink(id, userIdTo))
    .then((existsLink) => {
      return (existsLink) ?
        Promise.resolve({ link: true }) : // coming soon --> Notification
        Promise.resolve({ link: false })
    })
}

// eslint-disable-next-line
const onSuperLinkAction = (id, userIdTo) => {
  return Promise.resolve(); // coming soon --> Notification
}

const onBlockAction = (id, userIdTo) => {
  return LinkDB.deleteLink(id, userIdTo).then(() => ({})); // coming soon --> Notification
  // or delete not BLOCK ? TOD0
}

// eslint-disable-next-line
const onReportAction = (id, userIdTo) => {
  return LinkDB.deleteLink(id, userIdTo).then(() => ({})); // coming soon --> Notification
}

/**
 * Get Links
 *
 */
module.exports.getLinks = (accessToken) => {
  return faceAPI.getProfile(accessToken, ['id'])
    .then(({ id }) => LinkDB.getLinks(id))
    .then((userLinks) => {
      const userIds = [];
      const userTypes = {};
      for (const user of userLinks) {
        userIds.push(user.sendUID);
        userTypes[user.sendUID] = user.type;
      }
      return UsersDB.getUsers(userIds)
        .then((up) => (up.map((prof) => (Object.assign({}, prof, { type: userTypes[prof.id] })))))
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
    interestType: user.settings.interestType,
    location: user.profile.location
  };
}

/**
 * Delete Link
 *
 */
module.exports.deleteLink = (accessToken, userId) => {
  return faceAPI.getProfile(accessToken, ['id'])
    .then(({ id }) => (LinkDB.deleteLink(id, userId)
    .then(() => firebaseAPI.deleteConversation(id, userId))));
}

const filterCandidates = (candByProf, candBySet, noCandByLink, user) => {
  return candByProf.filter((cand) => {
    const doMatchLinked = noCandByLink.filter(($cand) => ($cand.recUID === cand.id || $cand.sendUID === cand.id)).length > 0;

    if (doMatchLinked || cand.id === user.profile.id) {
      return false;
    }
    return candBySet.filter(($cand) => ($cand.id === cand.id)).length > 0
  })
  .map((cand) => (Object.assign({}, cand, { distance: calculateDistance(user.profile.location, cand.location) })))
}

const calculateDistance = (location1, location2) => {
  const distance = geolib.getDistance(
    {latitude: location1[1], longitude: location1[0] },
    {latitude: location2[1], longitude: location2[0] }
  )

  return Math.round(distance / 1000);
}
