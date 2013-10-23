
/*
 
 Uses a php proxy file:  twitterProxy1.php
 
 Using twitter Library: https://dev.twitter.com/docs/api/1.1 
 Required Files:
 _OATH/tmhOAuth.php
 _OATH/app_tokens.php
 
 */


/**
 * Get dummy user homeline 
 * @param {type} count # of tweets to lookup
 * @returns {unresolved} deferred object that when invoked returns status of post
 */
function getHomeTimeline(count) 
{
    var api = '1.1/statuses/home_timeline';
    parameters = {"count": count};
    return callTwitterAPI(parameters, api).pipe(function(data) {
        return data;
    },
            function(data) {
                console.log("API Call Failed");
                return [];
            });
}

/**
 * 
 * @param {type} username username tolookup timeline
 * @param {type} count # of tweets to lookup
 * @returns {unresolved}  deferred object that when invoked returns array of tweets
 */
function getUserTimeline(username, count) 
{
    var api = '1.1/statuses/user_timeline';
    parameters = {'screen_name': username, 'count': count};

    return callTwitterAPI(parameters, api).pipe(function(data) {
        return data;
    },
            function(data) {
                console.log("API Call Failed");
                return [];
            });
}

/**
 * 
 * @param {type} query_string string to use for twitter query
 * @param {type} count # of tweets to lookup
 * @returns {jqXHR}  deferred object that when invoked returns array of tweets
 */
function getSearchResults(query_string, count) 
{

    api = '1.1/search/tweets';
    parameters = {'q': urlencode(query_string), 'count': count};
//    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>..string " + query_string + "url encode " + urlencode(query_string));
    return callTwitterAPI(parameters, api);
}
/**
 * @param {String} query_string string to use for twitter query
 * @param {Number} count # of tweets to lookup
 * @param {String} location
 * @return {jqXHR}  deferred object that when invoked returns array of tweets
 */
function getSearchResults(query_string, count, location) 
{

    api = '1.1/search/tweets';
    parameters = {
        'q': urlencode(query_string),
        'count': count,
        'geolocation': location
    };
//    console.log("string " + query_string + "url encode " + urlencode(query_string));
    return callTwitterAPI(parameters, api);
}
/**
 * 
 * @param {type} query_string
 * @param {type} count
 * @param {type} date
 * @returns {jqXHR}
 */
function getSearchResultsDate(query_string, count, date) {

    api = '1.1/search/tweets';
    parameters = {
        'q': urlencode(query_string),
        'count': count,        
        'until':date
    };
    //console.log("string " + query_string + "url encode " + urlencode(query_string));
    return callTwitterAPI(parameters, api);
}



/**
 * 
 * @param {number} lat
 * @param {number} long
 * @param {number} radius in miles
 * @returns {String}
 */
function parseTwitterLocation(lat, long, radius)
{
    return lat + ',' + long + ',' + radius + 'mi';
}


/*    Inital twitter API Interface
 (Java Object) parameters_input => Is a Javascript object containing tuples of key:value pairs corresponding to twitter parameter name: parameter value. 
 (String) api_input => String representatin of the type of desired API call. Within the API reference, is of form "1.1/<name of twitter api call>" from https://dev.twitter.com/docs/api/1.1
 Return Value: Deferred Object. See above for how to invoke*/

var CALL_USER_TIMELINE = '1.1/statuses/user_timeline';

/**
 * Call twitter api
 * @param {type} parameters_input
 * @param {type} api_input
 * @returns {jqXHR}
 */
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
        success: function(data, textStatus, xhr) {
            console.log("Twitter Call Successful " + api_input);
        },
        error: function(xhr, textStatus, errorThrown) {
            console.log("Twitter Call Failed " + api_input);
        }
    });
}



/**
 * Post tweet to Twitter
 * @param {String} status_update status_update: string to use for twitter query  
 * @returns {jqXHR}deferred object that when invoked returns status of post
 */
function postTweet(status_update) {
    var api_details = {
        parameters: {"status": status_update},
        api: '1.1/statuses/update',
        type: 'POST'
    }
    return $.ajax({
        url: '_js/twitterProxy1.php',
        type: 'POST',
        dataType: 'json',
        data: api_details,
        success: function(data, textStatus, xhr) {
            console.log("Twitter Call Successful");
        }, error: function(xhr, textStatus, errorThrown) {
            console.log("Twitter Post Failed");
        }
    });
}


/**
 * Encode URL string
 *@param {string} str 
 */
function urlencode(str)
{
    str = (str + '').toString();

    // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
    // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
            replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '%20');
}