const FB = require('fb');
FB.options({ Promise });

module.exports.getProfile = (accessToken, params) => {
  let paramsToSearch = '';
  for (const prop of params) {
    paramsToSearch = paramsToSearch.concat(prop).concat(',');
  }
  paramsToSearch = paramsToSearch.slice(0, -1);

  return FB.api(`/me?fields=${paramsToSearch}`, { 'access_token': accessToken })
    .catch((err) => {
      const error = err.response ? err.response.error : { message: err, code: 500 }
      const code = error.code === 190 ? 403 : 500;

      return Promise.reject({ status: code, message: error.message });
    })
  ;
}

module.exports.getPhoto = (accessToken, photoId) => { // eslint-disable-line
  return FB.api(`/${photoId}?fields=picture`, { 'access_token': accessToken })
    .then((linkPhotos) => linkPhotos.picture)
    .catch((err) => {
      const error = err.response ? err.response.error : { message: err, code: 500 }
      const code = error.code === 190 ? 403 : 500;

      return Promise.reject({ status: code, message: error.message });
    })
  ;
}
