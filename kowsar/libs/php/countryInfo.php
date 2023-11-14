<?php

if(isset($_POST['countryName'])){
   $name=  ($_POST['countryName']);
   
	$executionStartTime = microtime(true);
  
    $url='https://api.opencagedata.com/geocode/v1/json?q='. $name .'&key=4524669a072a44b8a71ea81107053b1a&language=en&pretty=1';



    
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_URL,$url);

	$result=curl_exec($ch);

	curl_close($ch);

	$decode = json_decode($result,true);	

	// if (isset($decode['results'][0]['geometry']['lat']) && isset($decode['results'][0]['geometry']['lng'])) {
		$output['status']['code'] = "200";
	
		$output['data']['lat'] = $decode['results'][0]['geometry']['lat'];
		$output['data']['lng'] = $decode['results'][0]['geometry']['lng'];
		$output['data']['others'] = $decode['results'][0]; 
		$output['data']['country'] = $decode['results'][0]; 

		
		header('Content-Type: application/json; charset=UTF-8');
		echo json_encode($output);
	

  }
	?>



