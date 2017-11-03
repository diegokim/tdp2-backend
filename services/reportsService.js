const UsersDB = require('../database/usersDB');
const DenouncesDB = require('../database/denouncesDB');

const OTHER_DENOUNCE_TYPE = 'otro';
const COMP_DENOUNCE_TYPE = 'comportamiento extraño';
const SPAM_DENOUNCE_TYPE = 'spam';

/**
 * Filter reports User
 *
 */
module.exports.filter = (filters) => {
  return Promise.all([filterActiveUsers(filters), filterDenounces(filters)])
    .then(([activeUsersReport, denouncesReport]) => {
      return {
        activeUsers: activeUsersReport,
        denounces: denouncesReport
      }
    })
}

const filterDenounces = (filters) => { // eslint-disable-line
  return DenouncesDB.list()
    .then((denounces) => {

      // filter by type
      const otherDenouncesFilter = denounces.filter((denounce) => denounce.type === OTHER_DENOUNCE_TYPE);
      const compDenouncesFilter = denounces.filter((denounce) => denounce.type === COMP_DENOUNCE_TYPE);
      const spamDenouncesFilter = denounces.filter((denounce) => denounce.type === SPAM_DENOUNCE_TYPE);

      // reduce by user
      const otherDenounces = reduceByUser(otherDenouncesFilter);
      const compDenounces = reduceByUser(compDenouncesFilter);
      const spamDenounces = reduceByUser(spamDenouncesFilter);

      // reduce by filters

      // calculate
      const otherLength = otherDenounces.length || 0;
      const compLength = compDenounces.length || 0;
      const spamLength = spamDenounces.length || 0;
      const totalLength = compLength + otherLength + spamLength;

      return {
        otro: {
          count: otherLength,
          percentage: (otherLength / totalLength) * 100
        },
        spam: {
          count: spamLength,
          percentage: (spamLength / totalLength) * 100
        },
        comp: {
          count: compLength,
          percentage: (compLength / totalLength) * 100
        }
      }
    })
}

const reduceByUser = (denounces) => {
  const userMap = {};

  for (const denounce of denounces) {
    userMap[denounce.recUID] = {
      userId: denounce.recUID,
      userName: denounce.recUName,
      type: denounce.type
    }
  }

  return Object.keys(userMap).map((key) => {
    return userMap[key];
  });
}

const filterActiveUsers = (filters) => { // eslint-disable-line
  return UsersDB.list()
    .then((users) => { // eslint-disable-line
      // filter by filters

      // construct graphic points
      return {
        sampling: [{
          x: 0,
          y: 10
        }, {
          x: 1,
          y: 20
        }, {
          x: 2,
          y: 30
        }]
      }
    })
}
