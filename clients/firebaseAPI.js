const firebase = require('firebase-admin');
const serviceAccount = require('./credentials.json');

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://tdp2-frontend-7028a.firebaseio.com'
});

module.exports.sendMessage = () => {
  const database = firebase.database();
  const usersRef = database.ref('users').push()

  usersRef.set({
    username: 'test',
    email: 'test@mail.com'
  })
  .then((res) => console.log('response', res)).catch((res) => console.log('catch', res));
}
