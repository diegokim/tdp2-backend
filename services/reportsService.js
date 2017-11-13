const ActiveUserDB = require('../database/activeUserDB');
const DenouncesDB = require('../database/denouncesDB');

const OTHER_DENOUNCE_TYPE = 'otro';
const MESS_DENOUNCE_TYPE = 'mensaje inapropiado';
const COMP_DENOUNCE_TYPE = 'comportamiento abusivo';
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

const filterDenounces = (filters) => {
  return DenouncesDB.list()
    .then((denounces) => {
      // filter by type
      const otherDenouncesByType = denounces.filter((denounce) => denounce.type === OTHER_DENOUNCE_TYPE);
      const compDenouncesByType = denounces.filter((denounce) => denounce.type === COMP_DENOUNCE_TYPE);
      const spamDenouncesByType = denounces.filter((denounce) => denounce.type === SPAM_DENOUNCE_TYPE);
      const messDenouncesByType = denounces.filter((denounce) => denounce.type === MESS_DENOUNCE_TYPE);

      // reduce by filters
      const otherDenouncesByFilters = reduceByFilters(otherDenouncesByType, filters);
      const compDenouncesByFilters = reduceByFilters(compDenouncesByType, filters);
      const spamDenouncesByFilters = reduceByFilters(spamDenouncesByType, filters);
      const messDenouncesByFilters = reduceByFilters(messDenouncesByType, filters);

      // calculate blocked users
      const otherDenouncesBlockeds = calculateBlockeds(otherDenouncesByFilters);
      const compDenouncesBlockeds = calculateBlockeds(compDenouncesByFilters);
      const spamDenouncesBlockeds = calculateBlockeds(spamDenouncesByFilters);
      const messDenouncesBlockeds = calculateBlockeds(messDenouncesByFilters);

      // calculate rejected denounces
      const otherDenouncesRejected = calculateRejecteds(otherDenouncesByFilters);
      const compDenouncesRejected = calculateRejecteds(compDenouncesByFilters);
      const spamDenouncesRejected = calculateRejecteds(spamDenouncesByFilters);
      const messDenouncesRejected = calculateRejecteds(messDenouncesByFilters);

      // reduce by user
      const otherDenounces = reduceByUser(otherDenouncesByFilters);
      const compDenounces = reduceByUser(compDenouncesByFilters);
      const spamDenounces = reduceByUser(spamDenouncesByFilters);
      const messDenounces = reduceByUser(messDenouncesByFilters);

      // calculate
      const otherLength = otherDenounces.length || 0;
      const compLength = compDenounces.length || 0;
      const spamLength = spamDenounces.length || 0;
      const messLength = messDenounces.length || 0;

      const labels = ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'];
      const blockeds = [compDenouncesBlockeds, messDenouncesBlockeds, otherDenouncesBlockeds, spamDenouncesBlockeds];
      const rejecteds = [compDenouncesRejected, messDenouncesRejected, otherDenouncesRejected, spamDenouncesRejected];
      const data = [compLength, messLength, otherLength, spamLength];
      const table = [].concat(otherDenouncesByFilters).concat(compDenouncesByFilters).concat(spamDenouncesByFilters).concat(messDenouncesByFilters);

      return {
        labels,
        data,
        blockeds,
        rejecteds,
        table
      }
    })
}

const reduceByUser = (denounces) => {
  const userMap = {};

  for (const denounce of denounces) {
    userMap[denounce.userId] = denounce
  }

  return Object.keys(userMap).map((key) => {
    return userMap[key];
  });
}

const reduceByFilters = (denounces, filters) => {
  const startDate = filters.startDate && new Date(filters.startDate);
  const endDate = filters.endDate && new Date(filters.endDate);

  const filteresDenounces = denounces.filter((denounce) => {
    const denounceDate = new Date(denounce.date);
    if (startDate && (denounceDate < startDate)) {
      return false;
    }
    if (endDate && (denounceDate > endDate)) {
      return false;
    }
    return true;
  });

  return filteresDenounces.map((denounce) => ({
    userId: denounce.recUID,
    userName: denounce.recUName,
    status: denounce.status,
    type: denounce.type
  }));
}

const filterActiveUsers = (filters) => {
  return ActiveUserDB.list()
    .then((users) => {
      // filter by filters
      const filterUsers = filterUsersByFilters(users, filters);

      // filter by last year
      // const filterUsersByLastYear = filterByLastYear(filterUsers);

      const usersMonthYearArray = generateSortedUserByMonthArray(filterUsers, filters);

      const labels = [];
      const total = [];
      const premium = [];

      usersMonthYearArray.forEach((userMonthYear) => {
        labels.push(userMonthYear.label);
        total.push(userMonthYear.total);
        premium.push(userMonthYear.premium);
      })

      return {
        labels,
        data: [
          { data: total, label: 'Usuarios Totales' },
          { data: premium, label: 'Usuarios Premium' }
        ],
        table: sortUsersByDate(filterUsers)
      }
    })
}

const filterUsersByFilters = (users, filters) => {
  // TOD0: HACIENDO ESTO, EN REALIDAD NOS ESTAMOS BASANDO EN LA HORA LOCAL, ENTONCES SI PONEMOS UNA FECHA: 2017-01-01
  // el getMonth() = 11, getFullYear() = 2016
  const startDate = filters.startDate && new Date(filters.startDate);
  const endDate = filters.endDate && new Date(filters.endDate);

  const startMonth = startDate && (startDate.getMonth() + 1);
  const startYear = startDate && startDate.getFullYear();
  const endMonth = endDate && (endDate.getMonth() + 1);
  const endYear = endDate && endDate.getFullYear();

  return users.filter((user) => {
    if (startDate) {
      if (user.year < startYear) {
        return false;
      } else if (user.year === startYear && user.month < startMonth) {
        return false
      }
    }
    if (endDate) {
      if (user.year > endYear) {
        return false;
      } else if (user.year === endYear && user.month > endMonth) {
        return false
      }
    }
    return true;
  })
}

const filterByLastYear = (users) => { // eslint-disable-line
  const lastYear = new Date();
  const lastYearYear = lastYear.getFullYear();
  lastYear.setFullYear(lastYearYear - 1);

  return filterUsersByFilters(users, { startDate: lastYear.toLocaleString(), endYear: new Date().toLocaleString()});
}

const generateSortedUserByMonthArray = (users, filters) => {
  const usersMap = {};

  // generate map
  users.forEach((user) => {
    const label = `${user.year}/${user.month}`;
    if (usersMap[label]) {
      usersMap[label].total += 1;
      usersMap[label].premium += (user.accountType === 'premium' ? 1 : 0);
    } else {
      usersMap[label] = {
        total: 1,
        premium: user.accountType === 'premium' ? 1 : 0
      }
    }
  });

  // complete empty dates with 0 total and premium
  let startDate = filters.startDate && new Date(filters.startDate);
  const endDate = (filters.endDate && new Date(filters.endDate));

  if (endDate) { // TODO: REFACTOR
    if (!startDate) {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    } else if ((startDate.getFullYear() < new Date().getFullYear() - 1) || ((startDate.getFullYear() === new Date().getFullYear() - 1) && startDate.getMonth() + 1 < new Date().getMonth())) {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }
    const startMonth = startDate.getMonth() + 1;
    const endMonth = endDate.getMonth() + 1;
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    if (startYear === endYear) {
      for (let month = startMonth; month <= endMonth; month += 1) {
        const label = `${startYear}/${month}`;

        if (!usersMap[label]) {
          usersMap[label] = { total: 0, premium: 0 }
        }
      }
    } else if (startYear < endYear) {
      for (let month = startMonth; month <= 12; month += 1) {
        const label = `${startYear}/${month}`;

        if (!usersMap[label]) {
          usersMap[label] = { total: 0, premium: 0 }
        }
      }
      for (let month = 1; month < endMonth; month += 1) {
        const label = `${endYear}/${month}`;

        if (!usersMap[label]) {
          usersMap[label] = { total: 0, premium: 0 }
        }
      }
    }
  }

  // generate array
  const userByMonthArray = [];

  Object.keys(usersMap).forEach((label) => {
    userByMonthArray.push({
      label,
      total: usersMap[label].total,
      premium: usersMap[label].premium
    });
  });

  // sort array
  const sortedUserByMonthArray = userByMonthArray.sort((a, b) => {
    const aMonth = parseInt(a.label.split('/')[1], 10);
    const bMonth = parseInt(b.label.split('/')[1], 10);
    const aYear = parseInt(a.label.split('/')[0], 10);
    const bYear = parseInt(b.label.split('/')[0], 10);

    if (aYear < bYear) {
      return -1;
    } else if ((aYear === bYear) && (aMonth < bMonth)) {
      return -1;
    }
    return 1;
  });

  return sortedUserByMonthArray;
}

const sortUsersByDate = (users) => {
  return users.sort((a, b) => {
    if (a.month < b.month) {
      return -1;
    } else if ((a.year === b.year) && (a.month < b.month)) {
      return -1;
    }
    return 1;
  });
}

const calculateBlockeds = (denounces) => {
  const acceptedDenounces = denounces.filter((denounce) => {
    return denounce.status === 'aceptada';
  });

  return acceptedDenounces.length;
}

const calculateRejecteds = (denounces) => {
  const acceptedDenounces = denounces.filter((denounce) => {
    return denounce.status === 'rechazada';
  });

  return acceptedDenounces.length;
}
