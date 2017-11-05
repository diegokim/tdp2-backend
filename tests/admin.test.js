/* eslint no-undef:off */
const assert = require('chai').assert;
const request = require('./requests.js')
const DB = require('../database/database');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const ADMIN_TOKEN = '02ba3f90-b5a3-4576-ba69-93df1c6772ec';

describe('Integration Admin', () => {
  let response;

  // Leave the database in a valid state
  beforeEach(() => DB.drop().then(() => DB.initialize({ includeProjectConfs: true })));

  describe('Login', () => {
    describe('When the user has permitions', () => {
      beforeEach(() => (response = request.adminLogin({ user: 'admin', password: '1234567890' })));

      it('should return the admin token', () => response
        .then((res) => {
          assert.equal(res.status, 201);
          assert.deepEqual(res.body, { token: ADMIN_TOKEN });
        }));
    });

    describe('When dont send the user', () => {
      beforeEach(() => (response = request.adminLogin({ })));

      it('should return 403', () => response
        .then((res) => {
          assert.equal(res.status, 403);
          assert.equal(res.response.body.message, 'Invalid Account');
          assert.equal(res.message, 'Forbidden');
        }));
    });

    describe('When send an invalid user', () => {
      beforeEach(() => (response = request.adminLogin({ user: 'lucas', password: 'pepe' })));

      it('should return 403', () => response
        .then((res) => {
          assert.equal(res.status, 403);
          assert.equal(res.response.body.message, 'Invalid Account');
          assert.equal(res.message, 'Forbidden');
        }));
    });
  });

  describe('Views', () => {
    describe('When get the main path', () => {
      beforeEach(() => (response = request.getView('any', '')));

      it('should return the main path and not authorice it', () => response
        .then((res) => {
          assert.equal(res.status, 200);
        }));
    });

    describe('When get other path', () => {
      describe('and token is authorized', () => {
        beforeEach(() => (response = request.getView(ADMIN_TOKEN, 'denounces.html')));

        it('should return the admin token', () => response
          .then((res) => {
            assert.equal(res.status, 200);
          }));
      });

      describe.skip('and token is not authorized', () => {
        beforeEach(() => (response = request.getView('any', 'denounces.html')));

        it('should return 401', () => response
          .then((res) => {
            assert.equal(res.status, 401);
          }));
      });
    });
  });
});
