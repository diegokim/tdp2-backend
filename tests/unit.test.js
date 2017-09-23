/* eslint no-undef:off */
const assert = require('chai').assert;
const DB = require('../database/database');
const UserDB = require('../database/usersDB');
const SettingDB = require('../database/settingDB');

// Start the app
const server = require('../app.js'); // eslint-disable-line

describe('Search unit tests', () => {
  let response;

  // Leave the database in a valid state
  beforeEach(() => DB.drop());

  describe('Search settings', () => {
    let searchParams;

    describe('when female and search by X', () => {
      beforeEach(() => {
        searchParams = {
          interestType: 'X',
          gender: 'female'
        }
        return DB.initialize({ settings })
      })
      beforeEach(() => (response = SettingDB.search(searchParams)));

      it('should return the profile', () => response
        .then((res) => {
          assert.include(['id2', 'id3'], res[0].id);
          assert.include(['id2', 'id3'], res[1].id);
          assert.equal(res.length, 2)
        }));
    });

    describe('when male and search by X', () => {
      beforeEach(() => {
        searchParams = {
          interestType: 'X',
          gender: 'male'
        }
        return DB.initialize({ settings })
      })
      beforeEach(() => (response = SettingDB.search(searchParams)));

      it('should return the profile', () => response
        .then((res) => {
          assert.include(['id1', 'id3'], res[0].id);
          assert.include(['id1', 'id3'], res[1].id);
          assert.equal(res.length, 2)
        }));
    });

    describe('when search by friends', () => {
      beforeEach(() => {
        searchParams = {
          interestType: 'friends',
          gender: 'male'
        }
        return DB.initialize({ settings })
      })
      beforeEach(() => (response = SettingDB.search(searchParams)));

      it('should return the profile', () => response
        .then((res) => {
          assert.equal(res[0].id, 'id4');
          assert.equal(res.length, 1)
        }));
    });
  });

  describe('Search profiles', () => {
    let searchParams;

    describe('when search by female', () => {
      beforeEach(() => {
        searchParams = {
          interestType: 'male',
          ageRange: {
            min: 18,
            max: 200
          },
          location: [-58.380661, -34.627982], // constitucion
          distRange: {
            min: 0,
            max: 10
          }
        }
        return DB.initialize({ users: profiles })
      })
      beforeEach(() => (response = UserDB.search(searchParams)));

      it('should return the profile', () => response
        .then((res) => {
          assert.include(['id1', 'id2'], res[0].id);
          assert.include(['id1', 'id2'], res[1].id);
          assert.equal(res.length, 2)
        }));
    });

    describe('when search by male', () => {
      beforeEach(() => {
        searchParams = {
          interestType: 'female',
          ageRange: {
            min: 18,
            max: 200
          },
          location: [-58.380661, -34.627982], // constitucion
          distRange: {
            min: 0,
            max: 10
          }
        }
        return DB.initialize({ users: profiles })
      })
      beforeEach(() => (response = UserDB.search(searchParams)));

      it('should return the profile', () => response
        .then((res) => {
          assert.include(['id3', 'id4'], res[0].id);
          assert.include(['id3', 'id4'], res[1].id);
          assert.equal(res.length, 2)
        }));
    });

    describe('when search by both', () => {
      beforeEach(() => {
        searchParams = {
          interestType: 'both',
          ageRange: {
            min: 18,
            max: 200
          },
          location: [-58.380661, -34.627982], // constitucion
          distRange: {
            min: 0,
            max: 10
          }
        }
        return DB.initialize({ users: profiles })
      })
      beforeEach(() => (response = UserDB.search(searchParams)));

      it('should return the profile', () => response
        .then((res) => {
          assert.include(['id1', 'id2', 'id3', 'id4'], res[0].id);
          assert.include(['id1', 'id2', 'id3', 'id4'], res[1].id);
          assert.include(['id1', 'id2', 'id3', 'id4'], res[2].id);
          assert.include(['id1', 'id2', 'id3', 'id4'], res[3].id);
          assert.equal(res.length, 4)
        }));
    });

    describe('when search by age', () => {
      beforeEach(() => {
        searchParams = {
          interestType: 'both',
          ageRange: {
            min: 18,
            max: 24
          },
          location: [-58.380661, -34.627982], // constitucion
          distRange: {
            min: 0,
            max: 10
          }
        }
        return DB.initialize({ users: profiles })
      })
      beforeEach(() => (response = UserDB.search(searchParams)));

      it('should return the profile', () => response
        .then((res) => {
          assert.equal(res[0].id, 'id1');
          assert.equal(res.length, 1)
        }));
    });

    describe('when search by distance', () => {
      describe('and is between min-max', () => {
        beforeEach(() => {
          searchParams = {
            interestType: 'both',
            ageRange: {
              min: 18,
              max: 50
            },
            location: [-58.362036, -34.672959], // el tano
            distRange: {
              min: 0,
              max: 5
            }
          }
          return DB.initialize({ users: profiles })
        })
        beforeEach(() => (response = UserDB.search(searchParams)));

        it('should return only racing fans', () => response
          .then((res) => {
            assert.include(['id3', 'id4'], res[0].id);
            assert.include(['id3', 'id4'], res[1].id);
            assert.equal(res.length, 2)
          }));
      });

      describe('and is more than min', () => {
        beforeEach(() => {
          searchParams = {
            interestType: 'both',
            ageRange: {
              min: 18,
              max: 50
            },
            location: [-58.362036, -34.672959], // el tano
            distRange: {
              min: 2,
              max: 5
            }
          }
          return DB.initialize({ users: profiles })
        })
        beforeEach(() => (response = UserDB.search(searchParams)));

        it('should not return searched people', () => response
          .then((res) => {
            assert.deepEqual(res, []);
            assert.equal(res.length, 0)
          }));
      });

      describe('and is less than max', () => {
        beforeEach(() => {
          searchParams = {
            interestType: 'both',
            ageRange: {
              min: 18,
              max: 50
            },
            location: [-58.362036, -34.672959], // el tano
            distRange: {
              min: 0,
              max: 0
            }
          }
          return DB.initialize({ users: profiles })
        })
        beforeEach(() => (response = UserDB.search(searchParams)));

        it('should not return searched people', () => response
          .then((res) => {
            assert.deepEqual(res, []);
            assert.equal(res.length, 0)
          }));
      });
    });

    describe('when no match is found', () => {
      beforeEach(() => {
        searchParams = {
          interestType: 'female',
          ageRange: {
            min: 18,
            max: 24
          },
          location: [-58.380661, -34.627982], // constitucion
          distRange: {
            min: 0,
            max: 10
          }
        }
        return DB.initialize({ users: profiles })
      })
      beforeEach(() => (response = UserDB.search(searchParams)));

      it('should return the profile', () => response
        .then((res) => {
          assert.deepEqual(res, []);
        }));
    });
  });
});

const settings = [
  {
    id: 'id1',
    invisible: false,
    interestType: 'male'
  },
  {
    id: 'id2',
    invisible: false,
    interestType: 'female'
  },
  {
    id: 'id3',
    invisible: false,
    interestType: 'both'
  },
  {
    id: 'id4',
    invisible: false,
    interestType: 'friends'
  },
  {
    id: 'id5',
    invisible: true,
    interestType: 'male'
  },
  {
    id: 'id6',
    invisible: true,
    interestType: 'female'
  },
  {
    id: 'id7',
    invisible: true,
    interestType: 'both'
  },
  {
    id: 'id8',
    invisible: true,
    interestType: 'friends'
  }
]

const profiles = [
  {
    id: 'id1',
    age: 20,
    gender: 'male',
    interests: [
      'racing',
      'fiuba'
    ],
    location: [-58.381584, -34.603736] // obelisco
  },
  {
    id: 'id2',
    age: 30,
    gender: 'male',
    interests: [
      'brown',
      'fifa'
    ],
    location: [-58.381584, -34.603736] // obelisco
  },
  {
    id: 'id3',
    age: 25,
    gender: 'female',
    interests: [
      'fiesta',
      'locura'
    ],
    location: [-58.368645, -34.667453] // cancha de Racing
  },
  {
    id: 'id4',
    age: 35,
    gender: 'female',
    interests: [
      'fiesta',
      'locura'
    ],
    location: [-58.368645, -34.667453] // cancha de Racing
  }
]
