const mongoose = require('mongoose')

//  User Schema
const UserSchema = mongoose.Schema({
  id: {
    type: String
  },
  name: {
    type: String
  },
  birthday: {
    type: String
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

