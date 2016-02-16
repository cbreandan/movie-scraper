var request = require('request'),
	cheerio = require('cheerio'),
	getCSV = require('./getcsv'),
	fs = require('fs'),
	csv = require('fast-csv');


require('./date.js');
var date = new Date().toString('M/d/yyyy');

var movies_url = 'http://www.cineplex.com/Showtimes/any-movie/cineplex-cinemas-yongeeglinton-and-vip-formerly-silvercity?Date=' + date;
var top_box_office_url = 'http://www.rottentomatoes.com/';

var title,
	length,
	content_rating,
	movies_objects_array = [],
	push = true;

console.log(movies_url);

getCSV('New Movies.csv', function(err,data){
	request(movies_url, function(err, response, body){
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
					length = $(items).find('meta[itemprop="duration"]').attr("content");
					content_rating = $(items).find('meta[itemprop="contentRating"]').attr("content");
					movies_objects_array.push({
						Movie_Title: title,
						Length: length,
						Content_Rating: content_rating,
					});
				}
				push = true;
			});
			
			//Adding a row with heading Box Office and Amount
			movies_objects_array.push({
				Movie_Title: 'Box Office',
				Length: 'Rating',
				Content_Rating: 'Amount'
			});

			request(top_box_office_url, function(err, response, body){
				if (!err && response.statusCode == 200){
					var $ = cheerio.load(body);
					$('#homepage-top-box-office tr').each(function(index, items){
						var movie = $(items).find('.middle_col').text();
						//console.log(movie);
						var rating = $(items).find('.tMeterIcon').text();
						//console.log(rating);
						var amount = $(items).find('.right_col').text();
						//console.log(amount);
						movies_objects_array.push({
							Movie_Title: movie,
							Length: rating,
							Content_Rating: amount
						});
					});
				} else {
					console.log('We have encountered ' + err);
				}
				console.log(movies_objects_array);
				write_file();
			});
		} else {
			console.log('We have encountered ' + err);
		}
	});
});

function write_file(){
    var ws_new_movies = fs.createWriteStream('New Movies.csv');
    csv.
    write(movies_objects_array, {headers:true}).pipe(ws_new_movies);  
}




