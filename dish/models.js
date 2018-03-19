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
        reviews: this.reviews.map(review => review) || []
    }
}
const Dish = mongoose.model('Dish', DishSchema);

module.exports = {Dish};