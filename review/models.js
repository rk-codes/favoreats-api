const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    reviewDate: {
        type: Date,
        default: Date.now
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
        reviewDate: this.reviewDate || '',
        rating: this.rating || '',
        description: this.description || ''
    }
}
const Review = mongoose.model('Review', ReviewSchema);

module.exports = {Review};