var express       = require('express'),
    app           = express(),
    request       = require('request'),
    mongoose      = require('mongoose'),
    cheerio       = require('cheerio'),
    Film          = require('./models/film'),
    Screening     = require('./models/screening'),
    Type          = require('./models/type');
    // scotiaTheatre = require('./scrape/scotiaTheatre');
    
app.set('view engine', 'ejs');
mongoose.connect("mongodb://localhost/to_movies", { useNewUrlParser: true });

// ROUTES
app.get("/", function(req, res){
    // populating multiple feilds and multiple seeded documents. 
    Film.find().
        populate({
         path: 'screenings types',
         populate: {
            path: 'types'
         }
        }) 
        .exec(function(err, foundFilms){
        if(err){
            console.log(err);
            console.log('couldnt find the FILMS!');
            res.redirect('back');
        } else {
            console.log('found the FILMS!');
            res.render('home', {films: foundFilms}); 
        }
    });
});

// LISTENER 
app.listen(process.env.PORT || 3000, function(){
    console.log('your server has started!');
});