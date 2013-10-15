

/*
    Inital twitter API Interface
    (Java Object) parameters_input => Is a Javascript object containing tuples of key:value pairs corresponding to twitter parameter name: parameter value. 
    (String) api_input => String representatin of the type of desired API call. Within the API reference, is of form "1.1/<name of twitter api call>" from https://dev.twitter.com/docs/api/1.1
    Return Value: Deferred Object. See above for how to invoke

    Uses a php proxy file. 

    Using twitter Library: https://dev.twitter.com/docs/api/1.1 
    Required Files:
        _OATH/tmhOAuth.php
        _OATH/app_tokens.php

*/

var CALL_USER_TIMELINE = '1.1/statuses/user_timeline';

function callTwitterAPI(parameters_input, api_input) {
    var api_details = {
        parameters: parameters_input,
        api: api_input
    }
    return $.ajax({
        url: '_js/twitterProxy1.php',
        type: 'POST',
        dataType: 'json',
        data: api_details,
        success: function (data, textStatus, xhr) {
            console.log("Twitter Call Successful");
        }
    });
}