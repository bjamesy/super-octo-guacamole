var mongoose = require("mongoose");

var screeningSchema = new mongoose.Schema({
    types: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Type"
        }
    ],
    theatre: String,
    link: String
});

var Screening  = mongoose.model("Screening", screeningSchema);
module.exports = Screening;