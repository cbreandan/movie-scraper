var request = require('request'),
	cheerio = require('cheerio'),
	getCSV = require('./getcsv'),
	fs = require('fs'),
	csv = require('fast-csv');
var movies_objects_array = [];


var cineplex_movie_name = 'kung-fu-panda-3'
var cineplex_movie_url = 'http://www.cineplex.com/Showtimes/'+ cineplex_movie_name +'/cineplex-cinemas-yongeeglinton-and-vip-formerly-silvercity?Date=2/19/2016';
request(cineplex_movie_url, function(err,response,body){
	var $ = cheerio.load(body);
	$('.showtime--list li').each(function(index, items){
		showtime = $(items).find('.showtime').text();
		movies_objects_array.push({
			Length: showtime
		});
	});
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