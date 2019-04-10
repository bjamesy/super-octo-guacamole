var request      = require('request'),
    mongoose     = require('mongoose'),
    cheerio      = require('cheerio'),
    Film         = require('../models/film'),
    Screening    = require('../models/screening'),
    Type         = require('../models/type');

module.exports = (() => {
    request('https://www.cineplex.com/Showtimes/any-movie/scotiabank-theatre-toronto?Date=3/7/2019', function(error, response, html){
        if(!error && response.statusCode == 200){
            var $ = cheerio.load(html);
            
            var typeTime = {
                type: '',
                time: []
            };
            var addTypes = function(types){
                typeTime.type = types;
            };
            var addTimes = function(times){
                typeTime.time.push(times);
            };
            
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
    
                Film.create({title: title}, function(err, film){
                    if(err){
                        console.log(err);
                        console.log('*********************************FILM WENT WRONG*********************************');
                    } else {
                        Screening.create({theatre: theatre, link: link}, function(err, screening){
                            if(err){
                                console.log(err);
                                console.log('*********************************SCREENING WENT WRONG*********************************');
                            } else {
                                //*********types per film!*********
                                $(el).find('.showtime--item').each(function(i, elem){
                                    var types = $(elem)
                                        .find('.movie-cat-wrap')
                                        .attr('class')
                                        .replace(/\s\s+/g, '');
                                    addTypes(types);
                                    //*********times per type!*********
                                    $(elem).find('.showtime').each(function(i, element){
                                        var times = $(element)
                                            .text()
                                            .replace(/\s\s+/g, '');
                                        addTimes(times);
                                    });
                                    Type.create(typeTime, function(err, type){
                                        if(err){
                                            console.log(err);
                                            console.log('*********************************TYPINGGG WENT WRONG*********************************');
                                        } else {
                                            type.save();
                                            screening.types.push(type);
                                            setTimeout(function(){
                                                screening.save();
                                            }, 3000);
                                            // this worked as a solution because it gets initiated on the first pass
                                            // but doesnt get called for the next 3 seconds.. so it gives the other 
                                            // Types (if there are any) 3 seconds to get queryed saved and pushed into 
                                            // the screening before it is saved - and it must finally call before 
                                            // moving on to the next screenings type creation so theres no problem with 
                                            // it being called too late 
                                        }
                                    });
                                    typeTime.type = '';
                                    typeTime.time = [];
                                });
                                // problem here was that its saving outside of the Type.create method 
                                // and therefore is not getting access, and saving, the types that are 
                                // being pushed into the screening doc --> solved with the setTimeout ********
                                film.screenings.push(screening);  
                                film.save();   
                            }
                        });        
                    }            
                });            
            });            
        }
    });
})();