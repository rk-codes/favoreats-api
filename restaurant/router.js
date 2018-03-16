const express = require('express');
const config = require('../config');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');
const jwtAuth = passport.authenticate('jwt', { session: false });

const {Restaurant} = require('./models');
const {User} = require('../user/models');
const {Dish} = require('../dish/models');
const {Review} = require('../review/models');

const jsonParser = bodyParser.json();
const router = express.Router();


// GET all restaurants
router.get('/', jwtAuth, (req, res) => {
    if(req.user) {
        User.findOne({username:req.user.username}).populate({path: 'restaurants'})
        .then(user => res.status(200).json(user.restaurants.map(restaurant => restaurant.serialize())))
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        })
    }
    else{
        res.status(400).json({error: 'No logged in user'})
    }
})

//GET a restaurant by id
router.get('/:id', (req, res) => {
    Restaurant.findById(req.params.id)
    .then(restaurant => res.status(200).json(restaurant))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})

//Add new restaurant
router.post('/', jsonParser, jwtAuth, (req, res) => {
    console.log("POST a restuarant");
    
    const requiredFields = ['name', 'location', 'cuisine'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
      }
    let addedRestuarant; 
    Restaurant.create({
        user: req.user.id,
        name: req.body.name,
        location: req.body.location,
        cuisine: req.body.cuisine
    })
    .then(restaurant => {
        addedRestuarant = restaurant;
       return User.findByIdAndUpdate(req.user.id, {
            $push: {"restaurants": restaurant},        
        }).populate({path: 'restaurants'})      
    })
    .then(user => res.status(201).json(addedRestuarant.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})

//Delete a restaurant
router.delete('/:id', jwtAuth, (req, res) => {
    let deletedRestaurant;
    Restaurant.findByIdAndRemove(req.params.id)
    .then(restaurant => {
        deletedRestaurant = restaurant;
        return User.findByIdAndUpdate({_id: restaurant.user}, {
            $pull: {restaurants: req.params.id}
        }).populate({path: 'restaurants'}) 
    })
    .then(user =>res.json(deletedRestaurant.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})

//Update a restaurant
router.put('/:id', jsonParser, jwtAuth, (req, res) => {
   // ensure that the id in the request path and the one in request body match
   if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = (
        `Request path id (${req.params.id}) and request body id ` +
        `(${req.body.id}) must match`);
        console.error(message);
        return res.status(400).json({ message: message });
    }
    const toUpdate = {};
    const updateableFields = ['name', 'location', 'cuisine'];
    updateableFields.forEach(field => {
        if (field in req.body) {
        toUpdate[field] = req.body[field];
        }
    });
    Restaurant.findByIdAndUpdate(req.params.id, {$set: toUpdate})
    .then(restaurant => Restaurant.findById(req.params.id))
    .then(restaurant => res.status(200).json(restaurant.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})

//GET all dishes of a restaurant
router.get('/:id/dishes', jwtAuth, (req, res) => {
    Restaurant.findById(req.params.id).populate({path: 'dishes'})
    .then(restaurant => res.status(200).json(restaurant.dishes))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
  });
})

// GET a dish by id
router.get('/:id/dishes/:dishId', jwtAuth, (req, res) => {
    Dish.findById(req.params.dishId).populate({path: 'reviews'})
    .then(dish => {
        if(dish.restaurant.toString() === req.params.id) {
            res.status(200).json(dish)
        }
        else{
            res.status(400).json("Restaurant does'nt contain the dish");
          }  
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
  });
})

//POST a dish to a restaurant
router.post('/:id/dishes', jwtAuth, jsonParser, (req, res) => {
    const requiredFields = ['name', 'rating', 'description'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
      }
      let addedDish;
      const newReview = {
        rating: req.body.rating,
        description: req.body.description 
      }
      if(req.body.date) {
        newReview.date = req.body.date;
      }
      const newDish = {
          name: req.body.name
      }
      Review.create(newReview)
      .then(review => Dish.create({
          restaurant: mongoose.Types.ObjectId(req.params.id),
          name: req.body.name,
          reviews: [review._id]
      }))
      .then(dish => {
          addedDish = dish
          Restaurant.findByIdAndUpdate(req.params.id,{ $push: {"dishes": dish} },{safe: true, upsert: true})
      })
      .then(restaurant => res.json(addedDish.serialize()))
  
        .catch(err => {
          console.error(err);
          res.status(500).json({ error: 'Internal Server Error' });
        })
    })

module.exports = {router};
       

