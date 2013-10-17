
/*

    Uses a php proxy file:  twitterProxy1.php

    Using twitter Library: https://dev.twitter.com/docs/api/1.1 
    Required Files:
        _OATH/tmhOAuth.php
        _OATH/app_tokens.php

*/

/*
    (String) username: username to lookup timeline
    (int) count: # of tweets to lookup
    return value => deferred object that when invoked returns array of tweets
*/

function getHomeTimeline(count) {
    var api = '1.1/statuses/home_timeline';
    parameters = {"count": count};
    return callTwitterAPI(parameters, api).pipe(function (data) {
        return data;
    },
    function (data) {
        console.log("API Call Failed");
        return [];
    });

}


/*
    (String) username: username to lookup timeline
    (int) count: # of tweets to lookup
    return value => deferred object that when invoked returns array of tweets
*/

function getUserTimeline(username, count) {    
    var api = '1.1/statuses/user_timeline';
    parameters = { 'screen_name': username, 'count': count };
    
    return callTwitterAPI(parameters, api).pipe(function (data) {        
        return data;
    },
    function (data) {
        console.log("API Call Failed");
        return [];
    });
}


/*
    (String) query_string: string to use for twitter query
    (int) count: # of tweets to lookup
    return value => deferred object that when invoked returns array of tweets
*/

function getSearchResults(query_string, count){

    api = '1.1/search/tweets';
    parameters = { 'q': urlencode(query_string), 'count': count };
    console.log("string " + query_string + "url encode " + urlencode(query_string));
    return callTwitterAPI(parameters, api);
}

function getSearchResults(query_string, count, location) {

    api = '1.1/search/tweets';
    parameters = {
        'q': urlencode(query_string),
        'count': count,
        'geolocation': location
    };
    //console.log("string " + query_string + "url encode " + urlencode(query_string));
    return callTwitterAPI(parameters, api);
}



/*    Inital twitter API Interface
    (Java Object) parameters_input => Is a Javascript object containing tuples of key:value pairs corresponding to twitter parameter name: parameter value. 
    (String) api_input => String representatin of the type of desired API call. Within the API reference, is of form "1.1/<name of twitter api call>" from https://dev.twitter.com/docs/api/1.1
    Return Value: Deferred Object. See above for how to invoke*/

function callTwitterAPI(parameters_input, api_input) {
    var api_details = {
        parameters: parameters_input,
        api: api_input,
        type: 'GET'
    }    
    return $.ajax({
        url: '_js/twitterProxy1.php',
        type: 'POST',
        dataType: 'json',
        data: api_details,
        success: function (data, textStatus, xhr) {
            console.log("Twitter Call Successful " + api_input);
        },
        error: function (xhr, textStatus, errorThrown) {
            console.log("Twitter Call Failed " + api_input);
        }
    });
}


/*
    (String) status_update: string to use for twitter query    
    return value => deferred object that when invoked returns status of post
*/

function postTweet(status_update) {
    var api_details = {
        parameters: { "status": status_update },
        api: '1.1/statuses/update',
        type: 'POST'
    }
    return $.ajax({
        url: '_js/twitterProxy1.php',
        type: 'POST',
        dataType: 'json',
        data: api_details,
        success: function (data, textStatus, xhr) {
            console.log("Twitter Call Successful");
        }, error: function(xhr, textStatus, errorThrown) {
        console.log("Twitter Post Failed");
    }
    });
}



function urlencode(str) {
    // http://kevin.vanzonneveld.net
    // +   original by: Philip Peterson
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: AJ
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: travc
    // +      input by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Lars Fischer
    // +      input by: Ratheous
    // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Joris
    // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
    // %          note 1: This reflects PHP 5.3/6.0+ behavior
    // %        note 2: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
    // %        note 2: pages served as UTF-8
    // *     example 1: urlencode('Kevin van Zonneveld!');
    // *     returns 1: 'Kevin+van+Zonneveld%21'
    // *     example 2: urlencode('http://kevin.vanzonneveld.net/');
    // *     returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
    // *     example 3: urlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
    // *     returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'
    str = (str + '').toString();

    // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
    replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}