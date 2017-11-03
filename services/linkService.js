const geolib = require('geolib');
const LinkDB = require('../database/linkDB');
const UsersDB = require('../database/usersDB');
const SettingsDB = require('../database/settingDB');
const DenouncesDB = require('../database/denouncesDB');
const ProjectSettingsDB = require('../database/projectSettingsDB');
const firebaseAPI = require('../clients/firebaseAPI');
const usersService = require('./usersService');

const MAX_CANDIDATES_KEY = 'maxCandidatesToShow';

const INITIAL_DENOUNCE_STATUS = 'pendiente';
const LINK_ACTION = 'link';
const BLOCK_ACTION = 'block';
const REPORT_ACTION = 'report';
const SUPER_LINK_ACTION = 'super-link';

/**
 * Get Candidates.
 *
 */
module.exports.getCandidates = (accessToken, userId) => {
  return usersService.getUserId(accessToken, userId)
    .then((id) => usersService.get(accessToken, id))
    .then((user) => {
      const paramsToSearch = filterParamsToSearch(user);

      return Promise.all([
        UsersDB.search(paramsToSearch),
        SettingsDB.search(paramsToSearch),
        LinkDB.search({ sendUID: user.profile.id }),
        LinkDB.search({ recUID: user.profile.id, action: BLOCK_ACTION }),
        LinkDB.search({ recUID: user.profile.id, action: REPORT_ACTION }),
        user
      ])
    })
    .then(([candByProf, candBySet, noCandByLink, blockedUsers, reportedUsers, user]) => {
      const filter = filterCandidates(candByProf, candBySet, noCandByLink.concat(blockedUsers).concat(reportedUsers), user)
      const sorted = sortCandidates(user, filter);

      return sorted;
    })
    .then((candidates) => Promise.all([candidates, ProjectSettingsDB.get(MAX_CANDIDATES_KEY)]))
    .then(([candidates, maxCandidatesToShow]) => {
      const parsedCandidates = candidates.map((candidate) => candidate);
      return parsedCandidates.splice(0, maxCandidatesToShow);
    })
}

/**
 * Get Links
 *
 */
module.exports.getLinks = (accessToken, userId) => {
  return usersService.getUserId(accessToken, userId)
    .then((id) => LinkDB.getLinks(id))
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

/**
 * Delete Link
 *
 */
module.exports.deleteLink = (accessToken, userIdTo, userId) => {
  return usersService.getUserId(accessToken, userId)
    .then((id) => (LinkDB.deleteLink(id, userIdTo)
    .then(() => firebaseAPI.deleteConversation(id, userIdTo))));
}

/**
 * Add action to user
 *
 */
module.exports.addAction = (accessToken, userIdTo, body, userId) => {
  return usersService.getUserId(accessToken, userId)
    .then((id) => {
      return Promise.all([
        UsersDB.get(id),
        UsersDB.get(userIdTo)
      ])
      .then(([u1, u2]) => (u1 && u2 ? [u1, u2] : Promise.reject({ status: 404, message: 'user does not exist' })))
      .then(([u1, u2]) => {
        const newLink = new LinkDB({ sendUID: id, recUID: userIdTo, action: body.action });
        if (body.action === LINK_ACTION) {
          return onLinkAction(u1, u2, newLink);
        } else if (body.action === SUPER_LINK_ACTION) {
          return onSuperLinkAction(u1, u2, newLink);
        } else if (body.action === BLOCK_ACTION) {
          return LinkDB.create(newLink).then(() => onBlockAction(id, userIdTo));
        } else if (body.action === REPORT_ACTION) {
          return LinkDB.create(newLink).then(() => onReportAction(u1, u2, body.message, body.type));
        } else {
          return LinkDB.create(newLink);
        }
      })
    })
}

const onLinkAction = (user, userTo, newLink) => {
  return SettingsDB.get(user.id)
    .then((settings) => settings.interestType)
    .then((interestType) => {
      newLink.type = interestType;
      return LinkDB.create(newLink);
    })
    .then(() => LinkDB.existsLink(user.id, userTo.id))
    .then((existsLink) => {
      return (existsLink) ?
        sendLinkNotification(user, userTo).then(() => Promise.resolve({ link: true })) :
        Promise.resolve({ link: false })
    })
}

const sendLinkNotification = (user, userTo) => {
  return SettingsDB.get(user.id)
    .then((sett1) => {
      if (sett1.notifications) {
        return firebaseAPI.sendNotification(sett1.registrationToken, { title: 'Se produjo un link', body: userTo.name });
      }
      return Promise.resolve();
    })
    .then(() => SettingsDB.get(userTo.id))
    .then((sett2) => {
      if (sett2.notifications) {
        return firebaseAPI.sendNotification(sett2.registrationToken, { title: 'Se produjo un link', body: user.name });
      }
      return Promise.resolve();
    })
}

const onSuperLinkAction = (user, userTo, newSuperLink) => {
  const newLink = new LinkDB({ sendUID: user.id, recUID: userTo.id, action: LINK_ACTION });

  return SettingsDB.get(user.id)
    .then((settings) => {
      const superLinksCount = settings.superLinksCount;
      const settingsToUpdate = { id: user.id, superLinksCount: superLinksCount - 1 };

      return (superLinksCount > 0) ?
        SettingsDB.updateSetting(settingsToUpdate) :
        Promise.reject({ status: 409, message: 'you have not more super links for today' })
    })
    .then(() => LinkDB.create(newSuperLink))
    .then(() => onLinkAction(user, userTo, newLink))
}

const onBlockAction = (id, userIdTo) => {
  return LinkDB.deleteLink(id, userIdTo).then(() => ({}));
  // or delete not BLOCK ? TOD0
}

const onReportAction = (user, userTo, message = 'No message', type = 'other') => {
  const params = {
    type,
    message,
    recUID: userTo.id,
    sendUID: user.id,
    recUName: userTo.name,
    sendUName: user.name,
    status: INITIAL_DENOUNCE_STATUS
  }
  const newDenounce = new DenouncesDB(params);

  return LinkDB.deleteLink(user.id, userTo.id)
    .then(() => DenouncesDB.create(newDenounce))
    .then(() => ({}));
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

const sortCandidates = (user, candidates) => {
  return Promise.all([
    SettingsDB.get(user.id),
    LinkDB.search({ recUID: user.profile.id, action: SUPER_LINK_ACTION })
  ])
  .then(([settings, superLinks]) => { // eslint-disable-line
    const superLinkMap = {};
    superLinks.forEach((sl) => (superLinkMap[sl.sendUID] = sl));

    candidates.sort((a, b) => {
      const isAInSuperLinks = !!superLinkMap[a.id];
      const isBInSuperLinks = !!superLinkMap[b.id];
      const aFirst = ((isAInSuperLinks && !isBInSuperLinks) || (!isAInSuperLinks && !isBInSuperLinks));

      return aFirst ? -1 : 1;
    })

    return candidates;
  })
}

const calculateDistance = (location1, location2) => {
  const distance = geolib.getDistance(
    {latitude: location1[1], longitude: location1[0] },
    {latitude: location2[1], longitude: location2[0] }
  )

  return Math.round(distance / 1000);
}
