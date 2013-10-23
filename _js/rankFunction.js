//Rank multiplier for paired words
var PAIR_MULTIPLIER = 15;

/**
 *  rankFunction is invoked on the onClick from the html
 *  Invokes createKeys which extracts the array of strings to perform searches
 * @returns {undefined}
 */
function rankFunction()
{
    // Run separate Universal Search
    var word_list = createKeys($('#tweet-text').val());
    word_list.done(function(data) {
        var combinedList = {hashtags: new TagList(), mentions: new TagList()};
        generateSearchHistogram(data, combinedList, null).done(function() {

//            console.log(combinedList);
            combinedList.hashtags.sortTags();
            combinedList.mentions.sortTags();
            addTagCloudToColumn(combinedList.hashtags.tags, "Popular Hashtags");
            addTagCloudToColumn(combinedList.mentions.tags, "Popular Mentions");
        });
    });
}

/**
 * geHashTagsFromSearch invokes a single search API call with the string paramater "word" and appents to the given "master_histogram"
 * @param {string} word
 * @param {Array} combinedList
 * @param {number} rank_multiplier
 * @returns {unresolved} deferred object
 */
function getHashTagsFromSearch(word, combinedList, rankMultiplier)
{
    return getSearchResults(word, 100).pipe(function(data) {
        var tweets = convertToTweets(data[0]);
        var loadedTagsMentions = loadHashagsAndMentionsFromTweets(tweets);
        combinedList.hashtags.addTagList(loadedTagsMentions.hashtags, rankMultiplier);
        combinedList.mentions.addTagList(loadedTagsMentions.mentions);
        return combinedList;
    });
}

/**
 *  geHashTagsFromSearch invokes a single local search API call with the string paramater "word" and appents to the given "master_histogram"
 * @param {type} word
 * @param {TagList} master_histogram
 * @param {type} location
 * @returns {unresolved}
 */
function getHashTagsFromLocalSearch(word, combinedList, location)
{
    return getSearchResults(word, 100, location).pipe(function(data) {
        var tweets = convertToTweets(data[0]);
        var loadedTagsMentions = loadHashagsAndMentionsFromTweets(tweets);
        combinedList.hashtags.addTagList(loadedTagsMentions.hashtags);
        combinedList.mentions.addTagList(loadedTagsMentions.mentions);
        return combinedList;
    });
}


/**
 *   geHashTagsFromSearch invokes a single local search API call with the string paramater "word" and appents to the given "master_histogram"
 * @param {String} word
 * @param {Array} combinedList
 * @param {number} rank
 * @param {type} date
 * @returns {unresolved} deferred object
 */
function getHashTagsFromDateSearch(word, combinedList, rankMultiplier, date)
{
    return getSearchResultsDate(word, 100, date).pipe(function(data) {
        var tweets = convertToTweets(data[0]);
        var loadedTagsMentions = loadHashagsAndMentionsFromTweets(tweets);
        combinedList.hashtags.addTagList(loadedTagsMentions.hashtags, rankMultiplier);
        combinedList.mentions.addTagList(loadedTagsMentions.mentions);
        return combinedList;
    });
}

/*
 Ignore
 */
function findMinTwitterID(tweets)
{
    var min_id = tweets[0].id;
    $.each(tweets, function(key, value) {
        if (value.id < min_id) {
            min_id = value.id;
        }
    });
    return min_id;
}

/**
 * generateSearchHistogram runs a separate either local/universal search query on each of the words in the "text_list"
 * Function waits until all of the API search calls are completed before returning the final deferred obejct
 * @param {Array} text_list text_list as String Array
 * @param {Array} combinedList
 * @param {type} location location as string representation of { crd.latitude + ',' + crd.longitude + ',20mi'
 * @returns {unresolved} deferred object
 */
function generateSearchHistogram(text_list, combinedList, location)
{
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
            return getHashTagsFromSearch(query, combinedList, 1);
        });

        // call search query on two-word strings
        api_call_list_tuples = $.map(word_tuples, function(query) {
            return getHashTagsFromSearch(query, combinedList, PAIR_MULTIPLIER);
        });

        // call search query on single word strings for another day
        api_call_list_yesterday = $.map(text_list, function(query) {
            return getHashTagsFromDateSearch(query, combinedList, 1, getDate());
        });
        //return $.when.apply($, api_call_list);
        return $.when.apply($, api_call_list.concat(api_call_list_yesterday.concat(api_call_list_tuples)));
    } else {
        var api_call_list = $.map(text_list, function(query) {
            return getHashTagsFromLocalSearch(query, combinedList, location);
        });
        return $.when.apply($, api_call_list);
    }
}

/**
 * sizeofObject returns the number of top level keys 
 * @param {type} object
 * @returns {Number}
 */
function sizeofObject(object)
{
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
function addToDictionary(dictionary, element)
{
    if (dictionary[element] > 0)
        dictionary[element] = dictionary[element] + 1;
    else
        dictionary[element] = 1;
}
/**
 * generate ley word pairs from tweet text
 * @param {Array} string_list
 * @returns {generateKeywordPairs.new_string|Array}
 */
function generateKeywordPairs(string_list)
{
    var size = string_list.length;
    var new_string = [];
    //var new_string = string_list; // Test whether single word search quiery or two-word search word query is better

    for (var i = 0; i < size; i++)
    {
        for (var j = 0; j < size && j != i; j++)
        {
            new_string.push(string_list[i] + ' ' + string_list[j]);
        }
    }
    return new_string;
}

/**
 * get current date
 * @returns {Date|String|getDate.today}
 */
function getDate()
{
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = yyyy + '-' + mm + '-' + dd;
    return today;
}