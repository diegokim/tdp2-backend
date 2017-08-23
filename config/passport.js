const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

module.exports = function (passport) {
  const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey:    'secret'
  }

  passport.use(new JwtStrategy(opts, (jwtPayload, done) => {
    done(null, {})
  }))
}
