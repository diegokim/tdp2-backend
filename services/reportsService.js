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

      // reduce by user and month: se consideran por usuario y por cada fecha
      const otherDenounces = reduceByUserAndMonth(otherDenouncesByFilters);
      const compDenounces = reduceByUserAndMonth(compDenouncesByFilters);
      const spamDenounces = reduceByUserAndMonth(spamDenouncesByFilters);
      const messDenounces = reduceByUserAndMonth(messDenouncesByFilters);

      // calculate blocked users
      const otherDenouncesAccepted = calculateBlockeds(otherDenounces);
      const compDenouncesAccepted = calculateBlockeds(compDenounces);
      const spamDenouncesAccepted = calculateBlockeds(spamDenounces);
      const messDenouncesAccepted = calculateBlockeds(messDenounces);

      // calculate rejected denounces
      const otherDenouncesRejected = calculateRejecteds(otherDenounces);
      const compDenouncesRejected = calculateRejecteds(compDenounces);
      const spamDenouncesRejected = calculateRejecteds(spamDenounces);
      const messDenouncesRejected = calculateRejecteds(messDenounces);

      // calculate denounces table
      const sortedDenouncesByMonth = generateSortedDenouncesByMonth([].concat(otherDenounces).concat(compDenounces).concat(spamDenounces).concat(messDenounces), filters);

      // calculate
      const otherLength = otherDenounces.length || 0;
      const compLength = compDenounces.length || 0;
      const spamLength = spamDenounces.length || 0;
      const messLength = messDenounces.length || 0;

      const labels = ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'];
      const blockeds = [compDenouncesAccepted, messDenouncesAccepted, otherDenouncesAccepted, spamDenouncesAccepted];
      const rejecteds = [compDenouncesRejected, messDenouncesRejected, otherDenouncesRejected, spamDenouncesRejected];
      const data = [compLength, messLength, otherLength, spamLength];
      const table = sortedDenouncesByMonth;

      return {
        labels,
        data,
        blockeds,
        rejecteds,
        table
      }
    })
}

const reduceByUserAndMonth = (denounces) => {
  let reducedDenounces = [];
  const userMapByMonth = {};

  for (const denounce of denounces) {
    const label = `${denounce.year}/${denounce.month}`;

    if (userMapByMonth[label]) {
      userMapByMonth[label].push(denounce);
    } else {
      userMapByMonth[label] = [denounce];
    }
  }

  // por cada mes, reducir por usuario y sumamos las denuncias a 'reducedDenounces'
  Object.keys(userMapByMonth).map((label) => {
    const userMap = {};

    //  - si ya existe una denuncia y es aceptada, dejarla
    //  - si ya existe una denuncia y es rechazada, pero la actual no es aceptada, dejarla
    //  - caso contrario, ingresar esa denuncia
    for (const denounce of userMapByMonth[label]) {
      if ((userMap[denounce.userId] && userMap[denounce.userId].type === 'aceptada')) {
        console.log();
      } else if (userMap[denounce.userId] && userMap[denounce.userId].type === 'rechazada') {
        if (denounce.type === 'aceptada') {
          userMap[denounce.userId] = denounce
        }
      } else {
        userMap[denounce.userId] = denounce
      }
    }

    // map to array
    const denouncesByMonth = Object.keys(userMap).map((userId) => {
      return userMap[userId];
    });

    // sumamos las denuncias por usuario
    reducedDenounces = reducedDenounces.concat(denouncesByMonth);
    return null;
  });

  return reducedDenounces;
  // const userMap = {};

  // for (const denounce of denounces) {
  //   userMap[denounce.userId] = denounce
  // }

  // return Object.keys(userMap).map((key) => {
  //   return userMap[key];
  // });
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
    type: denounce.type,
    month: (new Date(denounce.date).getMonth() + 1),
    year: new Date(denounce.date).getFullYear()
  }));
}

const filterActiveUsers = (filters) => {
  return ActiveUserDB.list()
    .then((users) => {
      // filter by filters
      const filterUsers = filterUsersByFilters(users, filters);

      // generate users by month array
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
        table: usersMonthYearArray
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

const generateSortedDenouncesByMonth = (denounces, filters) => {
  const denouncesMap = {};

  // generamos un mapa para agrupar por fecha
  denounces.forEach((denounce) => {
    const type = denounce.type;
    const label = `${denounce.year}/${denounce.month}`;
    if (denouncesMap[label]) {
      if (denouncesMap[label][type]) {
        denouncesMap[label][type] += 1;
      } else {
        denouncesMap[label][type] = 1;
      }
    } else {
      denouncesMap[label] = {};
      denouncesMap[label][type] = 1;
    }
  });

  // las fechas que no tienen denuncias, las completamos con cero
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

        if (denouncesMap[label]) {
          denouncesMap[label].spam = denouncesMap[label].spam || 0;
          denouncesMap[label].otro = denouncesMap[label].otro || 0;
          denouncesMap[label]['mensaje inapropiado'] = denouncesMap[label]['mensaje inapropiado'] || 0;
          denouncesMap[label]['comportamiento abusivo'] = denouncesMap[label]['comportamiento abusivo'] || 0;
        } else {
          denouncesMap[label] = { 'mensaje inapropiado': 0, 'spam': 0, 'comportamiento abusivo': 0, 'otro': 0 }
        }
      }
    } else if (startYear < endYear) {
      for (let month = startMonth; month <= 12; month += 1) {
        const label = `${startYear}/${month}`;

        if (denouncesMap[label]) {
          denouncesMap[label].spam = denouncesMap[label].spam || 0;
          denouncesMap[label].otro = denouncesMap[label].otro || 0;
          denouncesMap[label]['mensaje inapropiado'] = denouncesMap[label]['mensaje inapropiado'] || 0;
          denouncesMap[label]['comportamiento abusivo'] = denouncesMap[label]['comportamiento abusivo'] || 0;
        } else {
          denouncesMap[label] = { 'mensaje inapropiado': 0, 'spam': 0, 'comportamiento abusivo': 0, 'otro': 0 }
        }
      }
      for (let month = 1; month < endMonth; month += 1) {
        const label = `${endYear}/${month}`;

        if (denouncesMap[label]) {
          denouncesMap[label].spam = denouncesMap[label].spam || 0;
          denouncesMap[label].otro = denouncesMap[label].otro || 0;
          denouncesMap[label]['mensaje inapropiado'] = denouncesMap[label]['mensaje inapropiado'] || 0;
          denouncesMap[label]['comportamiento abusivo'] = denouncesMap[label]['comportamiento abusivo'] || 0;
        } else {
          denouncesMap[label] = { 'mensaje inapropiado': 0, 'spam': 0, 'comportamiento abusivo': 0, 'otro': 0 }
        }
      }
    }
  }

  // generamos un array de denuncias para armar la tabla, por cada posicion tenemos cuantas denuncias hubo por esa fecha
  const denouncesByMonthArray = [];

  Object.keys(denouncesMap).forEach((label) => {
    denouncesByMonthArray.push({
      label,
      spam: denouncesMap[label].spam || 0,
      otro: denouncesMap[label].otro || 0,
      'mensaje inapropiado': denouncesMap[label]['mensaje inapropiado'] || 0,
      'comportamiento abusivo': denouncesMap[label]['comportamiento abusivo'] || 0
    });
  });

  // ordenamos el array
  const sortedDenouncesByMonthArray = denouncesByMonthArray.sort((a, b) => {
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

  return sortedDenouncesByMonthArray;
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
