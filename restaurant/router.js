const express = require('express');
const config = require('../config');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();
const router = express.Router();


//Mock data
const user = {
    restaurants: [{
        id: 1,
        name: 'ABC',
        location: 'SFO',
        cuisine: 'Italian',
        dishes: [{
            id: 1,
            name: 'Dish d',
            reviews: [{
                id: 1,
                date: '2/4/2017',
                rating: '2',
                description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
            }]
        }]
    },
    {
        id: 2,
        name: 'XXY',
        location: 'PHX',
        cuisine: 'Mexican',
        dishes: [{
            id: 2,
            name: 'Dish a',
            reviews: [{
                id: 2,
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
    res.json({restaurant: true})
})

//Add new restaurant
router.post('/', (req, res) => {
    res.json({restaurant: true})
})

//Delete a restaurant
router.delete('/:id', (req, res) => {
    res.json({restaurant: true})
})

//Update a restaurant
router.put('/:id', (req, res) => {
    res.json({restaurant: true})
})

module.exports = {router};