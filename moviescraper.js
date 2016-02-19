var request = require('request'),
	cheerio = require('cheerio'),
	getCSV = require('./getcsv'),
	fs = require('fs'),
	csv = require('fast-csv'),
	async = require('async');

require('./date.js');
var date = new Date().toString('M/d/yyyy');

var movies_url = 'http://www.cineplex.com/Showtimes/any-movie/cineplex-cinemas-yongeeglinton-and-vip-formerly-silvercity?Date=' + date;
var top_box_office_url = 'http://www.rottentomatoes.com/';

var title,
	length,
	content_rating,
	trailer,
	movies_objects_array = [],
	push = true;

var array_movies = [];

console.log(movies_url);

getCSV('New Movies.csv', function(err,data){
	request(movies_url, function(err, response, body){
		if (!err && response.statusCode == 200){
			var $ = cheerio.load(body);
			$('.no-page-break-inside').each(function(index, items){
				title = $(items).find('a.movie-details-link-click').text();
				title = title.trim(' ');
				console.log(title);

				var title_for_showtime = title.replace(/ |:/g, '-');
				array_movies.push(title_for_showtime); //store all the movie titles for finding the showtime

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
					trailer = 'https://www.youtube.com/results?search_query=' + title;
					movies_objects_array.push({
						Movie_Title: title,
						Length: length,
						Content_Rating: content_rating,
						Trailer: trailer
					});
				}
				push = true;
			});

			//Adding a row with heading Movies and Show Time
			movies_objects_array.push({
				Movie_Title: 'Movies',
				Length: 'Show Time'
			});

			async.eachSeries(array_movies, function(item, next_movie){
				var cineplex_movie_url = 'http://www.cineplex.com/Showtimes/'+ item +'/cineplex-cinemas-yongeeglinton-and-vip-formerly-silvercity?Date=2/19/2016';
				console.log(cineplex_movie_url);
				request(cineplex_movie_url, function(err,response,body){
					if (!err && response.statusCode == 200){
						var $ = cheerio.load(body);
						$('.showtime--list li').each(function(index, items){
							showtime = $(items).find('.showtime').text();
							movies_objects_array.push({
								Movie_Title: item,
								Length: showtime
							});
						});
						return next_movie();
					} else {
						console.log('We have encountered' + err);
						return next_movie();
					}
				});
			}, function(){
				console.log('hi');
				//Adding an empty row
				movies_objects_array.push({
					Movie_Title: '',
					Length: ''
				});
				//Adding a row with heading Box Office and Amount
				movies_objects_array.push({
					Movie_Title: 'Box Office',
					Length: 'Rating On rottentomatoes',
					Content_Rating: 'Amount'
				});
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

					//Adding an empty row
					movies_objects_array.push({
						Movie_Title: '',
						Length: ''
					});
					//Adding a row with heading Opening This Week, Release Date, and Trailer
					movies_objects_array.push({
						Movie_Title: 'Opening + Coming Soon',
						Length: 'Release Date',
						Trailer: 'Trailer'
					});

					$('#homepage-opening-this-week .sidebarInTheaterOpening').each(function(index, items){
						var movie = $(items).find('.middle_col').text();
						//console.log(movie);
						var release_date = $(items).find('.right_col').text();
						//console.log(release_date);
						trailer = 'https://www.youtube.com/results?search_query=' + movie;
						movies_objects_array.push({
							Movie_Title: movie,
							Length: release_date,
							Trailer: trailer
						});
					});	
				} else {
					console.log('We have encountered ' + err);
				}
				write_file();
			});
		} else {
			console.log('We have encountered ' + err);
		}
	});
});

function write_file(){

	request(top_box_office_url, function(err, response, body){
		if (!err && response.statusCode == 200){
			var $ = cheerio.load(body);
			$('#homepage-top-coming-soon .sidebarInTheaterOpening').each(function(index, items){
				var movie = $(items).find('.middle_col').text();
				var release_date = $(items).find('.right_col').text();
				var trailer = 'https://www.youtube.com/results?search_query=' + movie;
				movies_objects_array.push({
					Movie_Title: movie,
					Length: release_date,
					Trailer: trailer
				});
			});
			console.log(movies_objects_array);
			var ws_new_movies = fs.createWriteStream('New Movies.csv');
		    csv.
		    write(movies_objects_array, {headers:true}).pipe(ws_new_movies);  
		} else {
			console.log('We have encountered' + err);
		}
	});

}




