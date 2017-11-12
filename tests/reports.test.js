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
  beforeEach(() => DB.drop().then(() => DB.initialize({ includeProjectConfs: true })));

  describe('Get denounces reports', () => {
    describe('when exists one user for denounce', () => {
      beforeEach(() => {
        const denounces = [
          makeDenounce('', '', 'id0', 'jorge', 'malo', 'aceptada', 'otro'),
          makeDenounce('', '', 'id1', 'pedro', 'malo', 'aceptada', 'otro'),
          makeDenounce('', '', 'id2', 'carlos', 'malo', 'aceptada', 'otro'),
          makeDenounce('', '', 'id3', 'tincho', 'malo', 'aceptada', 'comportamiento abusivo'),
          makeDenounce('', '', 'id4', 'pepepe', 'malo', 'pendiente', 'comportamiento abusivo'),
          makeDenounce('', '', 'id5', 'claudio', 'malo', 'pendiente', 'mensaje inapropiado'),
          makeDenounce('', '', 'id6', 'pirulo', 'malo', 'aceptada', 'spam'),
          makeDenounce('', '', 'id7', 'pancho', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id8', 'pepin', 'malo', 'pendiente', 'spam'),
          makeDenounce('', '', 'id9', 'bill', 'malo', 'pendiente', 'spam')
        ];

        return DB.initialize({ denounces: { denounces } })
      })

      beforeEach(() => (response = request.getReports(ADMIN_TOKEN)));

      it('should return the rigth report', () => response
        .then((res) => {
          delete res.body.denounces.table;
          const expectedReports = {
            activeUsers: {
              labels: [],
              data: [
                { data: [], label: 'Usuarios Totales'},
                { data: [], label: 'Usuarios Premium'}
              ],
              table: []
            },
            denounces: {
              labels: ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'],
              data: [2, 1, 3, 4],
              blockeds: [1, 0, 3, 1]
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
          makeDenounce('', '', 'id3', 'tincho', 'malo', 'pendiente', 'comportamiento abusivo'),
          makeDenounce('', '', 'id4', 'pepepe', 'malo', 'pendiente', 'comportamiento abusivo'),
          makeDenounce('', '', 'id4', 'pepepe', 'malo1', 'pendiente', 'comportamiento abusivo'),
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
          delete res.body.denounces.table;
          const expectedReports = {
            activeUsers: {
              labels: [],
              data: [
                { data: [], label: 'Usuarios Totales'},
                { data: [], label: 'Usuarios Premium'}
              ],
              table: []
            },
            denounces: {
              labels: ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'],
              data: [2, 0, 3, 5],
              blockeds: [0, 0, 0, 0]
            }
          }

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, expectedReports);
        }));
    })

    describe('when filter denounces by date', () => {
      beforeEach(() => {
        const denounces = [
          makeDenounce('', '', 'id0', 'jorge', 'malo', 'pendiente', 'otro', '2000-01-01'),
          makeDenounce('', '', 'id1', 'jorge', 'malo1', 'pendiente', 'otro', '2000-02-02'),
          makeDenounce('', '', 'id2', 'jorge', 'malo2', 'pendiente', 'otro', '2000-03-03'),
          makeDenounce('', '', 'id3', 'pedro', 'malo', 'pendiente', 'otro', '2000-04-04'),
          makeDenounce('', '', 'id4', 'carlos', 'malo', 'pendiente', 'comportamiento abusivo', '2000-01-01'),
          makeDenounce('', '', 'id5', 'tincho', 'malo', 'pendiente', 'comportamiento abusivo', '2000-02-02'),
          makeDenounce('', '', 'id6', 'pepepe', 'malo', 'pendiente', 'comportamiento abusivo', '2000-03-03'),
          makeDenounce('', '', 'id7', 'pepepe', 'malo1', 'pendiente', 'comportamiento abusivo', '2000-04-04'),
          makeDenounce('', '', 'id8', 'claudio', 'malo', 'pendiente', 'mensaje inapropiado', '2000-01-01'),
          makeDenounce('', '', 'id9', 'pirulo', 'malo', 'pendiente', 'mensaje inapropiado', '2000-02-02'),
          makeDenounce('', '', 'id10', 'pancho', 'malo', 'pendiente', 'mensaje inapropiado', '2000-03-03'),
          makeDenounce('', '', 'id11', 'pancho', 'malo', 'pendiente', 'mensaje inapropiado', '2000-04-04'),
          makeDenounce('', '', 'id12', 'pepin', 'malo', 'pendiente', 'spam', '2000-01-01'),
          makeDenounce('', '', 'id13', 'bill', 'malo', 'pendiente', 'spam', '2000-02-02'),
          makeDenounce('', '', 'id14', 'bill', 'malo1', 'pendiente', 'spam', '2000-03-03'),
          makeDenounce('', '', 'id15', 'bill', 'malo2', 'pendiente', 'spam', '2000-04-04')
        ];

        return DB.initialize({ denounces: { denounces } })
      })

      describe('when filter by startDate', () => {
        beforeEach(() => (response = request.getReports(ADMIN_TOKEN, { startDate: '2000-02-02' })));

        it('should return the rigth report', () => response
          .then((res) => {
            delete res.body.denounces.table;
            const expectedReports = {
              activeUsers: {
                labels: [],
                data: [
                  { data: [], label: 'Usuarios Totales'},
                  { data: [], label: 'Usuarios Premium'}
                ],
                table: []
              },
              denounces: {
                labels: ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'],
                data: [3, 3, 3, 3],
                blockeds: [0, 0, 0, 0]
              }
            }

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expectedReports);
          }));
      });

      describe('when filter by endDate', () => {
        beforeEach(() => (response = request.getReports(ADMIN_TOKEN, { endDate: '2000-03-03' })));

        it('should return the rigth report', () => response
          .then((res) => {
            delete res.body.denounces.table;
            const expectedReports = {
              activeUsers: {
                labels: [],
                data: [
                  { data: [], label: 'Usuarios Totales'},
                  { data: [], label: 'Usuarios Premium'}
                ],
                table: []
              },
              denounces: {
                labels: ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'],
                data: [3, 3, 3, 3],
                blockeds: [0, 0, 0, 0]
              }
            }

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expectedReports);
          }));
      });

      describe('when filter by startDate endDate', () => {
        beforeEach(() => (response = request.getReports(ADMIN_TOKEN, { startDate: '2000-02-02', endDate: '2000-03-03' })));

        it('should return the rigth report', () => response
          .then((res) => {
            delete res.body.denounces.table;
            const expectedReports = {
              activeUsers: {
                labels: [],
                data: [
                  { data: [], label: 'Usuarios Totales'},
                  { data: [], label: 'Usuarios Premium'}
                ],
                table: []
              },
              denounces: {
                labels: ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'],
                data: [2, 2, 2, 2],
                blockeds: [0, 0, 0, 0]
              }
            }

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expectedReports);
          }));
      });
    })
  });

  describe('Get Active Users reports', () => {
    describe('when filter denounces by date', () => {
      beforeEach(() => {
        const activeUsers = [
          makeActiveUser('id1', '', 11, 2016, 'premium'),

          makeActiveUser('id1', '', 12, 2016, 'free'),
          makeActiveUser('id2', '', 12, 2016, 'premium'),
          makeActiveUser('id3', '', 12, 2016, 'premium'),
          makeActiveUser('id4', '', 12, 2016, 'premium'),

          makeActiveUser('id1', '', 1, 2017, 'free'),
          makeActiveUser('id2', '', 1, 2017, 'free'),
          makeActiveUser('id3', '', 1, 2017, 'free'),
          makeActiveUser('id4', '', 1, 2017, 'free'),
          makeActiveUser('id5', '', 1, 2017, 'premium'),

          makeActiveUser('id1', '', 2, 2017, 'premium'),
          makeActiveUser('id2', '', 2, 2017, 'premium'),
          makeActiveUser('id3', '', 2, 2017, 'premium'),

          makeActiveUser('id1', '', 3, 2017, 'premium'),
          makeActiveUser('id2', '', 3, 2017, 'premium'),
          makeActiveUser('id3', '', 3, 2017, 'premium'),
          makeActiveUser('id4', '', 3, 2017, 'premium'),
          makeActiveUser('id5', '', 3, 2017, 'premium'),
          makeActiveUser('id6', '', 3, 2017, 'free'),
          makeActiveUser('id7', '', 3, 2017, 'free'),
          makeActiveUser('id8', '', 3, 2017, 'free'),
          makeActiveUser('id9', '', 3, 2017, 'free'),
          makeActiveUser('id10', '', 3, 2017, 'free')
        ];

        return DB.initialize({ activeUsers })
      })

      describe('when no filter is aplied', () => {
        beforeEach(() => (response = request.getReports(ADMIN_TOKEN, { })));

        it('should return the rigth report', () => response
          .then((res) => {
            delete res.body.activeUsers.table;
            const expectedReports = {
              activeUsers: {
                labels: ['2016/11', '2016/12', '2017/1', '2017/2', '2017/3'],
                data: [
                  { data: [1, 4, 5, 3, 10], label: 'Usuarios Totales'},
                  { data: [1, 3, 1, 3, 5], label: 'Usuarios Premium'}
                ]
              },
              denounces: {
                labels: ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'],
                data: [0, 0, 0, 0],
                blockeds: [0, 0, 0, 0],
                table: []
              }
            }

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expectedReports);
          }));
      });

      describe('when filter by startDate', () => {
        beforeEach(() => (response = request.getReports(ADMIN_TOKEN, { startDate: '2017-01-02' })));

        it('should return the rigth report', () => response
          .then((res) => {
            delete res.body.activeUsers.table;
            const expectedReports = {
              activeUsers: {
                labels: ['2017/1', '2017/2', '2017/3'],
                data: [
                  { data: [5, 3, 10], label: 'Usuarios Totales'},
                  { data: [1, 3, 5], label: 'Usuarios Premium'}
                ]
              },
              denounces: {
                labels: ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'],
                data: [0, 0, 0, 0],
                blockeds: [0, 0, 0, 0],
                table: []
              }
            }

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expectedReports);
          }));
      });

      describe('when filter by endDate', () => {
        beforeEach(() => (response = request.getReports(ADMIN_TOKEN, { endDate: '2017-03-01' })));

        it('should return the rigth report', () => response
          .then((res) => {
            delete res.body.activeUsers.table;
            const expectedReports = {
              activeUsers: {
                labels: ['2016/11', '2016/12', '2017/1', '2017/2'],
                data: [
                  { data: [1, 4, 5, 3], label: 'Usuarios Totales'},
                  { data: [1, 3, 1, 3], label: 'Usuarios Premium'}
                ]
              },
              denounces: {
                labels: ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'],
                data: [0, 0, 0, 0],
                blockeds: [0, 0, 0, 0],
                table: []
              }
            }

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expectedReports);
          }));
      });

      describe('when filter by both', () => {
        beforeEach(() => (response = request.getReports(ADMIN_TOKEN, { startDate: '2017-01-02', endDate: '2017-03-01' })));

        it('should return the rigth report', () => response
          .then((res) => {
            delete res.body.activeUsers.table;
            const expectedReports = {
              activeUsers: {
                labels: ['2017/1', '2017/2'],
                data: [
                  { data: [5, 3], label: 'Usuarios Totales'},
                  { data: [1, 3], label: 'Usuarios Premium'}
                ]
              },
              denounces: {
                labels: ['Comportamiento abusivo', 'Mensaje inapropiado', 'Otro', 'Spam'],
                data: [0, 0, 0, 0],
                blockeds: [0, 0, 0, 0],
                table: []
              }
            }

            assert.equal(res.status, 200);
            assert.deepEqual(res.body, expectedReports);
          }));
      });
    })
  });
});


const makeDenounce = (sendUID, sendUName, recUID, recUName, message, status = 'pendiente', type, date) => {
  return {
    sendUID,
    sendUName,
    recUID,
    recUName,
    message,
    status,
    type,
    date
  }
}

const makeActiveUser = (id, name, month, year, accountType) => {
  return {
    id,
    name,
    month,
    year,
    accountType
  }
}
