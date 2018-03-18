const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    reviewDate: {
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
        reviewDate: this.reviewDate || '',
        rating: this.name || '',
        description: this.description || ''
    }
}
const Review = mongoose.model('Review', ReviewSchema);

module.exports = {Review};