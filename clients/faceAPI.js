/* eslint no-invalid-this:off */
const FB = require('fb');
FB.options({ Promise });

module.exports.getProfile = (accessToken, params) => {
  let paramsToSearch = '';
  for (const prop of params) {
    paramsToSearch = paramsToSearch.concat(prop).concat(',');
  }
  paramsToSearch = paramsToSearch.slice(0, -1);

  return FB.api(`/me?fields=${paramsToSearch}`, { 'access_token': accessToken })
    .catch(processError)
  ;
}

module.exports.getPhoto = (accessToken, photoId) => { // eslint-disable-line
  return FB.api(`/${photoId}?fields=picture`, { 'access_token': accessToken }) //?fields=images
    .then((linkPhotos) => linkPhotos.picture)
    .catch(processError)
  ;
}

module.exports.getPosts = (accessToken, since = '1900-1-1', until = Date.now()) => {
  return FB.api(`/me/posts?until=${until}&since=${since}`, { 'access_token': accessToken })
    .then((posts) => posts.data)
    .catch(processError)
  ;
}

module.exports.getProfilePhotos = (accessToken) => {
  return FB.api('/me/albums?fields=type', { 'access_token': accessToken })
    .then((albums) => albums.data)
    .then((albums) => {
      const profileAlbums = albums.filter((album) => album.type === 'profile');
      return profileAlbums.length ?
        this.getAlbumPhotos(accessToken, profileAlbums[0].id) :
        []
    })
    .catch(processError)
  ;
}

module.exports.getAlbumPhotos = (accessToken, id) => {
  return FB.api(`/${id}/photos?fields=picture`, { 'access_token': accessToken })
    .then((linkPhotos) => linkPhotos.data)
    .catch(processError)
  ;
}

const processError = (err) => {
  const error = err.response ? err.response.error : { message: err, code: 500 }
  const code = error.code === 190 ? 403 : 500;

  return Promise.reject({ status: code, message: error.message });
}
