const mongoose = require('mongoose')

//  User Schema
const UserSchema = mongoose.Schema({
  id: {
    type: String
  },
  name: {
    type: String
  },
  age: {
    type: Number
  },
  description: {
    type: String
  },
  education: {
    type: String
  },
  work: {
    type: String
  },
  gender: {
    type: String
  },
  photo: {
    type: String
  },
  photos: {
    type: Array
  },
  interests: {
    type: Array
  }
})

// eslint-disable-next-line
const User = module.exports = mongoose.model('User', UserSchema)

module.exports.create = function (user) {
  return user.save()
}

module.exports.get = function (id) {
  const query = { id };

  return User.findOne(query);
}

module.exports.updateProfile = function (user) {
  return User.findOne({ id: user.id })
  .then((existUser) => {
    return (existUser === null) ?
      Promise.reject({ status: 404, message: 'user is not login' }) :
      existUser.update(user)
  })
  .then(() => User.findOne({ id: user.id }));
}

/**
 * Search:
 *  - users that have an "age" between the range
 *  - users that have the searched "genre"
 *  - users that have a "location"" between the limits
 *  - users that have "interests" in common
 *
 */
module.exports.search = function (params) {
  const gender = ['male', 'female'].includes(params.interestType) ?
    { gender: params.interestType } : {};

  // const interests = params.interests.length ? { $or: [] } : {}
  // for (const interest of params.interests) {
  //   const regex = new RegExp('.*' + interest + '.*');
  //   interests.$or.push({ interests: { $regex: regex } })
  // }

  const query = {
    $and: [
      gender,
      { age: { $gte: params.ageRange.min } },
      { age: { $lte: params.ageRange.max } }
    ]
  }

  return User.find(query).catch(console.log);
}

module.exports.findAll = function () {
  return Promise.resolve(User.find({}))
}
