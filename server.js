const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require('passport');

const {CLIENT_ORIGIN, PORT, DATABASE_URL} = require('./config');

//Routers
const { router: usersRouter } = require('./user');
const {router: restaurantRouter} = require('./restaurant');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;
const app = express();

app.use(
    cors({ origin: '*'})
);

passport.use(localStrategy);
passport.use(jwtStrategy);
// Logging
app.use(morgan('common'));

app.use('/user', usersRouter);
app.use('/auth', authRouter);
app.use('/restaurants', restaurantRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'rosebud'
  });
});

app.get('/api/*', (req, res) => {
  res.json({ok: true});
}); 

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

//app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
let server;

// connect to mongo database & start the  server
function runServer(databaseUrl = DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app
        .listen(port, () => {
          console.log(`Your app is listening on port ${port}`);
          resolve();
        })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}
//close the server
function closeServer() {
    return mongoose.disconnect().then(() => {
      return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  }

if (require.main === module) {
    runServer().catch(err => console.error(err));
  }

module.exports = {app, runServer, closeServer};