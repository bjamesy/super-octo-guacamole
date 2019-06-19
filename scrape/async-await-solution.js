var request      = require('request'),
    mongoose     = require('mongoose'),
    cheerio      = require('cheerio'),
    Film         = require('../models/film'),
    Screening    = require('../models/screening'),
    Type         = require('../models/type');

// Functions aiding the creation of types
var typeSeeds = [];
function Seed(types, times){
    this.type = types;
    this.time = times
};

var times = [];

// scotiaBank theatre scrape
module.exports = (() => {
    request('https://www.cineplex.com/Showtimes/any-movie/scotiabank-theatre-toronto?Date=3/7/2019', function(err, res, html){
        if(!err && res.statusCode == 200){
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
                console.log('TYPESEEDS : ', typeSeeds);
                // had to included typeSeeds here as a parameter in seeDB() since the array  
                // was being set to empty prior to being created as an instance of Type
                async function seedDB(typeSeeds){
                    try {
                        let film = await Film.create({title: title});
                        let screening = await Screening.create({theatre: theatre, link: link});
                        for(const typeSeed of typeSeeds){
                            let type = await Type.create(typeSeed);
                            screening.types.push(type);    
                        }
                        screening.save();
                        film.screenings.push(screening);
                        film.save();
                        console.log("film created lets see if this worked ... gulp");     
                    } catch (err) {
                        console.log(err);
                    }
                };
                seedDB(typeSeeds);
                times = [];     
                typeSeeds = [];      
            });            
        }
    });
})();