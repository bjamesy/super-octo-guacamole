var mongoose = require('mongoose');

var filmSchema = new mongoose.Schema({
    title: String,
    screenings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Screening"
        }
    ]
});

var Film = mongoose.model('Film', filmSchema);
module.exports = Film;