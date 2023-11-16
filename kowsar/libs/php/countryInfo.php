<?php


define('OPEN_CAGED_DATA_KEY', '4524669a072a44b8a71ea81107053b1a');
define('OPEN_WEATHER_MAP_API_KEY', 'b3eef77b1fa9e5abe3b3b7b5336fb037');
define('OPEN_EXCHANGE_RATES_API_KEY', '49b2c9edd8db4070a56ee507784b52b1');


define('API_NINJA_KEY', '2hRfx29YLwosgUm+pINnFg==SKw76Rne8sXtSnva');

if (isset($_POST['getCountryInfo'])) {
	$name =  urlencode($_POST['countryName']);

	$executionStartTime = microtime(true);

	$url = 'https://api.opencagedata.com/geocode/v1/json?q=' . $name . '&key=' . OPEN_CAGED_DATA_KEY . '&language=en&pretty=1';




	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	// if (isset($decode['results'][0]['geometry']['lat']) && isset($decode['results'][0]['geometry']['lng'])) {
	$output['status']['code'] = "200";

	$output['data']['lat'] = $decode['results'][0]['geometry']['lat'];
	$output['data']['lng'] = $decode['results'][0]['geometry']['lng'];
	$output['data']['others'] = $decode['results'][0];
	$output['data']['country'] = $decode['results'][0];


	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output);
}
if (isset($_POST['getCountryWeather'])) {



	$lat = $_POST['lat'];
	$lng = $_POST['lng'];



	// Construct the weather API URL with latitude, longitude, and API key
	//'http://api.weatherapi.com/v1/forecast.json?key={$apiKey}&q={$lat},{$lng}';//&days=1&aqi=no&alerts=no';
	$url = 'https://api.openweathermap.org/data/3.0/onecall' .
		'?lat=' . $lat .
		'&lon=' . $lng .
		//'&exclude={part}' + x + 
		'&appid=' . OPEN_WEATHER_MAP_API_KEY . '&units=metric';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	$output['status']['code'] = "200";

	$output['data'] = $decode;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);
}


if (isset($_POST['getCountryCurrency'])) {



	$url = "https://openexchangerates.org/api/latest.json?app_id=" . OPEN_EXCHANGE_RATES_API_KEY;

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	$output['status']['code'] = "200";

	$output['data'] = $decode;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);
}


if (isset($_POST['getCountryRestData'])) {


	$country_name = urlencode($_POST['countryName']);

	$country_name = str_replace('+', '%20', $country_name);



	$url = "https://restcountries.com/v3.1/name/"
		. $country_name;



	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	$output['status']['code'] = "200";

	$output['data'] = $decode;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);
}


if (isset($_POST['getCountryWiki'])) {




	$url = 'http://api.geonames.org/findNearbyWikipediaJSON?lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=mohi';




	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	$output['status']['code'] = "200";
	$output['data'] = $decode;

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);
}


if (isset($_POST['getCountryLayers'])) {


	$type = $_POST['requestType'];

	$url = 'http://api.geonames.org/searchJSON?formatted=true&q=' . $type . '&country=' . $_REQUEST['countryCode'] . '&username=mohi';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	$output['status']['code'] = "200";
	$output['data'] = $decode['geonames'];

	header('Content-Type: application/json; charset=UTF-8');

	echo json_encode($output);
}



if (isset($_POST['getCountryHolidays'])) {




	$country = $_POST['country'];
	$year = '2023';
	$url = 'https://api.api-ninjas.com/v1/holidays?country=' . $country . '&year=' . $year;




	$api_key = API_NINJA_KEY;







	$ch = curl_init($url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);



	curl_setopt($ch, CURLOPT_HTTPHEADER, [
		'X-Api-Key: ' . $api_key,
		'Content-Type: application/json',
	]);
	$result = curl_exec($ch);






	if (curl_errno($ch)) {
		echo 'Error: ' . curl_error($ch);
	} else {


		$decode = json_decode($result, true);

		$output['status']['code'] = "200";
		$output['data'] = $decode;

		header('Content-Type: application/json; charset=UTF-8');

		echo json_encode($output);
	}
	curl_close($ch);
}



if (isset($_POST['getCountryName'])) {



	$lat = $_POST['lat'];
	$lng = $_POST['lng'];
	$api_key = OPEN_CAGED_DATA_KEY;
	$url = "https://api.opencagedata.com/geocode/v1/json?q={$lat}+{$lng}&key=" . OPEN_CAGED_DATA_KEY;

	// Make the request to the OpenCage Geocoding API

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL, $url);

	$result = curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result, true);

	// if (isset($decode['results'][0]['geometry']['lat']) && isset($decode['results'][0]['geometry']['lng'])) {
	$output['status']['code'] = "200";


	$output['data'] = $decode['results'][0]['components']['country'];


	header('Content-Type: application/json; charset=UTF-8');
	echo json_encode($output);
}
