const express = require('express');
const config = require('../config');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const { router: authRouter, localStrategy, jwtStrategy } = require('../auth');
const jwtAuth = passport.authenticate('jwt', { session: false });

const {Restaurant} = require('./models');
const {User} = require('../user//models');

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
    Restaurant.create({
        user: req.user.id,
        name: req.body.name,
        location: req.body.location,
        cuisine: req.body.cuisine
    })
    .then(restaurant => 
        User.findByIdAndUpdate(req.user.id, {
            $push: {"restaurants": restaurant},        
        }, {'new': true})      
    )
    .then(user => res.status(201).json(user.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})

//Delete a restaurant
router.delete('/:id', jwtAuth, (req, res) => {
    Restaurant.findByIdAndRemove(req.params.id)
    .then(restaurant => 
        User.findByIdAndUpdate({_id: restaurant.user}, {$pull: {restaurants: req.params.id}}, {'new': true})
    )
    .then(user => res.json(user.serialize()))
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
    console.log(toUpdate);
    Restaurant.findByIdAndUpdate(req.params.id, {'new': true}, {$set: toUpdate})
   // .then(restaurant => Restaurant.findById(req.params.id))
    .then(restaurant => res.status(200).json(restaurant))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})

module.exports = {router};
       

