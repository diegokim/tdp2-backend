/* eslint no-undef:off */
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')
const DB = require('../database/database');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';

const profileParams = ['id', 'name', 'photos', 'birthday', 'education', 'work', 'gender', 'interested_in', 'favorite_teams', 'books%7Bname%7D', 'movies%7Bgenre%7D', 'music%7Bname%7D'];

describe('Integration auth tests', () => {

  // Leave the database in a valid state
  beforeEach(() => DB.drop());

  describe('Login', () => {
    let profile;
    let response;

    describe('When the user has not profile photos', () => {
      beforeEach(() => {
        profile = {
          birthday: '08/13/1993',
          photos: { data: [] }
        }
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(profileParams, accessToken, profile)
      })
      beforeEach(() => (response = request.login('access_token')));

      it('should return bad request', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body.message, 'El usuario no posee fotos');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When the user is not older than 18', () => {
      beforeEach(() => {
        profile = {
          birthday: '08/13/2016',
          photos: { data: [{ profile: '' }] }
        }
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(profileParams, accessToken, profile)
      })
      beforeEach(() => (response = request.login('access_token')));

      it('should return bad request', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body.message, 'El usuario no es mayor de edad');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When the user has not an one year older account', () => {
      beforeEach(() => {
        profile = {
          birthday: '08/13/1990',
          photos: { data: [{ profile: '' }] }
        }
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(profileParams, accessToken, profile)
        nockGetPosts(accessToken, { data: [] })
      })
      beforeEach(() => (response = request.login('access_token')));

      it('should return bad request', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body.message, 'El usuario no tiene mas de un año de actividad');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When the user does not send access_token', () => {
      beforeEach(() => (response = request.login('')));

      it('should return bad request', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body.message, 'Missing Auth token');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When the user has a valid profile and is the first login', () => {
      let photo;

      describe('and has a poor profile', () => {
        beforeEach(() => {
          profile = {
            id: '22',
            birthday: '08/13/1993',
            photos: { data: [
              { id: 'id1' },
              { id: 'id2' },
              { id: 'id3' }
            ]}
          }
          photo = { picture: 'test-url' }

          nockProfile(profileParams, accessToken, profile)
          nockProfile(['id'], accessToken, { id: 'id' })
          nockGetPhoto(['id1', 'id2', 'id3'], accessToken, photo)
          nockGetPosts(accessToken, { data: [{ id: 'data-id' }] })
          nockGetProfilePhotos(accessToken)
        })
        beforeEach(() => (response = request.login('access_token')));

        it('should return images', () => response
          .then((res) => {
            assert.equal(res.status, 201);
            assert.deepEqual(res.body, { photos: ['link', 'link', 'link'] });
          }));
      })

      describe('and has a complete profile', () => {
        beforeEach(() => {
          photo = { picture: 'test-url' }

          nockProfile(profileParams, accessToken, completeProfile)
          nockProfile(['id'], accessToken, { id: 'id' })
          nockGetPhoto(['id1', 'id2', 'id3'], accessToken, photo)
          nockGetPosts(accessToken, { data: [{ id: 'data-id' }] })
          nockGetProfilePhotos(accessToken)
        })
        beforeEach(() => (response = request.login('access_token')));

        it('should return images', () => response
          .then((res) => {
            assert.equal(res.status, 201);
            assert.deepEqual(res.body, { photos: ['link', 'link', 'link'] });
          }));
      })

      describe('and has a complete profile without interests', () => {
        let profileWithoutInterests;
        beforeEach(() => {
          photo = { picture: 'test-url' }
          profileWithoutInterests = Object.assign({}, completeProfile);
          profileWithoutInterests.interested_in = []; // eslint-disable-line

          nockProfile(profileParams, accessToken, profileWithoutInterests)
          nockProfile(['id'], accessToken, { id: 'id' })
          nockGetPhoto(['id1', 'id2', 'id3'], accessToken, photo)
          nockGetPosts(accessToken, { data: [{ id: 'data-id' }] })
          nockGetProfilePhotos(accessToken)
          nockProfile(['id'], accessToken, { id: 'id' })
        })
        beforeEach(() => {
          return (response = request.login('access_token')
            .then(() => request.getProfile(accessToken)))
        });

        it('should set interests based on movies, books, music and sports', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.equal(res.body.interests.length, 5);
            assert.includeDeepMembers(interestsBasedOnLikes, res.body.interests);
          }));
      })
    });

    describe('When the user is already logged but does not have profile photo', () => {
      let photo;
      beforeEach(() => {
        photo = { picture: 'test-url' }

        nockProfile(profileParams, accessToken, completeProfile)
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['photos'], accessToken, { photos: { data: [{ id: 'id1' }] } })
        nockGetPhoto(['id1'], accessToken, photo)
        nockGetPhoto(['id1', 'id2', 'id3'], accessToken, photo)
        nockGetPosts(accessToken, { data: [{ id: 'data-id' }] })
        nockGetProfilePhotos(accessToken)
        nockGetProfilePhotos(accessToken)
      })
      beforeEach(() => (
        response = request.login(accessToken)
          .then(() => request.login(accessToken))
      ));

      it('should return the photos', () => response
        .then((res) => {
          assert.equal(res.status, 201);
          assert.deepEqual(res.body, { photos: ['link'] });
        }));
    })

    describe('When the user is already logged', () => {
      let expectedProfile;
      beforeEach(() => {
        photo = { picture: 'link' }
        expectedProfile = {
          age: 24,
          description: '',
          education: 'High School',
          gender: 'male',
          id: 'id',
          interests: [
            'racing',
            'fiuba'
          ],
          photos: [
            'esta foto'
          ],
          name: 'name',
          photo: 'esta foto',
          work:  'work description',
          location: [-58.368323, -34.617528]
        }

        nockProfile(profileParams, accessToken, completeProfile)
        nockGetPhoto(['id1', 'id2', 'id3'], accessToken, photo)
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id' })
        nockProfile(['id'], accessToken, { id: 'id' })
        nockGetPosts(accessToken, { data: [{ id: 'data-id' }] })
      })
      beforeEach(() => {
        response = request.login('access_token')
          .then(() => request.updateProfile('access_token', { photo: 'esta foto', photos: ['esta foto'] }))
          .then(() => request.login('access_token'))
      });

      it('should return complete profile', () => response
        .then((res) => {
          formatDBResponse(res.body.profile)
          formatDBResponse(res.body.settings)

          assert.equal(res.status, 200);
          assert.deepEqual(res.body.profile, expectedProfile);
          assert.deepEqual(res.body.settings, defaultSettings);
        }));
    });
  });
});

const formatDBResponse = (dbResponse) => {
  const result = dbResponse;
  delete result.__v;
  delete result._id;

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

const nockGetPhoto = (ids, accessToken, response) => {
  for (const id of ids) {
    nock('https://graph.facebook.com')
    .get(`/v2.3/${id}?fields=picture&access_token=${accessToken}`)
    .reply(200, response);
  }
}

const nockGetPosts = (accessToken, response) => {
  nock('https://graph.facebook.com')
    .filteringPath(() => '/v2.3/me/posts')
    .get('/v2.3/me/posts')
    .reply(200, response);
}

const nockGetProfilePhotos = (accessToken, response = { data: [] }) => {
  nock('https://graph.facebook.com')
    .get(`/v2.3/me/albums?fields=type&access_token=${accessToken}`)
    .reply(200, response);
}

const defaultSettings = {
  id: 'id',
  ageRange: {
    min: 18,
    max: 150
  },
  distRange: {
    min: 1,
    max: 30
  },
  invisible: false,
  interestType: 'both',
  accountType: 'free',
  superLinksCount: 1
}

const completeProfile = {
  id: 'id',
  name: 'name',
  photos: { data: [
    { id: 'id1' },
    { id: 'id2' },
    { id: 'id3' }
  ]},
  education: [
    {
      school: {
        id: '488580091152195',
        name: 'Kennedy High School'
      },
      type: 'High School',
      id: '158518517536156'
    }
  ],
  birthday: '08/13/1993',
  'favorite_teams': [
    {
      id: '427568640688959',
      name: 'El Primer Grande'
    },
    {
      id: '104050636299322',
      name: 'Racing Club de Avellaneda'
    }
  ],
  gender: 'male',
  books: {
    data: [
      {
        name: 'Harry Potter',
        id: '107641979264998'
      }
    ]
  },
  movies: {
    data: [
      {
        name: 'Captain Jack Sparrow',
        id: '56368119740'
      }
    ]
  },
  music: {
    data: [
      {
        name: 'ExtraNatural',
        id: '116683489703'
      },
      {
        name: 'John Lennon',
        id: '135388936479828'
      },
      {
        name: 'Gustavo Adrián Cerati',
        id: '79516296654'
      },
      {
        name: 'Pink Floyd',
        id: '5660597307'
      }
    ]
  },
  'interested_in': [
    'racing',
    'fiuba'
  ],
  work: {
    description: 'work description'
  }
}

const interestsBasedOnLikes = [
  'El Primer Grande',
  'Racing Club de Avellaneda',
  'Harry Potter',
  'Captain Jack Sparrow',
  'ExtraNatural',
  'John Lennon',
  'Gustavo Adrián Cerati',
  'Pink Floyd'
]
