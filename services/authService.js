
// const _ = require('lodash');
// const usersDB = require('../database/usersDB');
const faceAPI = require('../clients/faceAPI');
const params = ['id', 'birthday', 'photos'];

const MAX_PHOTOS = 5;

/**
 * User login.
 *
 * Receives an access_token and:
 *  - If the user exists, returns the profile
 *  - If not, validate the user has photos and is older than 18
 *    and returns the 5 first photos of his/her profile.
 */
module.exports.login = (accessToken) => faceAPI.getProfile(accessToken, params)
  .then(validateProfile)
  .then((profile) => {
    const photos = profile.photos.data.slice(0, MAX_PHOTOS);

    const promises = photos.map((photo) => faceAPI.getPhoto(accessToken, photo.id));
    return Promise.all(promises);
  })
  .then((photos) => ({ fotos: photos }))
  .catch((err) => Promise.reject({ status: err.status, message: err.message }));


const validateProfile = (profile) => {
  const photos = profile.photos.data;
  const birthday = new Date(profile.birthday);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
    age -= 1;
  }

  if (age < 18) {
    return Promise.reject({ status: 400, message: 'El usuario no es mayor de edad' });
  }
  if (photos.length === 0) {
    return Promise.reject({ status: 400, message: 'El usuario no posee fotos' });
  }
  return Promise.resolve(profile);
}
