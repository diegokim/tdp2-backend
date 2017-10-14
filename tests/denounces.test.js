/* eslint no-undef:off */
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')
const DB = require('../database/database');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';

describe('Integration denounces tests', () => {
  let response;

  // Leave the database in a valid state
  beforeEach(() => DB.drop());

  describe('List denounces', () => {
    describe('when the report does occur', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id2' })
        return DB.initialize({ profiles: [userProfile, anotherUserProfile] })
      })
      beforeEach(() => {
        return request.actionUser('access_token', 'id2', { action: 'report', message: 'malo malo' })
          .then(() => request.actionUser('access_token', 'id', { action: 'report', message: 'malo malo eres' }))
          .then(() => (response = request.listDenounces('access_token')))
      });

      it('should return the denounces in pendiente status', () => response
        .then((res) => {
          const expectedDenounces = [{
            sendUID: 'id',
            recUID: 'id2',
            sendUName: 'name',
            recUName: 'name',
            message: 'malo malo',
            status: 'pendiente'
          }, {
            sendUID: 'id2',
            recUID: 'id',
            sendUName: 'name',
            recUName: 'name',
            message: 'malo malo eres',
            status: 'pendiente'
          }]

          delete res.body[0]._id;
          delete res.body[0].__v;
          delete res.body[1]._id;
          delete res.body[1].__v;

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expectedDenounces);
        }));
    })
  });

  describe('Update denounce', () => {
    describe('when update and invalid denounce', () => {
      beforeEach(() => (
        response = request.updateDenounce('access_token', { sendUID: 'id', recUID: 'id2' }))
      );

      it('should return 400', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body.message, 'invalid denounce');
          assert.equal(res.message, 'Bad Request');
        }));
    })

    describe('when update the denounce', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [userProfile, anotherUserProfile] })
      })
      beforeEach(() => {
        return request.actionUser('access_token', 'id2', { action: 'report', message: 'malo malo' })
          .then(() => request.updateDenounce('access_token', { status: 'aceptada', sendUID: 'id', recUID: 'id2' }))
          .then(() => (response = request.listDenounces('access_token')))
      });

      it('should return the denounces with other status', () => response
        .then((res) => {
          const expectedDenounces = [{
            sendUID: 'id',
            recUID: 'id2',
            sendUName: 'name',
            recUName: 'name',
            message: 'malo malo',
            status: 'aceptada'
          }]

          delete res.body[0]._id;
          delete res.body[0].__v;

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expectedDenounces);
        }));
    })
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

const userProfile = {
  id: 'id',
  name: 'name',
  description: 'alta descripcion',
  photos: [
    'foto 1',
    'foto 2'
  ],
  photo: 'foto 1',
  education: 'High School',
  age: 24,
  gender: 'male',
  interests: [
    'racing',
    'fiuba'
  ],
  work: 'work description',
  location: [-58.368645, -34.667453] // cancha de Racing
}

const anotherUserProfile = {
  id: 'id2',
  name: 'name',
  photo: 'foto2'
}
