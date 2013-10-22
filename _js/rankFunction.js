var PAIR_MULTIPLIER = 25;

/*
 rankFunction is invoked on the onClick from the html
 Invokes createKeys which extracts the array of strings to perform searches
 */
function rankFunction() {



    // Run separate Universal Search
    var word_list = createKeys($('#tweet-text').val());
    word_list.done(function(data) {
        var master_histogram = new TagList();
        generateSearchHistogram(data, master_histogram, null).done(function() {

            console.log("Universal Histogram Completed");
            master_histogram.sortTags();
            console.log(master_histogram);
           // console.log(sortHistogram(master_histogram));
            addTagCloudToColumn(master_histogram.tags, "Popular Tags");
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

function getHashTagsFromSearch(word, master_histogram, rank_multiplier) {
    return getSearchResults(word, 100).pipe(function(data) {
        var tweets = convertToTweets(data[0]);
        $.each(tweets, function(index, value) {
            if (value.hashtags.length > 0) {
                // console.log(value.hashtags);
                for (var counter = 0; counter < value.hashtags.length; counter++) {
                    var string_value = '#' + value.hashtags[counter];
                    for (var m = 0; m < rank_multiplier; m++)
                        master_histogram.addTag(string_value);
//                    addToDictionary(master_histogram, string_value);
                }
            }
        });
        //console.log("Histogram for ", word, " size ", sizeofObject(master_histogram));
        //console.log(master_histogram, "\n");
        return master_histogram;
    });
}

/**
 *  geHashTagsFromSearch invokes a single local search API call with the string paramater "word" and appents to the given "master_histogram"
 Parameters:
 word as String
 master_histogram as Java Object with key:value pairs
 Returns: deferred object  
 * @param {type} word
 * @param {TagList} master_histogram
 * @param {type} location
 * @returns {unresolved}
 */
function getHashTagsFromLocalSearch(word, master_histogram, location) {
    return getSearchResults(word, 100, location).pipe(function(data) {
        var tweets = convertToTweets(data[0]);
        $.each(tweets, function(index, value) {
            if (value.hashtags.length > 0) {
                // console.log(value.hashtags);
                for (var counter = 0; counter < value.hashtags.length; counter++) {
                    var string_value = '#' + value.hashtags[counter];
//                    addToDictionary(master_histogram, string_value);
                    master_histogram.addTag(string_value);
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
    $.each(tweets, function(key, value) {
        if (value.id < min_id) {
            min_id = value.id;
        }
    });
    return min_id;
}

/**
 *  generateSearchHistogram runs a separate either local/universal search query on each of the words in the "text_list"
 * Function waits until all of the API search calls are completed before returning the final deferred obejct
 * @param {Array} text_list text_list as String Array
 * @param {TagList} master_histogram
 * @param {type} location location as string representation of { crd.latitude + ',' + crd.longitude + ',20mi'
 * @returns {unresolved} deferred object
 */
function generateSearchHistogram(text_list, master_histogram, location) {
    /*
     var keywordPairs = generateKeywordPairs(text_list);
     if (location == null) {
     var api_call_list = $.map(text_list, function(query) {
     return getHashTagsFromSearch(query, master_histogram, 1);
     });
     return $.when.apply($, api_call_list);
     } else {
     var api_call_list = $.map(text_list, function(query) {
     return getHashTagsFromLocalSearch(query, master_histogram, location, 1 );
     });
     return $.when.apply($, api_call_list);
     }
     */


    var text_list_yesterday = [];
    var api_call_list = [];
    var api_call_list_yesterday = [];
    var api_call_list_tuples = [];
    var word_tuples = generateKeywordPairs(text_list);

    $.each(text_list, function(key, value) {
        text_list_yesterday.push(value + ' until:' + getDate());
    });

    if (location == null) {
        // call search query on single word strings
        api_call_list = $.map(text_list, function(query) {
            return getHashTagsFromSearch(query, master_histogram, 1);
        });

        // call search query on two-word strings
        api_call_list_tuples = $.map(word_tuples, function(query) {
            return getHashTagsFromSearch(query, master_histogram, PAIR_MULTIPLIER);
        });


        //console.log("%%%%%%%%%%%%%%%%%%", text_list_yesterday)
        // call search query on single word strings for another day
        api_call_list_yesterday = $.map(text_list, function(query) {
            return getHashTagsFromSearch(query, master_histogram, 1, getDate());
        });
        //return $.when.apply($, api_call_list);
        return $.when.apply($, api_call_list.concat(api_call_list_yesterday.concat(api_call_list_tuples)));
    } else {
        var api_call_list = $.map(text_list, function(query) {
            return getHashTagsFromLocalSearch(query, master_histogram, location);
        });
        return $.when.apply($, api_call_list);
    }
}

/*
 sizeofObject returns the number of top level keys 
 */

function sizeofObject(object) {
    var size = 0;
    $.each(object, function() {
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
/*
function sortHistogram(histogram) {
    var sorted = [{'number': 1, hashtags: []}];
    $.each(histogram, function(key, value) {
        // console.log("searching,", key, " ", value);
        var result = $.grep(sorted, function(item) {
            return item.number == value
        });
        //console.log("grep result ", result);
        if (result.length == 0) {
            strings = [];
            strings.push(key);
            // console.log("pushing: ", value, " and", strings);
            sorted.push({'number': value, 'hashtags': strings});
        } else if (result.length == 1) {
            //   console.log(" found it");
            result[0].hashtags.push(key);
        }
    });
    var sorted_histogram = sorted.sort(function(a, b) {
        if (a.number > b.number)
            return -1;
        if (a.number < b.number)
            return 1;
        // a must be equal to b
        return 0;
    });
    var hashtag_list = [];
    for (var counter = 0; counter < sorted_histogram.length; counter++) {
        $.each(sorted_histogram[counter].hashtags, function(key, value) {
            hashtag_list.push(value);
        });
    }
    //console.log(hashtag_list);
    //return hashtag_list;
    return sorted_histogram;
}
*/

function generateKeywordPairs(string_list) {
    var size = string_list.length;
    var new_string = [];
    //var new_string = string_list; // Test whether single word search quiery or two-word search word query is better
   /* if (size > 1) {
        for (var counter = 1; counter < size; counter++) {
            new_string.push(string_list[counter - 1] + ' ' + string_list[counter]);
        }
    } else {
        new_string = string_list;
    }
    // console.log("###############", new_string);
    */
    for(var i =0;i<size;i++)
    {
        for(var j = 0;j<size && j!=i;j++)
        {
            new_string.push(string_list[i]+' '+string_list[j]);
        }
    }
    
    console.log(string_list);
    return new_string;
}


function getDate() {

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!

    var yyyy = today.getFullYear();
    if (dd < 10) { dd = '0' + dd } if (mm < 10) { mm = '0' + mm } today = yyyy + '-' + mm + '-' + dd;

    //console.log("&&&&&&&&&&&&&&&&" +today);
    return today;
}