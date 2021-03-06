const mongoose = require('mongoose');

const DishSchema = mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId , 
        ref: "Restaurant"
    },
    name: {
        type: String,
        required: true
    },
    latestRating: {
        type: Number,
        default: 0
    },
    reviews : [{ 
        type: mongoose.Schema.Types.ObjectId , 
        ref: "Review"
    }]
})

DishSchema.methods.serialize = function() {
    return{
        restaurant: this.restaurant|| '',
        id: this._id || '',
        name: this.name || '',
        latestRating: this.latestRating || 0,
        reviews: this.reviews.map(review => review) || []
    }
}
const Dish = mongoose.model('Dish', DishSchema);

module.exports = {Dish};