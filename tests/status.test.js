/* eslint no-undef:off */
const assert = require('chai').assert;
const request = require('superagent');
const baseUrl = 'http://localhost:5000';

// Start the app
const server = require('../app.js'); // eslint-disable-line

describe('Integration status tests', () => {
  describe('Status', () => {
    let response;
    beforeEach(() => (response = request.get(baseUrl + '/ping').send()));

    it('GET status', () => response
      .then((res) => {
        assert.equal(res.status, 200);
      }));
  });
});
