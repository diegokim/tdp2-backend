const faceAPI = require('../clients/faceAPI');
const usersService = require('./usersService');
const bluebird = require('bluebird');
const base64 = bluebird.promisifyAll(require('node-base64-image'));

const params = ['id', 'name', 'photos', 'birthday', 'education', 'work', 'gender', 'interested_in', 'favorite_teams', 'books{name}', 'movies{genre}', 'music{name}']

const MAX_PHOTOS = 7;
const MAX_INTEREST = 5;
const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 1 * 365;

/**
 * User login.
 *
 * Receives an access_token and:
 *  - If the user exists, returns the profile
 *  - If not, validate the user has photos and is older than 18
 *    and returns the 5 first photos of his/her profile.
 */
module.exports.login = (accessToken) => {
  return faceAPI.getProfile(accessToken, ['id'])
    .then((fbProfile) => usersService.get(accessToken, fbProfile.id))
    .catch((err) => (err && err.status === 404 ? null : Promise.reject(err)))
    .then((user) => {
      if (!user) {
        return faceAPI.getProfile(accessToken, params)
          .then((profile) => validateProfile(profile)
            .then(() => validateUserCreationTime(accessToken))
            .then(() => parseProfile(profile))
            .then((pp) => usersService.createUser(pp))
            .then(() => getPhotosLink(profile.photos.data, accessToken))
          )
      }

      if (!user.profile.photo) {
        return faceAPI.getProfile(accessToken, ['photos'])
          .then((profile) => getPhotosLink(profile.photos.data, accessToken))
      }
      return user;
    })
    .catch((err) => Promise.reject(err));
}

const parseProfile = (profile) => {
  const education = profile.education ? profile.education[0].type : '';
  const work = (profile.work || {}).description || '';
  const interests = parseInterests(profile).slice(0, MAX_INTEREST);
  const newUser = {
    photo: '',
    photos: [],
    education,
    work,
    interests,
    description: '',
    id: profile.id,
    gender: profile.gender,
    name: profile.name,
    age: calculateAge(profile.birthday)
  };

  return Promise.resolve(newUser);
}

const parseInterests = (profile) => {
  if (profile.interested_in && profile.interested_in.length) {
    return profile.interested_in;
  }
  const musics = profile.music ? profile.music.data : [];
  const movies = profile.movies ? profile.movies.data : [];
  const books = profile.books ? profile.books.data : [];
  const favoriteTeams = profile.favorite_teams || [];

  const interests = musics.concat(movies).concat(books).concat(favoriteTeams);
  interests.sort(() => Math.random() - 0.5);
  return interests.map((interest) => interest.name);
}

const getPhotosLink = (photosToGet, accessToken) => {
  const allPhotos = photosToGet.slice(0, MAX_PHOTOS);

  return faceAPI.getProfilePhotos(accessToken)
    .then((profilePhotos) => {
      return profilePhotos.length ?
        profilePhotos :
        allPhotos
    })
    .then((photos) => {
      const promises = photos.map((photo) => faceAPI.getPhoto(accessToken, photo.id).then(getImageInBase64));

      return Promise.all(promises)
        .then((photos) => ({ photos }))
    })
}

const getImageInBase64 = (imageUrl) => {
  return imageUrl === 'test-url' ? // Esto es lo peor que hice en la FIUBA
    'link' :
    base64.encodeAsync(imageUrl, {string: true})
  ;
}

const validateProfile = (profile) => {
  const photos = profile.photos ? profile.photos.data : [];
  const age = calculateAge(profile.birthday);

  if (age < 18) {
    return Promise.reject({ status: 400, message: 'El usuario no es mayor de edad' });
  }
  if (photos.length === 0) {
    return Promise.reject({ status: 400, message: 'El usuario no posee fotos' });
  }
  return Promise.resolve(profile);
}

const validateUserCreationTime = (accessToken) => {
  const since = '1900-1-1';
  const until = new Date();
  const oneYearAgoTime = new Date().getTime() - YEAR_IN_MS;
  until.setTime(oneYearAgoTime);

  return faceAPI.getPosts(accessToken, since, until.getTime())
    .then((posts) => {
      return posts.length ?
        Promise.resolve() :
        Promise.reject({ status: 400, message: 'El usuario no tiene mas de un año de actividad' });
    })
}

const calculateAge = (birthdayString) => {
  const birthday = new Date(birthdayString);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
    age -= 1;
  }

  return age;
}
