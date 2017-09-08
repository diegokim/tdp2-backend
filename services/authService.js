const UsersDB = require('../database/usersDB');
const faceAPI = require('../clients/faceAPI');
const params = ['id', 'name', 'photos', 'birthday', 'education', 'work', 'gender', 'interested_in']

// ['favorite_teams', 'political', 'books{genre,name}', 'movies{name,genre}', 'music{name,genre}']

const MAX_PHOTOS = 5;
const MAX_INTEREST = 5;

/**
 * User login.
 *
 * Receives an access_token and:
 *  - If the user exists, returns the profile
 *  - If not, validate the user has photos and is older than 18
 *    and returns the 5 first photos of his/her profile.
 */
 // eslint-disable-next-line
module.exports.login = (accessToken) => {
  return faceAPI.getProfile(accessToken, ['id'])
    .then((fbProfile) => UsersDB.get(fbProfile.id))
    .then((userProfile) => {
      if (!userProfile) {
        return faceAPI.getProfile(accessToken, params)
          .then((profile) => validateProfile(profile)
            .then(() => saveProfile(profile))
            .then(() => getPhotosLink(profile.photos.data, accessToken))
          )
      }
      if (!userProfile.foto || userProfile.foto.length === 0) {
        return faceAPI.getProfile(accessToken, ['photos'])
          .then((profile) => getPhotosLink(profile.photos.data, accessToken))
      }
      return parseUserProfile(userProfile);
    })
    .catch((err) => Promise.reject(err));
}


const saveProfile = (profile) => {
  const educacion = profile.education ? profile.education[0].type : '';
  const ocupacion = (profile.work || {}).description || '';
  const intereses = (profile.interested_in || []).slice(0, MAX_INTEREST); // luego buscar en musica, bla bla
  const newUser = new UsersDB({
    foto: '',
    fotos: [],
    educacion,
    ocupacion,
    intereses,
    description: '',
    id: profile.id,
    sexo: profile.gender,
    nombre: profile.name,
    nacimiento: profile.birthday
  });


  return UsersDB.create(newUser);
}

const parseUserProfile = (profile) => (profile)

/**
 * Get user photos as links
 *
 */
const getPhotosLink = (profilePhotos, accessToken) => {
  const photos = profilePhotos.slice(0, MAX_PHOTOS);
  const promises = photos.map((photo) => faceAPI.getPhoto(accessToken, photo.id));

  return Promise.all(promises)
    .then((photos) => ({ fotos: photos })) // obtener en base 64 ?
}

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
