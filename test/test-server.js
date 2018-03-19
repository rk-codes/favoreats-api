const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const should = chai.should();
chai.use(chaiHttp);

const {app, closeServer, runServer} = require('../server');
const {Restaurant} = require('../restaurant/models');
const {User} = require('../user/models');
const {Review} = require('../review/models');
const {TEST_DATABASE_URL, JWT_SECRET} = require('../config');


let newTestUser = {
	'username': 'testuser',
	'password': 'testpassword',
	'firstname': 'First',
	'lastname': 'Last'
}
let authToken;
let userId;

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('User', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  after(function() {
   return closeServer();
  });

  // afterEach(function() {
  //   return tearDownDb();
  // });

  describe('POST user', function() {
    it('should register new user', function() {
      return chai.request(app)
      .post('/user/')
      .send(newTestUser)
      .then(function (res) {
        userId = res._id;
        console.log(userId)
        res.should.have.status(201);
      })
      .catch((err) => {
        console.log(err)
      });
    });
  })
  
  describe('POST login', function() {
    it('should login registered user', function() {
		
      return chai.request(app)
      .post('/auth/login')
      .send(newTestUser)
      .then(function(res) {
        res.should.have.status(200);
        authToken = res.body.authToken;
        console.log(authToken);
      })
      .catch((err) => {
        console.log(err)
      });
    })
  })
});