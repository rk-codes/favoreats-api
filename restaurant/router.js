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
        })      
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
    .then(restaurant => res.status(200).json(restaurant.dishes.map(dish => dish.serialize())))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
  });
})

// router.get('/:id/dishes', jwtAuth, (req, res) => {
//     let newDishes;
//     Restaurant.findById(req.params.id).populate({
//         path: 'dishes',
//         populate: {
//             path: 'reviews'
//         }}
//     )
//     .then(restaurant => res.status(200).json(restaurant.dishes.map(dish => dish.serialize())))
//     .catch(err => {
//         console.error(err);
//         res.status(500).json({error: 'Internal Server Error'});
//   });
// })

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
        newReview.reviewDate = req.body.date;
    }
    Review.create(newReview)
      .then(review => Dish.create({
        restaurant: mongoose.Types.ObjectId(req.params.id),
        name: req.body.name,
        latestRating: req.body.rating,
        reviews: [review._id]
    }))
    .then(dish => {
        addedDish = dish;
        return Restaurant.findByIdAndUpdate(req.params.id,{ 
            $push: {"dishes": dish} })
    })
    .then(restaurant => res.json(addedDish.serialize()))
//    .then(restaurant => 
//        Dish.findById(addedDish._id).populate({path: "reviews"})
//    )
//    .then(dish => res.json(dish.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})
router.delete('/:id/dishes/:dishId', jwtAuth, jsonParser, (req, res) => {
    let deletedDish;
    Dish.findByIdAndRemove(req.params.dishId) //remove the dish
    .then(dish => {
      if(dish) {
        console.log(dish);
        deletedDish = dish;
        let reviewIds = dish.reviews;
        Review.remove({ "_id": { "$in": reviewIds } }) //remove the reviews of the deleted dish
        .then(() => Restaurant.findByIdAndUpdate({_id: req.params.id},{ $pull: {dishes: req.params.dishId} }))
        .then(restaurant => res.status(200).json(deletedDish.serialize()))
         
      } else {
        return res.send("No dish found");
      }      
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
    })
  })

//Update a dish in a restaurant
router.put('/:id/dishes/:dishId', jwtAuth, jsonParser, (req, res) => {
   // ensure that the id in the request path and the one in request body match
  if (!(req.params.dishId && req.body.id && req.params.dishId === req.body.id)) {
    const message = (
      `Request path id (${req.params.id}) and request body id ` +
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).json({ message: message });
  }

  const toUpdate = {};
  const updateableField = 'name';
  if (updateableField in req.body) {
    toUpdate[updateableField] = req.body[updateableField];
  }

  Dish.findByIdAndUpdate(req.params.dishId, { $set: toUpdate }) // all key/value pairs in toUpdate will be updated -- that's what `$set` does
  .then(dish => res.status(200).json(dish.serialize()))
  .catch(err => res.status(500).json({ message: 'Internal server error' }));
})
      
//Add a review for a dish

router.post('/:id/dishes/:dishId/reviews', jwtAuth, jsonParser, (req, res) => {
    const requiredFields = ['rating', 'description'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    let addedReview;
    const newReview = {
        rating: req.body.rating,
        description: req.body.description 
    }
    if(req.body.date) {
        newReview.reviewDate = req.body.date;
    }
    Review.create(newReview)
    .then(review => {
        addedReview = review;
       return  Dish.findByIdAndUpdate(req.params.dishId, { 
           $push: {"reviews": review}, 
           latestRating: req.body.rating })     
    }) 
 
    .then(dish => res.json(addedReview.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})

//Get all reviews of a dish
router.get('/:id/dishes/:dishId/reviews', jwtAuth, (req, res) => {
    Dish.findById(req.params.dishId).populate({path: 'reviews'})
    .then(dish => res.status(200).json(dish.reviews.map(review => review.serialize())))
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Internal Server Error'});
  });
})

module.exports = {router};

