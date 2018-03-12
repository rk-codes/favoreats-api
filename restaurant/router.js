const express = require('express');
const config = require('../config');
const mongoose = require('mongoose');
const router = express.Router();


router.get('/', (req, res) => {
    res.json({restaurant: true})
})

module.exports = {router};