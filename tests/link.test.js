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
          assert.equal(resultSet[0].distance, 7)
          assert.equal(resultSet[1].distance, 7)
        }));
    });

    describe('when the user has been blocked before', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id2' })
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ users: profiles.concat([userProfile]), settings: settings.concat([userSetting]) })
      })
      beforeEach(() => {
        return request.actionUser('access_token', 'id', { action: 'block' })
          .then(() => (response = request.getCandidates('access_token')))
      });

      it('should not return this user as candidate', () => response
        .then((res) => {
          const resultSet = res.body.profiles;

          assert.equal(res.status, 200);
          assert.equal('id4', resultSet[0].id);
          assert.equal(resultSet.length, 1)
        }));
    });

    describe('when the user has been reported before', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id2' })
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ users: profiles.concat([userProfile]), settings: settings.concat([userSetting]) })
      })
      beforeEach(() => {
        return request.actionUser('access_token', 'id', { action: 'report', message: 'malo malo' })
          .then(() => (response = request.getCandidates('access_token')))
      });

      it('should not return this user as candidate', () => response
        .then((res) => {
          const resultSet = res.body.profiles;

          assert.equal(res.status, 200);
          assert.equal('id4', resultSet[0].id);
          assert.equal(resultSet.length, 1)
        }));
    });

    describe('When the user has candidates but they have linked actions', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ users: profiles.concat([userProfile]), settings: settings.concat([userSetting]) })
      })
      beforeEach(() => {
        return request.actionUser('access_token', 'id2', { action: 'link' })
          .then(() => request.actionUser('access_token', 'id4', { action: 'reject' }))
          .then(() => (response = request.getCandidates('access_token')))
      });

      it('should return the apropiated candidates', () => response
        .then((res) => {
          const resultSet = res.body.profiles;

          assert.equal(res.status, 200);
          assert.deepEqual(resultSet, []);
        }));
    });
  });

  describe('Link User', () => {
    describe('When the user does not exist', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
      })
      beforeEach(() => (response = request.actionUser('access_token', 'id2', { action: 'link' })));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.response.body.message, 'user does not exist');
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When dont send action', () => {
      beforeEach(() => (response = request.actionUser('access_token', 'id2', {})));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body.message, 'missing action');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When dont send userId', () => {
      beforeEach(() => (response = request.actionUser('access_token', '', { action: 'link' })));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When both users exist', () => {
      describe('when a link does occur', () => {
        beforeEach(() => {
          nockProfile(['id'], accessToken, { id: 'id' })
          nockProfile(['id'], accessToken, { id: 'id2' })
          return DB.initialize({ users: [userProfile, anotherUserProfile], settings: settings.concat([userSetting]) })
        })
        beforeEach(() => {
          return request.actionUser('access_token', 'id2', { action: 'link' })
            .then(() => (response = request.actionUser('access_token', 'id', { action: 'link' })))
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
          return DB.initialize({ users: [userProfile, anotherUserProfile], settings: settings.concat([userSetting]) })
        })
        beforeEach(() => (response = request.actionUser('access_token', 'id2', { action: 'link' })));

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
          return DB.initialize({ users: [userProfile, anotherUserProfile], settings: settings.concat([userSetting]) })
        })
        beforeEach(() => {
          return request.actionUser('access_token', 'id2', { action: 'link' })
            .then(() => request.actionUser('access_token', 'id', { action: 'link' }))
            .then(() => (response = request.getLinks('access_token')))
        });

        it('should return the links', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body.profiles[0].id, 'id2');
            assert.deepEqual(res.body.profiles[0].type, 'male');
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
          return DB.initialize({ users: [userProfile, anotherUserProfile, anotherAnotherUserProfile], settings: settings.concat([userSetting]) })
        })
        beforeEach(() => {
          return request.actionUser('access_token', 'id2', { action: 'link' })
            .then(() => request.actionUser('access_token', 'id', { action: 'link' }))
            .then(() => request.actionUser('access_token', 'id3', { action: 'link' }))
            .then(() => request.actionUser('access_token', 'id', { action: 'link' }))
            .then(() => (response = request.getLinks('access_token')))
        });

        it('should return the links', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.include(['id2', 'id3'], res.body.profiles[0].id);
            assert.include(['id2', 'id3'], res.body.profiles[1].id);
            assert.include(['foto2', 'foto3'], res.body.profiles[0].photo);
            assert.include(['foto2', 'foto3'], res.body.profiles[1].photo);
            assert.include(['male', 'female'], res.body.profiles[0].type);
            assert.include(['male', 'female'], res.body.profiles[1].type);
          }));
      })
    });
  });

  describe('Block User', () => {
    describe('When both users exist', () => {
      describe('and a link exists', () => {
        beforeEach(() => {
          nockProfile(['id'], accessToken, { id: 'id' })
          nockProfile(['id'], accessToken, { id: 'id2' })
          nockProfile(['id'], accessToken, { id: 'id' })
          nockProfile(['id'], accessToken, { id: 'id' })
          return DB.initialize({ users: [userProfile, anotherUserProfile] })
        })
        beforeEach(() => {
          return request.actionUser('access_token', 'id2', { action: 'link' })
            .then(() => request.actionUser('access_token', 'id', { action: 'link' }))
            .then(() => request.actionUser('access_token', 'id2', { action: 'block' }))
            .then(() => (response = request.getLinks('access_token')));
        });

        it('should return empty links', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { profiles: [] });
          }));
      })

      describe('when the block does occur', () => {
        beforeEach(() => {
          nockProfile(['id'], accessToken, { id: 'id' })
          return DB.initialize({ users: [userProfile, anotherUserProfile] })
        })
        beforeEach(() => {
          return (response = request.actionUser('access_token', 'id2', { action: 'block' }))
        });

        it('should return an empty response', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {});
          }));
      })
    });
  });

  describe('Report User', () => {
    describe('When both users exist', () => {
      describe('and a link exists', () => {
        beforeEach(() => {
          nockProfile(['id'], accessToken, { id: 'id' })
          nockProfile(['id'], accessToken, { id: 'id2' })
          nockProfile(['id'], accessToken, { id: 'id' })
          nockProfile(['id'], accessToken, { id: 'id' })
          return DB.initialize({ users: [userProfile, anotherUserProfile] })
        })
        beforeEach(() => {
          return request.actionUser('access_token', 'id2', { action: 'link' })
            .then(() => request.actionUser('access_token', 'id', { action: 'link' }))
            .then(() => request.actionUser('access_token', 'id2', { action: 'report', message: 'malo malo' }))
            .then(() => (response = request.getLinks('access_token')));
        });

        it('should return empty links', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { profiles: [] });
          }));
      })

      describe('when the report does occur', () => {
        beforeEach(() => {
          nockProfile(['id'], accessToken, { id: 'id' })
          return DB.initialize({ users: [userProfile, anotherUserProfile] })
        })
        beforeEach(() => {
          return (response = request.actionUser('access_token', 'id2', { action: 'report', message: 'malo malo' }))
        });

        it('should return an empty response', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {});
          }));
      })
    });
  });

  describe('Delete Link', () => {
    describe('When dont send userId', () => {
      beforeEach(() => (response = request.actionUser('access_token', '', { action: 'link' })));

      it('should return not found', () => response
        .then((res) => {
          assert.equal(res.status, 404);
          assert.equal(res.message, 'Not Found');
        }));
    });

    describe('When can delete the user well', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id2' })
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ users: [userProfile, anotherUserProfile] })
      })
      beforeEach(() => {
        return request.actionUser('access_token', 'id2', { action: 'link' })
          .then(() => request.actionUser('access_token', 'id', { action: 'link' }))
          .then(() => (response = request.deleteLink('access_token', 'id2')))
      });

      it('should have delete the link', () => response
        .then((res) => {
          assert.equal(res.status, 204);
          assert.deepEqual(res.body, {});
        }));
    });

    describe('When try to get the link after delete', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id2' })
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ users: [userProfile, anotherUserProfile] })
      })
      beforeEach(() => {
        return request.actionUser('access_token', 'id2', { action: 'link' })
          .then(() => request.actionUser('access_token', 'id', { action: 'link' }))
          .then(() => request.deleteLink('access_token', 'id2'))
          .then(() => (response = request.getLinks('access_token')))
      });

      it('should have delete the link', () => response
        .then((res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { profiles: [] });
        }));
    });

    describe('When the user does not exist', () => {
      beforeEach(() => {
        nockProfile(['id'], accessToken, { id: 'id' })
        return DB.initialize({ users: [userProfile, anotherUserProfile] })
      })
      beforeEach(() => {
        return (response = request.deleteLink('access_token', 'id2'))
      });

      it('should have return 204', () => response
        .then((res) => {
          assert.equal(res.status, 204);
          assert.deepEqual(res.body, {});
        }));
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
