const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    date: {
        type: Date
    },
    rating: {
        type: String,
        
    },
    description: {
        type: String,
       
   }
})

ReviewSchema.methods.serialize = function() {
    return{
        id: this._id || '',
        date: this.date || '',
        rating: this.name || '',
        description: this.description || ''
    }
}
const Review = mongoose.model('Review', ReviewSchema);

module.exports = {Review};