<?php
if(isset($_POST['jsonkey']) && !empty($_POST['jsonkey'])){
	$keys=$_POST['jsonkey'];
	$common_words = file('_js/common_words.txt', FILE_IGNORE_NEW_LINES);
	$common_words = array_flip($common_words);
	$i=0;
	$new_keys=array();
	foreach($keys as $key){
		if(!isset($common_words[$key]))
			array_push($new_keys, $key);
	}
	echo json_encode($new_keys); 
}
?>