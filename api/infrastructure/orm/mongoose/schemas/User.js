const mongoose = require('../mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  //TODO: Change this to mongo ids
  electionID: String,
});

module.exports = mongoose.model('User', userSchema);
