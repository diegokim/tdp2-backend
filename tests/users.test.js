/* eslint no-undef:off */
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')
const DB = require('../database/database');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';
const ADMIN_TOKEN = '02ba3f90-b5a3-4576-ba69-93df1c6772ec';

describe('Integration user tests', () => {
  let response;

  // Leave the database in a valid state
  beforeEach(() => DB.drop());

  describe('get Profile', () => {
    describe('When the user is not login', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
      })
      beforeEach(() => (response = request.getProfile('access_token')));

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
        return DB.initialize({ profiles: [Object.assign({}, userProfile, { status: 'blocked' })] })
      })
      beforeEach(() => (response = request.getProfile('access_token')));

      it('should return 403', () => response
        .then((res) => {
          assert.equal(res.status, 403);
          assert.deepEqual(res.message, 'Forbidden');
        }));
    });

    describe('When the user exists', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [userProfile] })
      })
      beforeEach(() => (response = request.getProfile('access_token')));

      it('should return the profile', () => response
        .then((res) => {
          const resultProf = formatDBResponse(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(resultProf, userProfile);
        }));
    });
  });

  describe('get User Profile', () => {
    describe('When the user does not exist', () => {
      beforeEach(() => (response = request.getUserProfile(ADMIN_TOKEN, 'id')));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.response.body.message, 'user is not login');
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('when send an invalid token', () => {
      beforeEach(() => (
        response = request.getUserProfile(accessToken, 'id'))
      );

      it('should return 401', () => response
        .then((res) => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.message, 'Invalid Token');
          assert.equal(res.message, 'Unauthorized');
        }));
    });

    describe('When the user exists', () => {
      beforeEach(() => DB.initialize({ profiles: [userProfile] }))
      beforeEach(() => (response = request.getUserProfile(ADMIN_TOKEN, 'id')));

      it('should return the profile', () => response
        .then((res) => {
          const resultProf = formatDBResponse(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(resultProf, userProfile);
        }));
    });
  });

  describe('update Profile', () => {
    describe('When the user is not login', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
      })
      beforeEach(() => (response = request.updateProfile('access_token', updateParams)));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.response.body.message, 'user does not exist');
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When the user exists', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [userProfile] })
      })
      beforeEach(() => (response = request.updateProfile('access_token', updateParams)));

      it('should return the updated profile', () => response
        .then((res) => {
          const resultProf = Object.assign({}, formatDBResponse(res.body), userProfile)

          assert.equal(res.status, 200);
          assert.deepEqual(resultProf, userProfile);
        }));
    });
  });
});

const formatDBResponse = (dbResponse) => {
  const result = dbResponse;
  delete result.__v;
  delete result._id;
  delete result.location;

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
  status: 'enable',
  work: 'work description'
}

const updateParams = {
  photo: 'up foto',
  photos: [
    'up foto',
    'up foto'
  ],
  description: 'descr'
}
