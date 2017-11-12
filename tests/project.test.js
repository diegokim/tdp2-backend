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
      const expectedResponse = {
        maxPhotosToLogin: {
          prettyName: 'Fotos maximas para mostrar en login',
          name: 'maxPhotosToLogin',
          value: 7
        },
        linksForPremiumAccount: {
          prettyName: 'Links para cuenta Premium',
          name: 'linksForPremiumAccount',
          value: 5
        },
        maxInterestsToLogin: {
          prettyName: 'Intereses maximos para mostrar en login',
          name: 'maxInterestsToLogin',
          value: 5
        },
        maxCandidatesToShow: {
          prettyName: 'Candidatos maximos para mostrar',
          name: 'maxCandidatesToShow',
          value: 5
        },
        linksForFreeAccount: {
          prettyName: 'Links para cuenta Free',
          name: 'linksForFreeAccount',
          value: 1
        }
      }

      beforeEach(() => (response = request.getConfigs(ADMIN_TOKEN)));

      it('should return the settings', () => response
        .then((res) => {
          const formatResponse = formatDBResponse(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(formatResponse, expectedResponse);
        }));
    });
  });

  describe('Update Settings', () => {
    describe('When the user is admin', () => {
      const updateValue = 10;
      const expectedResponse = {
        maxPhotosToLogin: {
          prettyName: 'Fotos maximas para mostrar en login',
          name: 'maxPhotosToLogin',
          value: 7
        },
        linksForPremiumAccount: {
          prettyName: 'Links para cuenta Premium',
          name: 'linksForPremiumAccount',
          value: 5
        },
        maxInterestsToLogin: {
          prettyName: 'Intereses maximos para mostrar en login',
          name: 'maxInterestsToLogin',
          value: 5
        },
        maxCandidatesToShow: {
          prettyName: 'Candidatos maximos para mostrar',
          name: 'maxCandidatesToShow',
          value: 5
        },
        linksForFreeAccount: {
          prettyName: 'Links para cuenta Free',
          name: 'linksForFreeAccount',
          value: updateValue
        }
      }

      beforeEach(() => request.updateConfig(ADMIN_TOKEN, 'linksForFreeAccount', { value: updateValue })
        .then(() => (response = request.getConfigs(ADMIN_TOKEN)))
      );

      it('should return the settings', () => response
        .then((res) => {
          const formatResponse = formatDBResponse(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(formatResponse, expectedResponse);
        }));
    });
  });

  describe('Create Advertising', () => {
    describe('when send an invalid token', () => {
      beforeEach(() => (
        response = request.createProjectAdvertising(accessToken, { image: 'image', link: 'link', name: 'name', startDate: '2017-10-10', endDate: '2017-10-10' }))
      );

      it('should return 401', () => response
        .then((res) => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.message, 'Invalid Token');
          assert.equal(res.message, 'Unauthorized');
        }));
    });

    describe('When create the advertising', () => {
      beforeEach(() => (response = request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image', link: 'link', name: 'name', startDate: '2017-10-10', endDate: '2017-10-10' })));

      it('should return the created advertising', () => response
        .then((res) => {
          formatDBResponse(res.body);

          assert.equal(res.status, 200);
          assert.equal(res.body.image, 'image');
          assert.equal(res.body.link, 'link');
          assert.equal(res.body.name, 'name');
          assert.equal(res.body.startDate, '2017-10-10');
          assert.equal(res.body.endDate, '2017-10-10');
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
      beforeEach(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image', name: 'name', startDate: '2017-10-10', endDate: '2017-10-10' })
        .then(() => (response = request.getProjectAdvertising(ADMIN_TOKEN)))
      );

      it('should return the advertising list', () => response
        .then((res) => {
          formatDBResponseWithId(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, [{ image: 'image', link: '', name: 'name', startDate: '2017-10-10', endDate: '2017-10-10' }]);
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
      beforeEach(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image', name: 'name', startDate: '2017-10-10', endDate: '2017-10-10' })
        .then((res) => (response = request.deleteProjectAdvertising(ADMIN_TOKEN, res.body.id)))
      );

      it('should return 204', () => response
        .then((res) => {
          assert.equal(res.status, 204);
        }));
    });

    describe('When delete the advertising', () => {
      beforeEach(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image', name: 'name', startDate: '2017-10-10', endDate: '2017-10-10' })
        .then(() => request.createProjectAdvertising(ADMIN_TOKEN, { image: 'image-to-delete', name: 'name', startDate: '2017-10-10', endDate: '2017-10-10' }))
        .then((res) => request.deleteProjectAdvertising(ADMIN_TOKEN, res.body.id))
        .then(() => (response = request.getProjectAdvertising(ADMIN_TOKEN)))
      );

      it('should not return the deleted advertising', () => response
        .then((res) => {
          formatDBResponseWithId(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, [{ image: 'image', link: '', name: 'name', startDate: '2017-10-10', endDate: '2017-10-10' }]);
        }));
    });
  });

  describe('Create hidden Word', () => {
    describe('when send an invalid token', () => {
      beforeEach(() => (
        response = request.createProjectHiddenWord(accessToken, { word: 'tonto' }))
      );

      it('should return 401', () => response
        .then((res) => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.message, 'Invalid Token');
          assert.equal(res.message, 'Unauthorized');
        }));
    });

    describe('When create the word', () => {
      beforeEach(() => (response = request.createProjectHiddenWord(ADMIN_TOKEN, { word: 'tonto' })));

      it('should return the created hidden word', () => response
        .then((res) => {
          formatDBResponse(res.body);

          assert.equal(res.status, 200);
          assert.equal(res.body.word, 'tonto');
          assert.property(res.body, 'id');
        }));
    });
  });

  describe('List hidden Word', () => {
    describe('when send an invalid token', () => {
      beforeEach(() => (
        response = request.getProjectHiddenWords(accessToken))
      );

      it('should return 401', () => response
        .then((res) => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.message, 'Invalid Token');
          assert.equal(res.message, 'Unauthorized');
        }));
    });

    describe('When get the hidden words', () => {
      beforeEach(() => request.createProjectHiddenWord(ADMIN_TOKEN, { word: 'tarado' })
        .then(() => (response = request.getProjectHiddenWords(ADMIN_TOKEN)))
      );

      it('should return the hidden words list', () => response
        .then((res) => {
          formatDBResponseWithId(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, [{ word: 'tarado' }]);
        }));
    });
  });

  describe('Delete hidden word', () => {
    describe('when send an invalid token', () => {
      beforeEach(() => (
        response = request.deleteProjectHiddenWord(accessToken))
      );

      it('should return 401', () => response
        .then((res) => {
          assert.equal(res.status, 401);
          assert.equal(res.response.body.message, 'Invalid Token');
          assert.equal(res.message, 'Unauthorized');
        }));
    });

    describe('When delete the advertising', () => {
      beforeEach(() => request.createProjectHiddenWord(ADMIN_TOKEN, { word: 'tonto' })
        .then((res) => (response = request.deleteProjectHiddenWord(ADMIN_TOKEN, res.body.id)))
      );

      it('should return 204', () => response
        .then((res) => {
          assert.equal(res.status, 204);
        }));
    });

    describe('When delete the hidden word', () => {
      beforeEach(() => request.createProjectHiddenWord(ADMIN_TOKEN, { word: 'tonto' })
        .then(() => request.createProjectHiddenWord(ADMIN_TOKEN, { word: 'tonto-to-delete' }))
        .then((res) => request.deleteProjectHiddenWord(ADMIN_TOKEN, res.body.id))
        .then(() => (response = request.getProjectHiddenWords(ADMIN_TOKEN)))
      );

      it('should not return the deleted word', () => response
        .then((res) => {
          formatDBResponseWithId(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, [{ word: 'tonto' }]);
        }));
    });
  });

  describe('Edit hidden word', () => {
    describe('When edit a word', () => {
      beforeEach(() => request.createProjectHiddenWord(ADMIN_TOKEN, { word: 'tonto' })
        .then((res) => (response = request.editProjectHiddenWord(ADMIN_TOKEN, res.body.id, { word: 'tarado' })))
        .then(() => (response = request.getProjectHiddenWords(ADMIN_TOKEN)))
      );

      it('should return the updated word', () => response
        .then((res) => {
          formatDBResponseWithId(res.body);

          assert.equal(res.status, 200);
          assert.deepEqual(res.body, [{ word: 'tarado' }]);
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
