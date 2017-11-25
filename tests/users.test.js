/* eslint no-undef:off */
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')
const DB = require('../database/database');
const UsersDB = require('../database/usersDB');
const DenouncesDB = require('../database/denouncesDB');
const SettingDB = require('../database/settingDB');
const LinkDB = require('../database/linkDB');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';
const ADMIN_TOKEN = '02ba3f90-b5a3-4576-ba69-93df1c6772ec';

describe('Integration user tests', () => {
  let response;

  // Leave the database in a valid state
  beforeEach(() => DB.drop().then(() => DB.initialize({ includeProjectConfs: true })));

  describe('Get Profile', () => {
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

  describe('Get User Profile', () => {
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

  describe('Update Profile', () => {
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

  describe('Get Advertising', () => {
    describe('When the user is not login', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
      })
      beforeEach(() => (response = request.getUserAdvertising('access_token')));

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
      beforeEach(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image', name: 'name', startDate: '2017-10-10', endDate: '2099-11-30' })
        .then(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image-2', name: 'name', startDate: '2017-10-10', endDate: '2099-10-30' }))
        .then(() => (response = request.getUserAdvertising(accessToken)))
      );

      it('should return the advertising', () => response
        .then((res) => {
          assert.equal(res.status, 200);
          assert.include(['image', 'image-2'], res.body.image);
        }));
    });

    describe('When return the advertising filtering by date', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [userProfile] })
      })
      beforeEach(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image', name: 'name', startDate: '2016-10-10', endDate: '2017-10-30' })
        .then(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image-2', name: 'name', startDate: '2017-10-10', endDate: '2099-10-30' }))
        .then(() => (response = request.getUserAdvertising(accessToken)))
      );

      it('should return the advertising', () => response
        .then((res) => {
          assert.equal(res.status, 200);
          assert.equal('image-2', res.body.image);
        }));
    });
  });

  describe('Delete User', () => {
    describe('When the user is not login', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
      })
      beforeEach(() => (response = request.deleteUser('access_token')));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.response.body.message, 'user does not exist');
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When the user exists', () => {
      let profileResponse;
      let settingsResponse;
      let linksResponse;
      let denouncesResponse;
      let getProfileResponse;

      beforeEach(() => {
        const links = [{
          sendUID: 'id',
          recUID: 'id2',
          action: 'link'
        }, {
          sendUID: 'id2',
          recUID: 'id',
          action: 'link'
        }];
        const denounces = [{
          sendUID: 'id',
          recUID: 'id2',
          sendUName: 'nadie',
          recUName: 'none',
          message: 'message',
          status: 'pendent'
        }, {
          sendUID: 'id2',
          recUID: 'id',
          sendUName: 'nadie',
          recUName: 'none',
          message: 'message',
          status: 'pendent'
        }];

        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ profiles: [userProfile], settings: [userSetting], denounces: { denounces }, links })
      })
      beforeEach(() => (response = request.deleteUser(accessToken))
        .then(() => (profileResponse = UsersDB.list()))
        .then(() => (settingsResponse = SettingDB.list()))
        .then(() => (linksResponse = LinkDB.list()))
        .then(() => (denouncesResponse = DenouncesDB.list()))
        .then(() => (getProfileResponse = request.getProfile(accessToken)))
      );

      it('should return 204', () => response
        .then((res) => { assert.equal(res.status, 204); })
      );

      it('user profile should not exist', () => profileResponse
        .then((res) => { assert.deepEqual(res, []); })
      );

      it('user settings should not exist', () => settingsResponse
        .then((res) => { assert.deepEqual(res, []); })
      );

      it.skip('user links should not exist', () => linksResponse
        .then((res) => { assert.deepEqual(res, []); })
      );

      it('user denounces should not exist', () => denouncesResponse
        .then((res) => { assert.deepEqual(res, []); })
      );

      it('should return 404 get profile', () => getProfileResponse
        .then((res) => { assert.equal(res.status, 404); })
      );
    });
  })
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
  photo: 'up foto',
  photos: [
    'up foto',
    'up foto'
  ],
  description: 'descr'
}
