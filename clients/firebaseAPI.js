const firebase = require('firebase-admin');
const serviceAccount = require('./credentials.json');
const ENV = process.env.ENV;
const TEST_ENV = 'env_test';

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: 'https://tdp2-frontend-7028a.firebaseio.com'
});

module.exports.sendMessage = (sendUID, recUID, chatMessage) => {
  const database = firebase.database();

  const messageToSend = {
    from: sendUID,
    to: recUID,
    message: chatMessage.message,
    highligth: chatMessage.highligth ? chatMessage.chatMessage : false,
    viewed: false
  }

  const sendUIDRef = database.ref(`chats/${sendUID}/messages/${recUID}`).push()
  const recUIDRef = database.ref(`chats/${recUID}/messages/${sendUID}`).push()

  return Promise.resolve()
    .then(() => sendUIDRef.set(messageToSend))
    .then(() => recUIDRef.set(messageToSend))
    .catch(() => Promise.reject({ status: 503, message: 'Error while sending chat message' }));
}

module.exports.deleteConversation = (sendUID, recUID) => {
  const database = firebase.database();

  const sendUIDRef = database.ref(`chats/${sendUID}/messages/${recUID}`)
  const recUIDRef = database.ref(`chats/${recUID}/messages/${sendUID}`)

  return Promise.resolve()
    .then(() => sendUIDRef.remove())
    .then(() => recUIDRef.remove())
    .catch(() => Promise.reject({ status: 503, message: 'Error while deleting chat conversation' }));
}

module.exports.sendNotification = (userRegToken, notification) => {
  const messaging = firebase.messaging();

  const payload = { notification }

  console.log('Token and payload', userRegToken, notification);

  if (ENV === TEST_ENV) { // TOD0: NO HACER ESTAS COSAS
    return Promise.resolve();
  }

  return messaging.sendToDevice(userRegToken, payload)
    .then((res) => console.log('Notification result', JSON.stringify(res)))
    .catch((err) => Promise.reject({ status: 503, message: err }));
}
