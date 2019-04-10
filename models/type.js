var mongoose = require('mongoose');

var typeSchema = new mongoose.Schema({
    type: String,
    time: []
});

var Type = mongoose.model('Type', typeSchema);
module.exports = Type;