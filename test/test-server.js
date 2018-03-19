const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const faker = require('faker');

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
let restId;


function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

function seedRestaurantData(userId) {
  console.log(userId);
  return Restaurant.create(generateRestaurantData(userId))
  	.then(function(restaurant) {
  		restId = restaurant._id;
  		console.log("seedRestaurantData");
  		console.log(restId);
  		User.findByIdAndUpdate(userId, 
  			{ $push: {"restaurants": restaurant} },
			  { safe: true, upsert: true},
       		function(err, model) {
         		if(err){
        			console.error(err);
        			return ;
        		 }
        	return ;
		})
  	})
}

function generateRestaurantData(userId) {
	return {
		user: [mongoose.Types.ObjectId(userId)],
		name: faker.lorem.sentence(),
		location: faker.address.city(),
    cuisine: faker.lorem.word()
	}
}
describe('API', function() {
  before(function () {
    return runServer(TEST_DATABASE_URL)
  })
 
  after(function () {
    return closeServer()
  })


    it('should register new user', function() {
      return chai.request(app)
      .post('/user/')
      .send(newTestUser)
      .then(function (res) {
        userId = res.id;
        console.log(userId)
        res.should.have.status(201);
      })
      .catch((err) => {
        console.log(err)
      });
    });
 
 
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

  describe('Restaurants API', function() {
    beforeEach(function() {
      return seedRestaurantData(userId);
    });
 
    afterEach(function() {
      return tearDownDb();
    });

    it('should return all restaurants on GET', function() {
      return chai.request(app)
			.get('/restaurants')
			.set('authorization', `Bearer ${authToken}`)
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
        //res.body.should.have.length.of.at.least(1);
        res.body.forEach(function(restaurant) {
					restaurant.should.be.a('object');
					restaurant.should.include.keys('name', 'location', 'cuisine');
				});
			})
			.catch((err) => {
        console.log(err)
      })
    })

    it('should return one restaurant on GET by id', function() {	
			return Restaurant.findOne()
			.then(function(restaurant) {
				restId = restaurant.id;
				return chai.request(app)
				.get(`/restaurants/${restaurant.id}`)
				.set('authorization', `Bearer ${authToken}`)
			})
			.then(function(res) {
				res.should.have.status(200);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body._id.should.equal(restId);
			})
    })
    
    it('should delete one restaurant by id', function() {
			return Restaurant.findOne()
			.then(function(restaurant) {
				return chai.request(app)
				.delete(`/restaurants/${restaurant.id}`)
				.set('authorization', `Bearer ${authToken}`)
			})
			.then(function(res) {
				res.should.have.status(200);
				return Restaurant.findById(restId)
			})
			.then(function(_restaurant){
				should.not.exist(_restaurant);
			});
    });
    
    it('should post a new restaurant', function() {
			let newRestaurant = generateRestaurantData(userId);
			return chai.request(app)
			.post('/restaurants/')
			.set('authorization', `Bearer ${authToken}`)
			.send(newRestaurant)
			.then(function(res) {
				res.should.have.status(201);
				res.should.be.json;
				res.body.should.be.a('object');
				res.body.should.include.keys('name', 'cuisine', 'location');
				res.body.name.should.equal(newRestaurant.name);
				res.body.cuisine.should.equal(newRestaurant.cuisine);
				res.body.location.should.equal(newRestaurant.location);
			});
		});
  });
})