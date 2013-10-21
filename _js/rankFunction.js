 
/*
    Example to call the API as a deferred object.
    Please reference twitterAPI.js for interface
*/
var current_position;

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

function rankFunction() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(geoSearch);
    }
                    
   
    var word_list = createKeys($('#tweet-text').val());
    word_list.done(function (data) {
        var master_histogram = {};
        generateSearchHistogram(data, master_histogram,null).done( function(){
            console.log("Universal Histogram Completed");
            console.log(master_histogram);
            console.log(sortHistogram(master_histogram));        
            addTagCloudToColumn(master_histogram, "Popular Tags");
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
    
}

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

function findMinTwitterID(tweets) {
    var min_id = tweets[0].id;
    $.each(tweets, function (key, value) {
        if (value.id < min_id) {
            min_id = value.id;
        }
    });
    return min_id;
}

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