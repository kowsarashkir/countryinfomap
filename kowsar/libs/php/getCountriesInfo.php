<?php

error_reporting(E_ALL); 
ini_set('display_errors', 1); 
ini_set('display_startup_errors', 1); 
$country_codes = file_get_contents('../js/countryBorders.geo.json'); 
$country_codes = json_decode($country_codes); 



$features = $country_codes->features; 

$countries_data = []; 

foreach($features as $key=>$country){
    $name = $country->properties->name; 

    $data = array(
        'name' => $name, 
        'data'=> $country
    );
    array_push($countries_data, $data); 
}

// var_dump($countries_data);





function compareCountryNames($a, $b){
    return strcmp($a['name'], $b['name']); 
}

//use usort to sort the array based on country name 
usort($countries_data, 'compareCountryNames'); 
header('Content-Type: application/json; charset=UTF-8'); 
echo json_encode($countries_data); 
?>