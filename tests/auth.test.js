/* eslint no-undef:off */
const assert = require('chai').assert;
const nock = require('nock');
const request = require('./requests.js')
const DB = require('../database/database');

// Start the app
const server = require('../app.js'); // eslint-disable-line
const accessToken = 'access_token';

const profileParams = ['id', 'name', 'photos', 'birthday', 'education', 'work', 'gender', 'interested_in'];

describe('Integration auth tests', () => {

  // Leave the database in a valid state
  beforeEach((done) => {
    DB.drop()
		.then(done)
		.catch(done);
  });

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
          assert.equal(res.response.body, 'El usuario no posee fotos');
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
          assert.equal(res.response.body, 'El usuario no es mayor de edad');
          assert.equal(res.message, 'Bad Request');
        }));
    });

    describe('When the user does not send access_token', () => {
      beforeEach(() => (response = request.login('')));

      it('should return bad request', () => response
        .then((res) => {
          assert.equal(res.status, 400);
          assert.equal(res.response.body, 'Missing Auth token');
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
          photo = { picture: 'link' }

          nockProfile(profileParams, accessToken, profile)
          nockProfile(['id'], accessToken, { id: 'id' })
          nockGetPhoto(['id1', 'id2', 'id3'], accessToken, photo)
        })
        beforeEach(() => (response = request.login('access_token')));

        it('should return bad request', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { fotos: ['link', 'link', 'link'] });
          }));
      })

      describe('and has a complete profile', () => {
        beforeEach(() => {
          photo = { picture: 'link' }

          nockProfile(profileParams, accessToken, completeProfile)
          nockProfile(['id'], accessToken, { id: 'id' })
          nockGetPhoto(['id1', 'id2', 'id3'], accessToken, photo)
        })
        beforeEach(() => (response = request.login('access_token')));

        it('should return bad request', () => response
          .then((res) => {
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, { fotos: ['link', 'link', 'link'] });
          }));
      })
    });

    describe('When the user has already logged but does not have profile photo', () => {
      let photo;
      beforeEach(() => {
        photo = { picture: 'link' }

        nockProfile(profileParams, accessToken, completeProfile)
        nockProfile(['id'], accessToken, { id: '1411063048948357' })
        nockProfile(['id'], accessToken, { id: '1411063048948357' })
        nockProfile(['photos'], accessToken, { photos: { data: [{ id: 'id1' }] } })
        nockGetPhoto(['id1'], accessToken, photo)
        nockGetPhoto(['id1', 'id2', 'id3'], accessToken, photo)
      })
      beforeEach(() => (
        response = request.login('access_token')
          .then(() => request.login('access_token'))
      ));

      it('should return bad request', () => response
        .then((res) => {
          assert.equal(res.status, 200);
          assert.deepEqual(res.body, { fotos: ['link'] });
        }));
    })

    // describe('When the user has already logged', () => {
    //   beforeEach(() => {
    //   })
    //   beforeEach(() => (response = request.login('access_token')));

    //   it('should return bad request', () => response
    //     .then((res) => {
    //       assert.equal(res.status, 200);
    //       assert.equal(res.body, userProfile);
    //     }));
    // });
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

const nockGetPhoto = (ids, accessToken, response) => {
  for (const id of ids) {
    nock('https://graph.facebook.com')
    .get(`/v2.3/${id}?fields=picture&access_token=${accessToken}`)
    .reply(200, response);
  }
}

const completeProfile = {
  id: '1411063048948357',
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
        genre: 'Rock',
        id: '116683489703'
      },
      {
        name: 'John Lennon',
        genre: 'Rock',
        id: '135388936479828'
      },
      {
        name: 'Gustavo Adrián Cerati',
        id: '79516296654'
      },
      {
        name: 'Pink Floyd',
        genre: 'Rock',
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
