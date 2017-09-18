/* eslint no-undef:off */
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')
const DB = require('../database/database');

const mocks = require('../database/mocks');
const profiles = mocks.mockProfiles();
const settings = mocks.mockSettings();

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';

describe('Integration link tests', () => {
  let response;

  // Leave the database in a valid state
  beforeEach((done) => {
    DB.drop()
		.then(done)
		.catch(done);
  });

  describe('get Candidates', () => {
    describe('When the user is not login', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
      })
      beforeEach(() => (response = request.getCandidates('access_token')));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.response.body.message, 'user is not login');
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When the user exists', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ users: profiles.concat([userProfile]), settings: settings.concat([userSetting]) })
      })
      beforeEach(() => (response = request.getCandidates('access_token')));

      it('should return the apropiated candidates', () => response
        .then((res) => {
          const resultSet = res.body.profiles;

          assert.equal(res.status, 200);
          assert.include(['id2', 'id4'], resultSet[0].id);
          assert.include(['id2', 'id4'], resultSet[1].id);
        }));
    });
  });

  describe('Link User', () => {
    describe('When the user does not exist', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
      })
      beforeEach(() => (response = request.linkUser('access_token', 'id2', 'link')));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.response.body.message, 'user does not exist');
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When dont send action', () => {
      beforeEach(() => (response = request.linkUser('access_token', 'id2')));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body.message, 'missing userId or action');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When both users exist', () => {
      describe('when a link does occur', () => {
        beforeEach(() => {
          nockProfile(['id'], accessToken, { id: 'id' })
          nockProfile(['id'], accessToken, { id: 'id2' })
          return DB.initialize({ users: [userProfile, anotherUserProfile] })
        })
        beforeEach(() => {
          return request.linkUser('access_token', 'id2', 'link')
            .then(() => (response = request.linkUser('access_token', 'id', 'link')))
        });

        it('should return true because a link has not occured', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { link: true });
          }));
      })

      describe('when a link does not occur', () => {
        beforeEach(() => {
          nockProfile(['id'], accessToken, { id: 'id' })
          return DB.initialize({ users: [userProfile, anotherUserProfile] })
        })
        beforeEach(() => (response = request.linkUser('access_token', 'id2', 'link')));

        it('should return false because a link has not occured', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { link: false });
          }));
      })
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
  work: 'work description'
}

const anotherUserProfile = {
  id: 'id2',
  name: 'name',
  photo: 'foto2'
}
