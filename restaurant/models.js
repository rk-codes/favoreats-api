const mongoose = require('mongoose');

const RestaurantSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId , 
        ref: "User"
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    cuisine: {
        type: String,
        required: true
    },
    dishes: [{
        type: mongoose.Schema.Types.ObjectId,
  		ref: "Dish"
    }]
})

RestaurantSchema.methods.serialize = function() {
    return{
        id: this._id || '',
        ame: this.name || '',
        location: this.location || '',
        cuisine: this.cuisine || '',
        dishes: this.dishes.map(dish => dish) || []
    }
}
const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

module.exports = {Restaurant};