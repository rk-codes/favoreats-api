const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    restaurants: [{
        type: mongoose.Schema.Types.ObjectId,
  	    ref: "Restaurant"
    }]
});

UserSchema.methods.serialize = function() {
    return {
      id: this._id,
      username: this.username || '',
      firstName: this.firstName || '',
      lastName: this.lastName || '',
      restaurants: this.restaurants.map(restaurant => restaurant) || []
    };
  };

const User = mongoose.model('User', UserSchema);

module.exports = {User};