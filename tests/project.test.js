/* eslint no-undef:off */
const _ = require('lodash');
const assert = require('chai').assert;
const request = require('./requests.js')
const DB = require('../database/database');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';
const ADMIN_TOKEN = '02ba3f90-b5a3-4576-ba69-93df1c6772ec';

describe('Integration Project tests', () => {
  let response;

  // Leave the database in a valid state
  beforeEach(() => DB.drop().then(() => DB.initialize({ includeProjectConfs: true })));

  describe('Get Settings', () => {
    describe('when send an invalid token', () => {
      beforeEach(() => (
        response = request.getConfigs(accessToken))
      );

      it('should return 401', () => response
        .then((res) => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.message, 'Invalid Token');
          assert.equal(res.message, 'Unauthorized');
        }));
    });

    describe('When get the settings', () => {
      const expectedResponse = [{
        prettyName: 'Fotos minimas para loguearte',
        name: 'minPhotosToLogin',
        value: 5
      }, {
        prettyName: 'Fotos maximas para mostrar en login',
        name: 'maxPhotosToLogin',
        value: 7
      }, {
        prettyName: 'Links para cuenta Premium',
        name: 'linksForPremiumAccount',
        value: 5
      }, {
        prettyName: 'Intereses maximos para mostrar en login',
        name: 'maxInterestsToLogin',
        value: 5
      }, {
        prettyName: 'Candidatos maximos para mostrar',
        name: 'maxCandidatesToShow',
        value: 5
      }, {
        prettyName: 'Links para cuenta Free',
        name: 'linksForFreeAccount',
        value: 1
      }]

      beforeEach(() => (response = request.getConfigs(ADMIN_TOKEN)));

      it('should return the settings', () => response
        .then((res) => {
          const formatResponse = formatDBResponse(res.body);

          assert.equal(res.status, 200);
          assert.include(expectedResponse, formatResponse[0]);
          assert.include(expectedResponse, formatResponse[1]);
          assert.include(expectedResponse, formatResponse[2]);
          assert.include(expectedResponse, formatResponse[3]);
          assert.include(expectedResponse, formatResponse[4]);
          assert.include(expectedResponse, formatResponse[5]);
        }));
    });
  });

  describe('Update Settings', () => {
    describe('When the user is admin', () => {
      const updateValue = 10;
      const expectedResponse = [{
        prettyName: 'Fotos minimas para loguearte',
        name: 'minPhotosToLogin',
        value: 5
      }, {
        prettyName: 'Fotos maximas para mostrar en login',
        name: 'maxPhotosToLogin',
        value: 7
      }, {
        prettyName: 'Links para cuenta Premium',
        name: 'linksForPremiumAccount',
        value: 5
      }, {
        prettyName: 'Intereses maximos para mostrar en login',
        name: 'maxInterestsToLogin',
        value: 5
      }, {
        prettyName: 'Candidatos maximos para mostrar',
        name: 'maxCandidatesToShow',
        value: 5
      }, {
        prettyName: 'Links para cuenta Free',
        name: 'linksForFreeAccount',
        value: updateValue
      }]

      beforeEach(() => request.updateConfig(ADMIN_TOKEN, 'linksForFreeAccount', { value: updateValue })
        .then(() => (response = request.getConfigs(ADMIN_TOKEN)))
      );

      it('should return the settings', () => response
        .then((res) => {
          const formatResponse = formatDBResponse(res.body);

          assert.equal(res.status, 200);
          assert.include(expectedResponse, formatResponse[0]);
          assert.include(expectedResponse, formatResponse[1]);
          assert.include(expectedResponse, formatResponse[2]);
          assert.include(expectedResponse, formatResponse[3]);
          assert.include(expectedResponse, formatResponse[4]);
          assert.include(expectedResponse, formatResponse[5]);
        }));
    });
  });

  describe('Create Advertising', () => {
    describe('when send an invalid token', () => {
      beforeEach(() => (
        response = request.createProjectAdvertising(accessToken, { image: 'image' }))
      );

      it('should return 401', () => response
        .then((res) => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.message, 'Invalid Token');
          assert.equal(res.message, 'Unauthorized');
        }));
    });

    describe('When create the advertising', () => {
      beforeEach(() => (response = request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image' })));

      it('should return the created advertising', () => response
        .then((res) => {
          formatDBResponse(res.body);

          assert.equal(res.status, 200);
          assert.equal(res.body.image, 'image');
          assert.property(res.body, 'id');
        }));
    });
  });

  describe('List Advertising', () => {
    describe('when send an invalid token', () => {
      beforeEach(() => (
        response = request.getProjectAdvertising(accessToken))
      );

      it('should return 401', () => response
        .then((res) => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.message, 'Invalid Token');
          assert.equal(res.message, 'Unauthorized');
        }));
    });

    describe('When create the advertising', () => {
      beforeEach(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image' })
        .then(() => (response = request.getProjectAdvertising(ADMIN_TOKEN)))
      );

      it('should return the advertising list', () => response
        .then((res) => {
          formatDBResponseWithId(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, [{ image: 'image' }]);
        }));
    });
  });

  describe('Delete Advertising', () => {
    describe('when send an invalid token', () => {
      beforeEach(() => (
        response = request.deleteProjectAdvertising(accessToken))
      );

      it('should return 401', () => response
        .then((res) => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.message, 'Invalid Token');
          assert.equal(res.message, 'Unauthorized');
        }));
    });

    describe('When delete the advertising', () => {
      beforeEach(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image' })
        .then((res) => (response = request.deleteProjectAdvertising(ADMIN_TOKEN, res.body.id)))
      );

      it('should return 204', () => response
        .then((res) => {
          assert.equal(res.status, 204);
        }));
    });

    describe('When delete the advertising', () => {
      beforeEach(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image' })
        .then(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image-to-delete' }))
        .then((res) => request.deleteProjectAdvertising(ADMIN_TOKEN, res.body.id))
        .then(() => (response = request.getProjectAdvertising(ADMIN_TOKEN)))
      );

      it('should not return the deleted advertising', () => response
        .then((res) => {
          formatDBResponseWithId(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, [{ image: 'image' }]);
        }));
    });
  });
});

const formatDBResponse = (dbResponse) => {
  if (_.isArray(dbResponse)) {
    return dbResponse.map(formatDBResponse);
  }

  const result = dbResponse;
  delete result.__v;
  delete result._id;

  return result;
}

const formatDBResponseWithId = (dbResponse) => {
  if (_.isArray(dbResponse)) {
    return dbResponse.map(formatDBResponseWithId);
  }

  delete dbResponse.id;

  return formatDBResponse(dbResponse);
}
