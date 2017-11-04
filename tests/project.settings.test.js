/* eslint no-undef:off */
const _ = require('lodash');
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')
const DB = require('../database/database');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';
const ADMIN_TOKEN = '02ba3f90-b5a3-4576-ba69-93df1c6772ec';

describe('Integration Project Setting tests', () => {
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
