/*
   rankFunction is invoked on the onClick from the html
   Invokes createKeys which extracts the array of strings to perform searches
*/
function rankFunction() {

    // Grab the current position and run search API with location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geoSearch);
    }

    // Run separate Universal Search
    var word_list = createKeys($('#tweet-text').val());
    word_list.done(function (data) {
        var master_histogram = {};
        generateSearchHistogram(data, master_histogram, null).done(function () {
            console.log("Universal Histogram Completed");
            console.log(master_histogram);
            console.log(sortHistogram(master_histogram));
            addTagCloudToColumn(master_histogram, "Popular Tags");
        });
    });

}

/*
    geoSearch grabs the current location and invokes the hashtag popularity search with location
*/

function geoSearch(pos) {
    var crd = pos.coords;
    //console.log('Your current position is:');
    //console.log('Latitude : ' + crd.latitude);
    //console.log('Longitude: ' + crd.longitude);
    //console.log('More or less ' + crd.accuracy + ' meters.');
    var coords = crd.latitude + ',' + crd.longitude + ',20mi';
       

    var word_list = createKeys($('#tweet-text').val());
    word_list.done(function (data) {
        var master_histogram = {};
        generateSearchHistogram(data, master_histogram,coords).done(function () {
            console.log("Local Histogram Completed");
            console.log(master_histogram);
            console.log(sortHistogram(master_histogram));
            addTagCloudToColumn(master_histogram, "local Tags");
        });
    });
}

/*
   geHashTagsFromSearch invokes a single search API call with the string paramater "word" and appents to the given "master_histogram"
   Parameters:
    word as String
    master_histogram as Java Object with key:value pairs
   Returns: deferred object  
*/

function getHashTagsFromSearch(word, master_histogram) {
    return getSearchResults(word, 100).pipe(function (data) {        
        var tweets = convertToTweets(data[0]);        
        $.each(tweets, function (index, value) {
            if (value.hashtags.length > 0) {
                // console.log(value.hashtags);
                for (var counter = 0; counter < value.hashtags.length; counter++) {
                    var string_value = '#' + value.hashtags[counter];
                    addToDictionary(master_histogram, string_value);
                }
            }
        });
        //console.log("Histogram for ", word, " size ", sizeofObject(master_histogram));
        //console.log(master_histogram, "\n");
        return master_histogram;
    });
}

/*
   geHashTagsFromSearch invokes a single local search API call with the string paramater "word" and appents to the given "master_histogram"
   Parameters:
    word as String
    master_histogram as Java Object with key:value pairs
   Returns: deferred object  
*/

function getHashTagsFromLocalSearch(word, master_histogram,location) {
    return getSearchResults(word, 100,location).pipe(function (data) {
        var tweets = convertToTweets(data[0]);
        $.each(tweets, function (index, value) {
            if (value.hashtags.length > 0) {
                // console.log(value.hashtags);
                for (var counter = 0; counter < value.hashtags.length; counter++) {
                    var string_value = '#' + value.hashtags[counter];
                    addToDictionary(master_histogram, string_value);
                }
            }
        });
        //console.log("Histogram for ", word, " size ", sizeofObject(master_histogram));
        //console.log(master_histogram, "\n");
        return master_histogram;
    });
}

/*
  Ignore
*/
function findMinTwitterID(tweets) {
    var min_id = tweets[0].id;
    $.each(tweets, function (key, value) {
        if (value.id < min_id) {
            min_id = value.id;
        }
    });
    return min_id;
}

/*
    generateSearchHistogram runs a separate either local/universal search query on each of the words in the "text_list"
    Function waits until all of the API search calls are completed before returning the final deferred obejct

    Parameters:
        text_list as String Array
        master_histogram as Javascript Object array of key:value
        location as string representation of { crd.latitude + ',' + crd.longitude + ',20mi'
    Return:
        deferred object
*/

function generateSearchHistogram(text_list, master_histogram, location) {
    var histogram = {};

    if (location == null) {
        var api_call_list = $.map(text_list, function (query) {
            return getHashTagsFromSearch(query, master_histogram);
        });
        return $.when.apply($, api_call_list);
    } else {
        var api_call_list = $.map(text_list, function (query) {
            return getHashTagsFromLocalSearch(query, master_histogram,location);
        });
        return $.when.apply($, api_call_list);
    }
}

/*
    sizeofObject returns the number of top level keys 
*/

function sizeofObject(object) {
    var size=0;
    $.each(object, function () {
        size++;
    });
    return size;
}

/*
    addToDictionary

    Parameters:
        diction as Javascript object of key:value pairs
        element as string to add
*/

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

/*
    sortHistogram takes an unsorted histogram of key:value and returns an array of sorted key:value pairs

    Return:
        Array of frequency distributions decending wiht the most frequent occurences of hashtags
        Example: [ {number: 10, hashtags: [#hashtag, #hashtag]}, {number:9, hashtags: [#hashtags]}]
*/

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
    var sorted_histogram =sorted.sort(function(a,b){
        if (a.number > b.number)
            return -1;
        if (a.number < b.number)
            return 1;
        // a must be equal to b
        return 0;
    });    
    var hashtag_list = [];
    for (var counter = 0; counter < sorted_histogram.length; counter++) {
        $.each(sorted_histogram[counter].hashtags, function (key, value) {
            hashtag_list.push(value);
        });
    }
    //console.log(hashtag_list);
    //return hashtag_list;
    return sorted_histogram;
}