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
  beforeEach((done) => {
    DB.drop()
		.then(done)
		.catch(done);
  });

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

    describe('when no match found', () => {
      beforeEach(() => {
        searchParams = {
          interestType: 'female',
          ageRange: {
            min: 18,
            max: 24
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
    ]
  },
  {
    id: 'id2',
    age: 30,
    gender: 'male',
    interests: [
      'brown',
      'fifa'
    ]
  },
  {
    id: 'id3',
    age: 25,
    gender: 'female',
    interests: [
      'fiesta',
      'locura'
    ]
  },
  {
    id: 'id4',
    age: 35,
    gender: 'female',
    interests: [
      'fiesta',
      'locura'
    ]
  }
]
