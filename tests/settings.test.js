/* eslint no-undef:off */
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')
const DB = require('../database/database');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';

describe('Integration setting tests', () => {
  let response;

  // Leave the database in a valid state
  beforeEach(() => DB.drop());

  describe('get Settings', () => {
    describe('When the user is not login', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
      })
      beforeEach(() => (response = request.getSettings('access_token')));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.response.body.message, 'user does not exist');
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When user is blocked', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [Object.assign({}, userProfile, { status: 'blocked' })], settings: [userSetting] })
      })
      beforeEach(() => (response = request.getSettings('access_token')));

      it('should return 403', () => response
        .then((res) => {
          assert.equal(res.status, 403);
          assert.deepEqual(res.message, 'Forbidden');
        }));
    });

    describe('When the user exists', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [userProfile], settings: [userSetting] })
      })
      beforeEach(() => (response = request.getSettings('access_token')));

      it('should return the settings', () => response
        .then((res) => {
          const resultSet = formatDBResponse(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(resultSet, userSetting);
        }));
    });
  });

  describe('update Settings', () => {
    describe('When the user is not login', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
      })
      beforeEach(() => (response = request.updateSettings('access_token', updateParams)));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.response.body.message, 'user does not exist');
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When the user exists and is free', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [userProfile], settings: [userSetting] })
      })
      beforeEach(() => (response = request.updateSettings('access_token', updateParams)));

      it('should return the updated settings with supper links count updated', () => response
        .then((res) => {
          resultSet = Object.assign({}, userSetting, updateParams, { superLinksCount: 5 });

          assert.equal(res.status, 200);
          assert.deepEqual(resultSet, formatDBResponse(res.body));
        }));
    });

    describe('When the user exists and is premium', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [userProfile], settings: [Object.assign({}, userSetting, { accountType: 'premium' })] })
      })
      beforeEach(() => (response = request.updateSettings('access_token', Object.assign({}, updateParams, { accountType: 'free' }))));

      it('should return the updated settings with supper links count updated', () => response
        .then((res) => {
          resultSet = Object.assign({}, userSetting, updateParams, { superLinksCount: 1, accountType: 'free' });

          assert.equal(res.status, 200);
          assert.deepEqual(resultSet, formatDBResponse(res.body));
        }));
    });

    describe('When the user exists and update registrationToken', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [userProfile], settings: [Object.assign({}, userSetting)] })
      })
      beforeEach(() => (response = request.updateSettings('access_token', Object.assign({}, userSetting, { registrationToken: 'reg' }))));

      it('should return the updated settings', () => response
        .then((res) => {
          resultSet = Object.assign({}, userSetting, { registrationToken: 'reg' });

          assert.equal(res.status, 200);
          assert.deepEqual(resultSet, formatDBResponse(res.body));
        }));
    });
  });
});

const formatDBResponse = (dbResponse) => {
  const result = dbResponse;
  delete result.__v;
  delete result._id;

  return result;
}

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

const userSetting = {
  id: 'id',
  ageRange: {
    min: 18,
    max: 29
  },
  distRange: {
    min: 1,
    max: 3
  },
  invisible: true,
  interestType: 'male',
  accountType: 'free',
  notifications: true,
  superLinksCount: 1
}

const updateParams = {
  ageRange: {
    min: 18,
    max: 32
  },
  distRange: {
    min: 1,
    max: 500
  },
  invisible: false,
  interestType: 'female',
  accountType: 'premium',
  registrationToken: ''
}

const userProfile = {
  id: 'id',
  name: 'name'
}
