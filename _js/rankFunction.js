 
/*
    Example to call the API as a deferred object.
    Please reference twitterAPI.js for interface
*/

function rankFunction() {

    
    console.log("Testing API Call???");

/* 
    Any Twitter "Get" Call can be generalized and called with the callTwitterAPI(paramenters, api) function
    See the examples here for the helper functions which basically format and call the callTwitterAPI function correctly
    This allows you to invoke the full range of optional parameters for each Twitter API Call generically.
*/
     //get user timline


	
    //get results from a Twitter Query with geolocations    
    // format 'lat, long, distance' 37.872516,-122.260844 is location of UC Berkeley 
    //deferredObject = getSearchResults('nobel prize berkeley', 5, location);
    //deferredObject.done(function (data) {
    //    console.log("Search Query Data");
    //    //console.log(data);
    //    console.log("\n");
    //});

    var location = { 'geocode': "37.872516,-122.260844, 1mi" }
    var query = "hot dog";
    var count = 100;
    var tweets;
     //equivalent to generic api call:
    var api = '1.1/search/tweets';
    parameters = {
        'q': urlencode(query), // twitter search api requires URL encoded string urlencode(string) is a helper function
        'count': count,
        'geolocation': location
    };


    //
    $('#tweet-tag-suggest').click(function () {
        var word_list = createKeys();
        word_list.done(function (data) {
            console.log(data);
        });
    });

    


    var histogram_universe = {};
    var histogram_local = {};

    deferredObject = callTwitterAPI(parameters,api);
    deferredObject.done(function (data) {
        console.log("Equivalent Search API using generic API CALL");
        console.log(data);
        tweets = convertToTweets(data[0]);        
        console.log("Local Results &&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
        $.each(tweets, function (index, value) {

            if (value.hashtags.length > 0) {
                //console.log(value.hashtags);
                for (var counter = 0; counter < value.hashtags.length; counter++) {
                    addToDictionary(histogram_local, value.hashtags[counter]);
                }
            }
        });
        console.log("Local: " , histogram_local);
        console.log("\n");
    });

    //get results from a Twitter Query without geolocation    
    deferredObject = getSearchResults(query, count);
    deferredObject.done(function (data) {
        console.log("Universe Search Query Data");

        console.log("Equivalent Search API using generic API CALL");
        console.log(data);
        tweets = convertToTweets(data[0]);
        console.log("Universal Results @@@@@@@@@@@@@@@@@@@@@");
        $.each(tweets, function (index, value) {

            if (value.hashtags.length > 0) {
               // console.log(value.hashtags);
                for (var counter = 0; counter < value.hashtags.length; counter++) {
                    addToDictionary(histogram_universe, value.hashtags[counter]);
                }
            }
        });
        console.log("Universe: ", histogram_universe);
        console.log("\n");

        print_histogram("#histogram_list", histogram_universe);
    });



    // //post Tweet
    // //return error if you try to tweet the same tweet text twice 
    //var tweet = 'Go Bears!';
    //var deferredObject = postTweet(tweet);
    //deferredObject.done(function (data) {
    //    console.log("Post Data");
    //    console.log(data);
    //});
	
    
}

function print_histogram(dom_location, histogram) {
    var text= "<li> ";
    $.each(histogram, function (key, value) {
        text += "[" + key + ":" + value + "]" + "  ";
    });
    text += " </li>";
    $(dom_location).append(text);

}

function addToDictionary(dictionary, element) {
    //console.log(dictionary, element, dictionary[element]);
    if (dictionary[element] > 0) {
      //  console.log("updating " + element)
        dictionary[element] = dictionary[element] + 1;
    } else {        
        //console.log("adding " + element);
        dictionary[element] = 1;
    }

}