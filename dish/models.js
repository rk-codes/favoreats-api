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
    reviews : { 
        type : Array , 
        "default" : [] 
    }
})

DishSchema.methods.serialize = function() {
    return{
        id: this._id || '',
        name: this.name || '',
        reviews: this.dishes.map(review => review) || []
    }
}
const Dish = mongoose.model('Dish', DishSchema);

module.exports = {Dish};