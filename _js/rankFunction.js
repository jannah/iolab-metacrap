 
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
        var word_list = createKeys($('#tweet-text').val());
        word_list.done(function (data) {
            var master_histogram = {};
            generateSearchHistogram(data, master_histogram).done( function(){
                console.log("Master Histogram Completed");
                console.log(master_histogram);
                sortHistogram(master_histogram);
            });

        });
    });

    


    //var histogram_universe = {};
    //var histogram_local = {};

    //deferredObject = callTwitterAPI(parameters,api);
    //deferredObject.done(function (data) {
    //    console.log("Equivalent Search API using generic API CALL");
    //    console.log(data);
    //    tweets = convertToTweets(data[0]);        
    //    console.log("Local Results &&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
    //    $.each(tweets, function (index, value) {

    //        if (value.hashtags.length > 0) {
    //            //console.log(value.hashtags);
    //            for (var counter = 0; counter < value.hashtags.length; counter++) {
    //                addToDictionary(histogram_local, value.hashtags[counter]);
    //            }
    //        }
    //    });
    //    console.log("Local: " , histogram_local);
    //    console.log("\n");
    //});

    //get results from a Twitter Query without geolocation    


    
    $('#histogram').append( "<li> something here </li>");
 
	
    
}

function getHashTagsFromSearch(word, master_histogram) {

    return getSearchResults(word, 100).pipe(function (data) {        
        var tweets = convertToTweets(data[0]);
        $.each(tweets, function (index, value) {
            if (value.hashtags.length > 0) {
                // console.log(value.hashtags);
                for (var counter = 0; counter < value.hashtags.length; counter++) {
                    addToDictionary(master_histogram, value.hashtags[counter]);
                }
            }
        });
        console.log("Histogram for ", word, " size ", sizeofObject(master_histogram));
        console.log(master_histogram, "\n");
        return master_histogram;
    });
}

function generateSearchHistogram(text_list, master_histogram) {
    var histogram = {};
    var api_call_list = $.map(text_list, function (query) {
        return getHashTagsFromSearch(query, master_histogram);
    });

    return $.when.apply($, api_call_list);
}


function print_histogram(dom_location, histogram) {
    
    var text = "<li> ";
    $.each(histogram, function (key, value) {
        text += "[" + key + ":" + value + "]" + "  ";
    });
    text += " </li>";
    $('#histogram_list').append("<li> something here </li>");

}

function sizeofObject(object) {
    var size=0;
    $.each(object, function () {
        size++;
    });
    return size;
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

function sortHistogram(histogram) {
    var sorted = [{ 'number': 1, hashtags: [] }];
    $.each(histogram, function (key, value) {
       // console.log("searching,", key, " ", value);
        var result = $.grep(sorted, function (item) { return item.number == value });
        //console.log("grep result ", result);
        if (result.length == 0) {
            strings =[];
            strings.push(key);
           // console.log("pushing: ", value, " and", strings);
            sorted.push({ 'number': value, 'hashtags': strings });
        } else if (result.length == 1) {
         //   console.log(" found it");
            result[0].hashtags.push(key);
        }
    });
    var temp =sorted.sort(function(a,b){
        if (a.number > b.number)
            return -1;
        if (a.number < b.number)
            return 1;
        // a must be equal to b
        return 0;
    });
    console.log(temp);
    return sorted;
}