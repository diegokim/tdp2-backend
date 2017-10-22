const DenouncesDB = require('../database/denouncesDB');

const BLOCKED_DENOUNCE_STATUS = 'usuario bloqueado';
const ACCEPTED_DENOUNCE_STATUS = 'aceptada';

/**
 * List denounces
 *
 */
module.exports.list = () => {
  return DenouncesDB.list();
}


/**
 * Update denounce.
 *
 */
module.exports.update = (denounce) => {
  let promise = Promise.resolve();

  if (denounce.status === ACCEPTED_DENOUNCE_STATUS) {
    promise = promise
      .then(() => DenouncesDB.search({ recUID: denounce.recUID }))
      .then((denounces) => {
        const promises = denounces.map(($denounce) => updateDenounceStatus($denounce, BLOCKED_DENOUNCE_STATUS));
        return Promise.all(promises);
      })
  }

  return promise.then(() => DenouncesDB.updateDenounce(denounce.sendUID, denounce.recUID, denounce.status));
}

const updateDenounceStatus = (denounce, status) => {
  return DenouncesDB.updateDenounce(denounce.sendUID, denounce.recUID, status);
}
