var request    = require('request'),
    { Client } = require('pg'),
    cheerio    = require('cheerio');

// vvvvvvvvvvvv Functions aiding the creation of types - kinda hacky
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

                async function seedDB(typeSeeds){
                    const client = new Client();
                    try {
                        await client.connect()

                        var types = []; 
                        for(const typeSeed of typeSeeds){
                            const sql = 'INSERT INTO type (type, times) VALUES ($1, $2) RETURNING id;';
                            const params = [typeSeed.type, typeSeed.time];  
                            const typeResult = await client.query(sql, params);

                            types.push(typeResult.rows[0]);
                        }
                        console.log('TYPE: ', types);

                        var type = [];
                        function mod(types){
                            types.forEach(el => {
                                type.push(el.id);
                            });
                        };
                        mod(types);

                        const sql2 = 'INSERT INTO film (title, link, theatre, type_id) VALUES ($1, $2, $3, $4) RETURNING type_id;';
                        const params2 = [title, link, theatre, type];   
                        const filmResult = await client.query(sql2, params2);

                        console.log('FILM', filmResult.rows);
                    } catch (err) {
                        console.log('Error : ', err);
                    }
                    var types = []; 
                };
                seedDB(typeSeeds);

                times = [];     
                typeSeeds = [];      
            });            
        }
    });
})();