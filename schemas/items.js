var mongoose = require('mongoose');

var schema = new mongoose.Schema({
     name: String,
      status: String, 
      ordering: Number 
});

module.exports = mongoose.model("items", schema)