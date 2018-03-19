const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    console.log(this.username);
    return {
      id: this._id,
      username: this.username || '',
      firstName: this.firstName || '',
      lastName: this.lastName || '',
      restaurants: this.restaurants.map(restaurant => restaurant) || []
    };
  };

  UserSchema.methods.validatePassword = function(password) {
    return bcrypt.compare(password, this.password);
  };
  
  UserSchema.statics.hashPassword = function(password) {
      console.log("hash password");
    return bcrypt.hash(password, 10);
  };

const User = mongoose.model('User', UserSchema);

module.exports = {User};