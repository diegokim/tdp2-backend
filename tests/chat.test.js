/* eslint no-undef:off */
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')
const DB = require('../database/database');

const mocks = require('../database/mocks');
const settings = mocks.mockSettings();

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';

describe('Integration chat tests', () => {
  let response;

  // Leave the database in a valid state
  beforeEach(() => DB.drop());

  describe('Send message', () => {
    describe('When the user does not exist', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
      })
      beforeEach(() => (response = request.sendChatMessage('access_token', 'id2', { message: 'message' })));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.response.body.message, 'user does not exist');
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When dont send message', () => {
      beforeEach(() => (response = request.sendChatMessage('access_token', 'id2', {})));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body.message, 'missing message');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When dont send userId', () => {
      beforeEach(() => (response = request.sendChatMessage('access_token', '', { message: 'message' })));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When user is blocked', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [Object.assign({}, userProfile, { status: 'blocked' })] })
      })
      beforeEach(() => (response = request.sendChatMessage('access_token', 'id2', { message: 'message' })));

      it('should return 403', () => response
        .then((res) => {
          assert.equal(res.status, 403);
          assert.deepEqual(res.message, 'Forbidden');
        }));
    });

    describe('When both users exist', function () {
      this.timeout(10000);

      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        nockSendMessageFirebase({ sendUID: 'id', recUID: 'id2' }, {})
        return DB.initialize({ profiles: [userProfile, anotherUserProfile], settings: settings.concat([userSetting]) })
      })
      beforeEach(() => (response = request.sendChatMessage('access_token', 'id2', { message: 'message' })));

      it('should return empty body', () => response
        .then((res) => {
          assert.equal(res.status, 201);
          assert.deepEqual(res.body, {});
        }));
    });
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

const nockSendMessageFirebase = ({ sendUID, recUID }, response) => {
  nock('https://tdp2-frontend-7028a.firebaseio.com')
    .post(`/chats/${sendUID}/messages/${recUID}`)
    .reply(201, response);

  nock('https://tdp2-frontend-7028a.firebaseio.com')
    .post(`/chats/${recUID}/messages/${sendUID}`)
    .reply(201, response);
}

const userSetting = {
  id: 'id',
  ageRange: {
    min: 18,
    max: 29
  },
  distRange: {
    min: 5,
    max: 10
  },
  invisible: true,
  interestType: 'female'
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
