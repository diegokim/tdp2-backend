const mongoose = require('mongoose')

//  User Schema
const UserSchema = mongoose.Schema({
  id: {
    type: String
  },
  nombre: {
    type: String
  },
  nacimiento: {
    type: String
  },
  descripcion: {
    type: String
  },
  educacion: {
    type: String
  },
  ocupacion: {
    type: String
  },
  sexo: {
    type: String
  },
  foto: {
    type: String
  },
  fotos: {
    type: Array
  },
  intereses: {
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
