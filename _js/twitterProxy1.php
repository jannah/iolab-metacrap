<?php 
 
 require_once('PhpConsole.php'); // This enables PHP logging to browser console https://code.google.com/p/php-console/
PhpConsole::start();
// test
 
// You MUST modify app_tokens.php to use your own Oauth tokens 
require '_OATH/app_tokens.php'; 
 
// Create an OAuth connection 
require '_OATH/tmhOAuth.php'; 
 
$connection = new tmhOAuth(array( 
 'consumer_key' => $consumer_key, 
 'consumer_secret' => $consumer_secret, 
 'user_token' => $user_token, 
 'user_secret' => $user_secret 
)); 
 
 //capture post parameters

$parameters = $_POST['parameters'];
$api = $_POST['api'];
$call_type = $_POST['type'];
$param_array = array();



foreach($parameters as $key=> $value){	
	$param_array[$key]= $value;
}


if($call_type =='GET'){
	$http_code = $connection->request('GET',$connection->url($api), $param_array); 
}elseif ($call_type == 'POST'){
	
	$http_code = $connection->request('POST', $connection->url('1.1/statuses/update'), $param_array);
}

// Get the timeline with the Twitter API 

 
// Request was successful 
if ($http_code == 200) { 
 
 // Extract the tweets from the API response 
 $tweet_data = json_decode($connection->response['response'],true); 
 
 // Accumulate tweets from results 
 $tweet_stream = ''; 
 $return_value = array();

 foreach($tweet_data as $tweet) { 
 // Add this tweet's text to the results 
 //$tweet_stream .= $tweet['text'] . '<br/><br/>'; 
 array_push($return_value, $tweet);
 } 
 
 // Send the tweets back to the Ajax request 
 echo json_encode($return_value);
 
// Handle errors from API request 
} else { 
 if ($http_code == 429) { 
 print 'Error: Twitter API rate limit reached'; 
 } else {
 print 'Error: Twitter was not able to process that request';
 } 
} 
?>