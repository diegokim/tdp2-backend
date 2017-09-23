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
  beforeEach(() => DB.drop());

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

      describe('when get links but has not anyone', () => {
        beforeEach(() => {
          nockProfile(['id'], accessToken, { id: 'id' })
          return DB.initialize({ users: [userProfile, anotherUserProfile] })
        })
        beforeEach(() => (response = request.getLinks('access_token')));

        it('should return empty links', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { profiles: [] });
          }));
      })

      describe('when get links with one user', () => {
        beforeEach(() => {
          nockProfile(['id'], accessToken, { id: 'id' })
          nockProfile(['id'], accessToken, { id: 'id2' })
          nockProfile(['id'], accessToken, { id: 'id' })
          return DB.initialize({ users: [userProfile, anotherUserProfile] })
        })
        beforeEach(() => {
          return request.linkUser('access_token', 'id2', 'link')
            .then(() => request.linkUser('access_token', 'id', 'link'))
            .then(() => (response = request.getLinks('access_token')))
        });

        it('should return the links', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body.profiles[0].id, 'id2');
            assert.deepEqual(res.body.profiles[0].photo, 'foto2');
          }));
      })

      describe('when get links with more than one user', () => {
        beforeEach(() => {
          nockProfile(['id'], accessToken, { id: 'id' })
          nockProfile(['id'], accessToken, { id: 'id2' })
          nockProfile(['id'], accessToken, { id: 'id' })
          nockProfile(['id'], accessToken, { id: 'id3' })
          nockProfile(['id'], accessToken, { id: 'id' })
          return DB.initialize({ users: [userProfile, anotherUserProfile, anotherAnotherUserProfile] })
        })
        beforeEach(() => {
          return request.linkUser('access_token', 'id2', 'link')
            .then(() => request.linkUser('access_token', 'id', 'link'))
            .then(() => request.linkUser('access_token', 'id3', 'link'))
            .then(() => request.linkUser('access_token', 'id', 'link'))
            .then(() => (response = request.getLinks('access_token')))
        });

        it('should return the links', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body.profiles[0].id, 'id2');
            assert.deepEqual(res.body.profiles[0].photo, 'foto2');
            assert.deepEqual(res.body.profiles[1].id, 'id3');
            assert.deepEqual(res.body.profiles[1].photo, 'foto3');
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

const anotherAnotherUserProfile = {
  id: 'id3',
  name: 'name',
  photo: 'foto3'
}
