/* eslint no-undef:off */
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';

describe('Integration auth tests', () => {
  describe('Login', () => {
    let profile;
    let response;

    describe('When the user has not profile photos', () => {
      beforeEach(() => {
        profile = {
          id: '22',
          birthday: '08/13/1993',
          photos: { data: [] }
        }
        return nockProfile(['id', 'birthday', 'photos'], accessToken, profile)
      })
      beforeEach(() => (response = request.login('access_token')));

      it('should return bad request', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body, 'El usuario no posee fotos');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When the user is not older than 18', () => {
      beforeEach(() => {
        profile = {
          id: '22',
          birthday: '08/13/2016',
          photos: { data: [{ profile: '' }] }
        }
        return nockProfile(['id', 'birthday', 'photos'], accessToken, profile)
      })
      beforeEach(() => (response = request.login('access_token')));

      it('should return bad request', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body, 'El usuario no es mayor de edad');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When the user does not send access_token', () => {
      beforeEach(() => (response = request.login('')));

      it('should return bad request', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body, 'Missing Auth token');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When the user has a valid profile', () => {
      let photo;
      beforeEach(() => {
        profile = {
          id: '22',
          birthday: '08/13/1993',
          photos: { data: [
            { id: 'id1' },
            { id: 'id2' },
            { id: 'id3' }
          ] }
        }
        photo = {
          picture: 'link'
        }
        nockProfile(['id', 'birthday', 'photos'], accessToken, profile)
        nockGetPhoto(['id1', 'id2', 'id3'], accessToken, photo)
      })
      beforeEach(() => (response = request.login('access_token')));

      it('should return bad request', () => response
        .then((res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { fotos: ['link', 'link', 'link'] });
        }));
    });

    // describe('When the user has already logged', () => {
    //   beforeEach(() => {
    //   })
    //   beforeEach(() => (response = request.login('access_token')));

    //   it('should return bad request', () => response
    //     .then((res) => {
    //       assert.equal(res.status, 200);
    //       assert.equal(res.body, userProfile);
    //     }));
    // });
  });
});

const nockProfile = (params, accessToken, response) => {
  let paramsToSearch = '';
  for (const prop of params) {
    paramsToSearch = paramsToSearch.concat(prop).concat('%2C');
  }
  paramsToSearch = paramsToSearch.slice(0, -3);

  return nock('https://graph.facebook.com')
    .get(`/v2.3/me?fields=${paramsToSearch}&access_token=${accessToken}`)
    .reply(200, response);
}

const nockGetPhoto = (ids, accessToken, response) => {
  for (const id of ids) {
    nock('https://graph.facebook.com')
    .get(`/v2.3/${id}?fields=picture&access_token=${accessToken}`)
    .reply(200, response);
  }
}
