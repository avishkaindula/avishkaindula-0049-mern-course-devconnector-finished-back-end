const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    // Gravatar will allow us to attach a profile image to your email
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
// Schema holds the different fields that we want this resource to have.

module.exports = User = mongoose.model("user", UserSchema);
// "user" is the name of the model.
