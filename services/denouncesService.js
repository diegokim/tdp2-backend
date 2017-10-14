const DenouncesDB = require('../database/denouncesDB');

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
  return DenouncesDB.updateDenounce(denounce.sendUID, denounce.recUID, denounce.status);
}
