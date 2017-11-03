/* eslint no-undef:off */
const assert = require('chai').assert;
const request = require('./requests.js')
const DB = require('../database/database');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const ADMIN_TOKEN = '02ba3f90-b5a3-4576-ba69-93df1c6772ec';

describe('Integration Reports tests', () => {
  let response;

  // Leave the database in a valid state
  beforeEach(() => DB.drop());

  describe('Get reports', () => {
    describe('when exists one user for denounce', () => {
      beforeEach(() => {
        const denounces = [
          makeDenounce('', '', 'id0', 'jorge', 'malo', 'pendiente', 'otro'),
          makeDenounce('', '', 'id1', 'pedro', 'malo', 'pendiente', 'otro'),
          makeDenounce('', '', 'id2', 'carlos', 'malo', 'pendiente', 'otro'),
          makeDenounce('', '', 'id3', 'tincho', 'malo', 'pendiente', 'comportamiento extraño'),
          makeDenounce('', '', 'id4', 'pepepe', 'malo', 'pendiente', 'comportamiento extraño'),
          makeDenounce('', '', 'id5', 'claudio', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id6', 'pirulo', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id7', 'pancho', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id8', 'pepin', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id9', 'bill', 'malo', 'pendiente', 'spam')
        ];

        return DB.initialize({ denounces: { denounces } })
      })

      beforeEach(() => (response = request.getReports(ADMIN_TOKEN)));

      it('should return the rigth report', () => response
        .then((res) => {
          const expectedReports = {
            activeUsers: {
              sampling: [{
                x: 0,
                y: 10
              }, {
                x: 1,
                y: 20
              }, {
                x: 2,
                y: 30
              }]
            },
            denounces: {
              otro: {
                count: 3,
                percentage: 30
              },
              spam: {
                count: 5,
                percentage: 50
              },
              comp: {
                count: 2,
                percentage: 20
              }
            }
          }

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expectedReports);
        }));
    })

    describe('when exists more than one user for denounce', () => {
      beforeEach(() => {
        const denounces = [
          makeDenounce('', '', 'id0', 'jorge', 'malo', 'pendiente', 'otro'),
          makeDenounce('', '', 'id0', 'jorge', 'malo1', 'pendiente', 'otro'),
          makeDenounce('', '', 'id0', 'jorge', 'malo2', 'pendiente', 'otro'),
          makeDenounce('', '', 'id1', 'pedro', 'malo', 'pendiente', 'otro'),
          makeDenounce('', '', 'id2', 'carlos', 'malo', 'pendiente', 'otro'),
          makeDenounce('', '', 'id3', 'tincho', 'malo', 'pendiente', 'comportamiento extraño'),
          makeDenounce('', '', 'id4', 'pepepe', 'malo', 'pendiente', 'comportamiento extraño'),
          makeDenounce('', '', 'id4', 'pepepe', 'malo1', 'pendiente', 'comportamiento extraño'),
          makeDenounce('', '', 'id5', 'claudio', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id6', 'pirulo', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id7', 'pancho', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id8', 'pepin', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id9', 'bill', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id9', 'bill', 'malo1', 'pendiente', 'spam'),
          makeDenounce('', '', 'id9', 'bill', 'malo2', 'pendiente', 'spam')
        ];

        return DB.initialize({ denounces: { denounces } })
      })

      beforeEach(() => (response = request.getReports(ADMIN_TOKEN)));

      it('should return the rigth report', () => response
        .then((res) => {
          const expectedReports = {
            activeUsers: {
              sampling: [{
                x: 0,
                y: 10
              }, {
                x: 1,
                y: 20
              }, {
                x: 2,
                y: 30
              }]
            },
            denounces: {
              otro: {
                count: 3,
                percentage: 30
              },
              spam: {
                count: 5,
                percentage: 50
              },
              comp: {
                count: 2,
                percentage: 20
              }
            }
          }

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expectedReports);
        }));
    })
  });
});


const makeDenounce = (sendUID, sendUName, recUID, recUName, message, status = 'pendiente', type) => {
  return {
    sendUID,
    sendUName,
    recUID,
    recUName,
    message,
    status,
    type
  }
}
