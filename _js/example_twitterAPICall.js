// JavaScript source code
/*
    Example to call the API as a deferred object.
    Please reference twitterAPI.js for interface
*/

//$(document).ready(function () {


    
//    console.log("Testing API Call???");

/* 
    Any Twitter "Get" Call can be generalized and called with the callTwitterAPI(paramenters, api) function
    See the examples here for the helper functions which basically format and call the callTwitterAPI function correctly
    This allows you to invoke the full range of optional parameters for each Twitter API Call generically.
*/
    // get user timline
//    var deferredObject = getUserTimeline("UCBerkeley", 10);
//    deferredObject.done(function (data) {
//        console.log("User Timeline Data:");
//        console.log(data);
//        console.log("\n");
//    });
    // equivalent to generic api call:

    //testTwitterUsertimeline();
   /* console.log("Testing API Call");

    var parameters = { 'screen_name': 'UCBerkeley', 'count': 100 };
>>>>>>> master
    var api = '1.1/statuses/user_timeline';
    var parameters = { 'screen_name': "UCBerkeley", 'count': 10 };
    deferredObject = callTwitterAPI(parameters, api);
    deferredObject.done(function (data) {
        console.log("Equivalent User Timeline Data using generic API CALL");
        console.log(data);
        console.log("\n");
    });

    // get home timeline
    deferredObject = getHomeTimeline(20);
    deferredObject.done(function (data) {
        console.log("Home Timeline Data)");
        console.log(data);
        console.log("\n");
    });

    // equivalent to generic api call:
    var api = '1.1/statuses/home_timeline';
    var parameters = { 'count': 10 };
    deferredObject = callTwitterAPI(parameters, api);
    deferredObject.done(function (data) {
        console.log("Equivalent Home Timeline Data using generic API CALL");
        console.log(data);
        console.log("\n");
    });

	
    //get results from a Twitter Query with geolocation
    var location = { 'geocode': "37.872516,-122.260844, 2mi" }
    // format 'lat, long, distance' 37.872516,-122.260844 is location of UC Berkeley 
    deferredObject = getSearchResults('nobel prize berkeley', 5, location);
    deferredObject.done(function (data) {
        console.log("Search Query Data");
        console.log(data);
        console.log("\n");
    });


    // equivalent to generic api call:
    var api = '1.1/search/tweets';
    parameters = {
        'q': urlencode('nobel prize berkeley'), // twitter search api requires URL encoded string urlencode(string) is a helper function
        'count': 5,
        'geolocation': location
    };
    deferredObject = callTwitterAPI(parameters, api);
    deferredObject.done(function (data) {
        console.log("Equivalent Search API using generic API CALL");
        console.log(data);
        console.log("\n");
    });

    //get results from a Twitter Query without geolocation    
    deferredObject = getSearchResults('nobel', 5);
    deferredObject.done(function (data) {
        console.log("Search Query Data");
        console.log(data);
        console.log("\n");
    });






<<<<<<< HEAD
    // post Tweet
    // return effor if you try to tweet the same tweet text twice 
    var tweet = 'Go Bears!';
    var deferredObject = postTweet(tweet);
    deferredObject.done(function (data) {
        console.log("Post Data");
        console.log(data);
    });
	
=======
    });*/
//});