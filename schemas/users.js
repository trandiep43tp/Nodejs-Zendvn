var mongoose = require('mongoose');

var schema = new mongoose.Schema({
      email   : String,
      password: String     
});

module.exports = mongoose.model("users", schema)