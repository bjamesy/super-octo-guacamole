var request      = require('request'),
    mongoose     = require('mongoose'),
    cheerio      = require('cheerio'),
    Film         = require('../models/film'),
    Screening    = require('../models/screening'),
    Type         = require('../models/type');

// vvvvvvvvvvvv Functions aiding the creation of types
var typeSeeds = []
var times = [];
function Seed(types, times){
    this.type = types;
    this.time = times
};
    
module.exports = (() => {
    request('https://www.cineplex.com/Showtimes/any-movie/scotiabank-theatre-toronto?Date=3/7/2019', function(error, response, html){
        if(!error && response.statusCode == 200){
            var $ = cheerio.load(html);

            var theatre  = $('.theatre-text')
                .text()
                .replace(/\s\s+/g, '');
                
            $('.showtime-card').each(function(i, el){
                var title = $(el)
                    .find('.movie-details-link-click')
                    .text()
                    .replace(/\s\s+/g, '');
                var link = $(el)
                    .find('.movie-details-link-click')
                    .attr('href')
                    .replace(/\s\s+/g, '');
                
                $(el).find('.showtime--item').each(function(i, elem){
                    var types = $(elem)
                        .find('.movie-cat-wrap')
                        .attr('class')
                        .replace(/\s\s+/g, '');

                    $(elem).find('.showtime').each(function(i, element){
                        var t = $(element)
                            .text()
                            .replace(/\s\s+/g, '');
                        times.push(t);
                    });
                    typeSeeds.push(new Seed(types, times));
                    times = [];
                });
                // callback solution goes here ! 
                function seedDB(typeSeeds){
                    Screening.create( {theatre: theatre, link: link} )
                        .then((screening) => {
                            Film.create( {title: title} )
                                .then(() => {
                                    for(const typeSeed of typeSeeds){
                                        Type.create(typeSeed)
                                            .then((type) => {
                                                screening.types.push(type);
                                            })
                                            .catch((err) => {
                                                console.log('type creation err: ', err);
                                            })                    
                                    }        
                                }) 
                                .catch((err) => {
                                    console.log('film creation err: ', err);
                                })
                                .finally((film) => {
                                    screening.save()       
                                    film.screenings.push(screening);  
                                    film.save();        
                                })
                        })
                        .catch((err) => {
                            console.log('screening creation err: ', err);
                        })        
                };
                seedDB(typeSeeds);
                times = [];     
                typeSeeds = [];      
            });            
        }
    });
})();