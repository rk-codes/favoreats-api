const express = require('express');
const config = require('../config');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const {Restaurant} = require('./models');
const {User} = require('../user//models');

const jsonParser = bodyParser.json();
const router = express.Router();


//Mock data
const user = {
    restaurants: [{
        name: 'ABC',
        location: 'SFO',
        cuisine: 'Italian',
        dishes: [{
            name: 'Dish d',
            reviews: [{
                date: '2/4/2017',
                rating: '2',
                description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
            }]
        }]
    },
    {
        name: 'XXY',
        location: 'PHX',
        cuisine: 'Mexican',
        dishes: [{
            name: 'Dish a',
            reviews: [{
                date: '2/6/2017',
                rating: '5',
                description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
            }]
        }]
    }]
}

// GET all restaurants
router.get('/', (req, res) => {
    res.status(200).json(user.restaurants);
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
router.post('/', jsonParser, (req, res) => {
    console.log("POST a restuarant");
   
    let userId = "5aa712f7a6fae94bdf8163fe";
    Restaurant.create({
        name: req.body.name,
        location: req.body.location,
        cuisine: req.body.cuisine
    })
    .then(restaurant => 
        User.findByIdAndUpdate(userId, {
            $push: {"restaurants": restaurant}
        })      
    )
    .then(
        user => 
            res.status(201).json(user.serialize())
        )
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})

//Delete a restaurant
router.delete('/:id', (req, res) => {
    res.json({restaurant: true})
})

//Update a restaurant
router.put('/:id', jsonParser, (req, res) => {
    res.json({restaurant: true})
})

module.exports = {router};
       

