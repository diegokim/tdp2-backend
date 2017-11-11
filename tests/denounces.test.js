/* eslint no-undef:off */
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')
const DB = require('../database/database');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';
const ADMIN_TOKEN = '02ba3f90-b5a3-4576-ba69-93df1c6772ec';

describe('Integration denounces tests', () => {
  let response;

  // Leave the database in a valid state
  beforeEach(() => DB.drop().then(() => DB.initialize({ includeProjectConfs: true })));

  describe('List denounces', () => {
    describe('when the report does occur', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id2' })
        return DB.initialize({ profiles: [userProfile, anotherUserProfile] })
      })
      beforeEach(() => {
        return request.actionUser('access_token', 'id2', { action: 'report', message: 'malo malo', type: 'otro' })
          .then(() => request.actionUser('access_token', 'id', { action: 'report', type: 'spam' }))
          .then(() => (response = request.listDenounces(ADMIN_TOKEN)))
      });

      it('should return the denounces in pendiente status', () => response
        .then((res) => {
          const expectedDenounces = [{
            sendUID: 'id',
            recUID: 'id2',
            sendUName: 'name',
            recUName: 'name2',
            message: 'malo malo',
            status: 'pendiente',
            type: 'otro'
          }, {
            sendUID: 'id2',
            recUID: 'id',
            sendUName: 'name2',
            recUName: 'name',
            message: 'No message',
            status: 'pendiente',
            type: 'spam'
          }]

          delete res.body[0]._id;
          delete res.body[1]._id;
          delete res.body[0].__v;
          delete res.body[1].__v;
          delete res.body[0].date;
          delete res.body[1].date;

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expectedDenounces);
        }));
    })
  });

  describe('Update denounce', () => {
    describe('when send an invalid token', () => {
      beforeEach(() => (
        response = request.updateDenounce(accessToken, { sendUID: 'id', recUID: 'id2' }))
      );

      it('should return 401', () => response
        .then((res) => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.message, 'Invalid Token');
          assert.equal(res.message, 'Unauthorized');
        }));
    })

    describe('when update and invalid denounce', () => {
      beforeEach(() => (
        response = request.updateDenounce(ADMIN_TOKEN, { sendUID: 'id', recUID: 'id2' }))
      );

      it('should return 400', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body.message, 'invalid denounce');
          assert.equal(res.message, 'Bad Request');
        }));
    })

    describe('when update the denounce with rechazado', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id2' })
        return DB.initialize({ profiles: [userProfile, anotherUserProfile] })
      })
      beforeEach(() => {
        return request.actionUser('access_token', 'id2', { action: 'report', message: 'malo malo' })
          .then(() => request.actionUser('access_token', 'id', { action: 'report', message: 'malo malo' }))
          .then(() => request.updateDenounce(ADMIN_TOKEN, { status: 'rechazada', sendUID: 'id', recUID: 'id2' }))
          .then(() => (response = request.listDenounces(ADMIN_TOKEN)))
      });

      it('should return the denounces with other status', () => response
        .then((res) => {
          const expectedDenounces = [{
            sendUID: 'id',
            recUID: 'id2',
            sendUName: 'name',
            recUName: 'name2',
            message: 'malo malo',
            status: 'rechazada',
            type: 'otro'
          }, {
            sendUID: 'id2',
            recUID: 'id',
            sendUName: 'name2',
            recUName: 'name',
            message: 'malo malo',
            status: 'pendiente',
            type: 'otro'
          }]

          delete res.body[0]._id;
          delete res.body[0].__v;
          delete res.body[1]._id;
          delete res.body[1].__v;
          delete res.body[0].date;
          delete res.body[1].date;

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expectedDenounces);
        }));
    })

    describe('when update the denounce with aceptada', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id2' })
        nockProfile(['id'], accessToken, { id: 'id3' })
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [userProfile, anotherUserProfile, anotherAnotherUserProfile] })
      })
      beforeEach(() => {
        return request.actionUser('access_token', 'id', { action: 'report', message: 'malo malo', type: 'comportamiento extraño' })
          .then(() => request.actionUser('access_token', 'id', { action: 'report', message: 'malo eres' }))
          .then(() => request.actionUser('access_token', 'id2', { action: 'report', message: 'desgraciado' }))
          .then(() => request.updateDenounce(ADMIN_TOKEN, { status: 'aceptada', sendUID: 'id2', recUID: 'id' }))
      });

      it('should return all the denounces with the same recUID with aceptada status', () =>
        request.listDenounces(ADMIN_TOKEN)
        .then((res) => {
          const expectedDenounces = [{
            sendUID: 'id2',
            recUID: 'id',
            sendUName: 'name2',
            recUName: 'name',
            message: 'malo malo',
            status: 'aceptada',
            type: 'comportamiento extraño'
          }, {
            sendUID: 'id3',
            recUID: 'id',
            sendUName: 'name3',
            recUName: 'name',
            message: 'malo eres',
            status: 'usuario bloqueado',
            type: 'otro'
          }, {
            sendUID: 'id',
            recUID: 'id2',
            sendUName: 'name',
            recUName: 'name2',
            message: 'desgraciado',
            status: 'pendiente',
            type: 'otro'
          }]

          delete res.body[0]._id;
          delete res.body[0].__v;
          delete res.body[1]._id;
          delete res.body[1].__v;
          delete res.body[2]._id;
          delete res.body[2].__v;
          delete res.body[0].date;
          delete res.body[1].date;
          delete res.body[2].date;

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expectedDenounces);
        }));

      it('should block the user', () =>
        request.getUserProfile(ADMIN_TOKEN, 'id')
        .then((res) => {
          const expectedProfile = Object.assign({ status: 'blocked' }, userProfile);

          delete res.body._id;
          delete res.body.__v;

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expectedProfile);
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
  name: 'name2',
  photo: 'foto2'
}

const anotherAnotherUserProfile = {
  id: 'id3',
  name: 'name3',
  photo: 'foto3'
}
