var request = require('request'),
	cheerio = require('cheerio'),
	getCSV = require('./getcsv'),
	fs = require('fs');


require('./date.js');
var date = new Date().toString('M/d/yyyy');

var scrape_url = 'http://www.cineplex.com/Showtimes/any-movie/cineplex-odeon-eglinton-town-centre-cinemas?Date=' + date;
var title,
	title_array = [],
	length,
	length_array = [],
	content_rating,
	content_rating_array = [],
	push = true;

console.log(scrape_url);

getCSV('movies.csv', function(err,data){
	request(scrape_url, function(err, response, body){
		if (!err && response.statusCode == 200){
			var $ = cheerio.load(body);
			$('.no-page-break-inside').each(function(index, items){
				title = $(items).find('a.movie-details-link-click').text();
				title = title.trim(' ');
				console.log(title);

				for(var i=0; i<data.length; i++){
					if (data[i].title == title){
						push = false;
						break;
					} else {
						continue;
					}
				}

				if (push == false){

				} else {
					title_array.push(title);

					length = $(items).find('meta[itemprop="duration"]').attr("content");
					length_array.push(length);

					content_rating = $(items).find('meta[itemprop="contentRating"]').attr("content");
					content_rating_array.push(content_rating);
				}

				push = true;
			});
			console.log(title_array);
			console.log(length_array);
			console.log(content_rating_array);
		} else {
			console.log('We have encountered ' + err);
		}
	});
});






