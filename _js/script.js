/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(function() {
    init();

});

function init() {
//    test();
    eventSubmitTweet();
    eventUpdateTweetCount();
    logonToTwitter();
    loadHomeLine();
    google.maps.event.addDomListener(window, 'load', initializeMap);
    hideMap();

//    loadTweetsByScreenName('UCBerkeley');


}

var MY_TAGS_COLUMN = 'My Tags';
var MY_MENTIONS_COLUMN = 'My Mentions';
var FRIENDS_TAGS_COLUMN = 'Friend tags';
var FRIENDS_MENTIONS_COLUMN = 'Friend mentions';
var NEAR_TAGS_COLUMN = 'Nearby tags';
var NEAR_MENTIONS_COLUMN = 'Nearby mentions';
var map;
var TWEET_AREA_TEXT = '#tweet-text';
var TWEET_LIMIT = 140;
var DISPLAYED_TAGS_LIMIT = 10;
var TagListTypes = {Tags: '#', Mentions: '@'};
var currentPosition = {'lat': 0, 'long': 0};



/*----------------------------------------------
 *                  TagList Object              |
 *----------------------------------------------*/
/**
 * Tag List Object to manage lists of tags and mentions
 * @returns {TagList}
 */
function TagList()
{
    this.title = '';
    this.type;
    this.tags = {};
    this.tagLocations = {};

    this.column;
    this.addTag = addTag;
    this.sortTags = sortTags;
    this.addTagLocation = addTagLocation;
    this.addTagList = addTagList;
}


/**
 * add a tag to the tag list and update its frequency
 * @param {type} tag
 * @param {number} rankMultiplier (Optional)
 * @returns {undefined}
 */
function addTag(tag/*, rankMultiplier*/)
{
    var rank = (arguments.length === 2) ? arguments[1] : 1;
    if (tag in this.tags)
    {
//        var value = this.tags[tag];
//        value += rank;
        this.tags[tag] += rank;
    }
    else
        this.tags[tag] = rank;
}
/**
 * adds a taglist to tags
 * @param {TagList} tagList
 * @param {number} rankMultiplier (Optional)
 * @returns {undefined}
 */
function addTagList(tagList/*, rankMultiplier*/)
{
    var rank = (arguments.length === 2) ? arguments[1] : 1;
    console.log('Rank=' + rank);
    for (var tag in tagList.tags)
    {
        if (tag in this.tags)
            this.tags[tag] += (tagList.tags[tag] * rank);
        else
            this.tags[tag] = (tagList.tags[tag] * rank);

    }

}
/**
 * Add tag location to list
 * @param {type} tag
 * @param {type} coordinates
 * @returns {undefined}
 */
function addTagLocation(tag, coordinates)
{
    if (tag in this.tagLocations)
    {
        var value = this.tagLocations[tag].frequency;
        value++;
        this.tagLocations[tag].frequency = value;
    }
    else
    {
        this.tagLocations[tag] = {'frequency': 1, 'coordinates': []};
    }
    this.tagLocations[tag].coordinates.push(coordinates);
}
/**
 * Sort Tags in TagList based on frequency
 * @returns {sortTags}
 */
function sortTags()
{
    var sorted = [];
    for (var key in this.tags)
        sorted.push([key, this.tags[key]]);
    sorted.sort(function(a, b) {
        a = a[1];
        b = b[1];
        return a > b ? -1 : (a < b ? 1 : 0);
    });
    this.tags = {};
    for (var i = 0; i < sorted.length; i++) {
        var key = sorted[i][0];
        var value = sorted[i][1];
        this.tags[key] = value;
    }
}

/**
 * Format a tag/mention for a list (No Cloud)
 * @param {String} item
 * @returns {String}
 */
function formatItemForList(item) {
    var str = '<label>';
    str += item;
    str += '</label>';
    return str;
}
/**
 * Format the cloud tag for an array fo tags or mentions
 * @param {Array} tags
 * @returns {String}
 */
function formatCloudTag(tags)
{
    var maxFontSize = 2;
    var minFontSize = .75;
    var maxOpacity = 1;
    var minOpacity = .6;
    var fontSizeUnit = 'em';
    var cloud = [];
    var maxSize = 0;
    var minSize = 100000000;
    for (var key in tags)
    {
        var frequency = tags[key];
        if (frequency > maxSize)
            maxSize = frequency;
        if (frequency < minSize)
            minSize = frequency;
    }
    for (var key in tags)
    {
        var frequency = tags[key];
        var fontSize = (frequency - minSize) / (maxSize - minSize) * (maxFontSize - minFontSize) + minFontSize;
        var opacity = maxOpacity * (frequency - minSize) / (maxSize - minSize) + minOpacity;
        var str = "<label class='tag' style='font-size:" + fontSize + fontSizeUnit + ";opacity:" + opacity + ";'>";
        str += key;
        str += '</label>';
        cloud.push(str);
    }
    return cloud;
}

/**
 * Add a Tag Cloud to a Column
 * @param {Array} tags
 * @param {String} header
 * @returns {undefined}
 */
function addTagCloudToColumn(tags, header)
{
    var cloud = formatCloudTag(tags);
    var column = addColumnToSuggestions(header);
    for (var i = 0, j = cloud.length; i < j; i++)
    {
        var itemHTML = $(cloud[i]);
        $(column).append(itemHTML);
        $(column).children('.tag').last().addClass('tag-hidden').hide();
    }
    eventAppendItemToTweet();
}
/**
 * Add a new column to suggestions
 * @param {string} header
 * @returns {jQuery}
 */
function addColumnToSuggestions(header)
{
    var itemHTML = $("<li class='suggestion-column area'>"
            + "<h2>"
            + "<label class='area-header'>"
            + header
            + "</label>"
            + "</h2>"
            + "<input type='button' class='view-more-tags-button' value='+'/>"
            + "<input type='button' class='hide-tags-button' value='hide'/>"
            + "<input type='button' class='view-less-tags-button' value='-'/><br>"
            + "</li>");
    itemHTML.addClass('suggestion-column')
            .addClass('area');
    $('#suggestions-list').prepend(itemHTML);
    var column = $('#suggestions-list .suggestion-column').first();
    $(column).find('.area-header').addClass('area-header-new');
    column.hide().fadeIn(500);

    eventViewMoreTags();
    eventViewLessTags();
    eventHideTagsColumn();
    return column;
}
/*----------------------------------------------
 *                  Events                      |
 *----------------------------------------------*/
/**
 * event to append  a clicked mention or hashtag to the tweet text
 * @returns {undefined}
 */
function eventAppendItemToTweet()
{

    $('.tag').unbind('click');
    $('.tag').click(function() {

        var original_value = $(TWEET_AREA_TEXT).val();
        var text = $(this).text();

        if (original_value.indexOf(text) === -1 || original_value.length === 0)
        {
            if (original_value.length > 0)
                text = ' ' + text;
            $(TWEET_AREA_TEXT).val(original_value + text);
        }
        else
            alert(text + ' already exists in tweet');
        updateTweetCount();
    });
}
/**
 * event to submit a new tweet
 * TODO
 * @returns {undefined}
 */
function eventSubmitTweet()
{
    $('#tweet-submit').click(function() {
        var tweet = $('#tweet-text').val();
        postTweet(tweet);
        $('#tweet-text').val('');
        return false;
//        alert('Submitting tweet:\n' + tweet);
    });
}
/**
 *  event to update the tweet count
 * @returns {undefined}
 */
function eventUpdateTweetCount()
{
    var lbl = $('#tweet-length-label');
    lbl.text(TWEET_LIMIT + ' left');
    $('#tweet-text').bind('input propertychange', function(event, previousText)
    {
        updateTweetCount();
    });
}
/**
 * event to show more tags in a column
 * @returns {undefined}
 */
function eventViewMoreTags()
{
    $('.view-more-tags-button').unbind('click');
    $('.view-more-tags-button').click(function()
    {
        $(this).parent().find('.area-header-new').removeClass('area-header-new');
        var tags = $(this).siblings('.tag-hidden');

        for (var i = 0, m = tags.length; i < m && i < DISPLAYED_TAGS_LIMIT;
                i++)
        {
            var tag = tags.get(i);
            $(tag).removeClass('tag-hidden');
            $(tag).addClass('tag-shown');
            $(tag).fadeIn(500);
        }
        return false;
    });
}
function eventViewLessTags()
{
    $('.view-less-tags-button').unbind('click');
    $('.view-less-tags-button').click(function()
    {
        var tags = $(this).siblings('.tag-shown');

        for (var i = 0, m = tags.length - 1; m >= 0 && i < DISPLAYED_TAGS_LIMIT;
                i++, m--)
        {
            var tag = tags.get(m);
            $(tag).addClass('tag-hidden');
            $(tag).removeClass('tag-shown');
            $(tag).hide();
        }
        return false;
    });
}
function eventHideTagsColumn()
{
    $('.hide-tags-button').unbind('click');
    $('.hide-tags-button').click(function() {
        $(this).parent('.suggestion-column').fadeOut(500);
        ;
    });
}
/**
 * Event to toggle map view
 * @returns {undefined}
 */
function eventToggleMap()
{
    if ($('#map-canvas').is(':visible'))
    {
        hideMap();
    }
    else
    {
        showMap();
    }
}
/**
 * hide Site Help Box
 * @returns {undefined}
 */
function eventHideSiteHelp() {
    $('#site-help').fadeOut(500);
}
/*----------------------------------------------
 *            Twitter Actions                  |
 *----------------------------------------------*/
/**
 *update the tweet character count
 * @returns {undefined}
 */
function updateTweetCount()
{
    var lbl = $('#tweet-length-label');
    var text = TWEET_LIMIT - parseInt($('#tweet-text').val().length);
    lbl.text(text + ' left');
    if (text < 0) {
        lbl.css('color', 'red');
    }
    else {
        lbl.css('color', 'black');
    }
}

/**
 * Simulates user logon to twitter. Currently loads users line by username.
 * @returns {undefined}
 */
function logonToTwitter()
{
    $('#logon-submit').click(function() {
        var username = $('#logon-username').val();
        var password = $('#logon-password').val();
        loadTweetsByScreenName(username);

        return false;
    });
}

/**
 * Retrieve user timeline from twitter by screen_name
 * @param {String} screen_name
 * @returns {undefined}
 */
function loadTweetsByScreenName(screen_name)
{
    var parameters = {'screen_name': screen_name, 'count': 500};
    var deferredObject = callTwitterAPI(parameters, CALL_USER_TIMELINE);
    deferredObject.done(function(data) {
        var tweets = convertToTweets(data);
        processTweetsData(tweets, '@' + screen_name + ' mentions', '@'
                + screen_name + ' tags');

        addTweetsToPreview(tweets);
    });
}

/**
 * Load the homeline of Dummy User
 * @returns {undefined}
 */
function loadHomeLine()
{
    var deferredObject = getHomeTimeline(800);
    deferredObject.done(function(data) {
        var tweets = convertToTweets(data);
        processTweetsData(tweets, FRIENDS_MENTIONS_COLUMN, FRIENDS_TAGS_COLUMN);
    });
}
/**
 * Load tweets based on a given location
 * @param {String} lat
 * @param {String} long
 * @param {String} query
 * @param {number} radius
 * @returns {undefined}
 */
function loadTweetsByLocation(lat, long, query, radius)
{
    console.log('loading tweets around ' + lat + ',' + long);
    var deferredObject = getSearchResults(query, 800, parseTwitterLocation(lat, long, radius));
    deferredObject.done(function(data) {
        console.log(data);

        var tweets = convertToTweets(data[0]);

        processTweetsData(tweets, NEAR_MENTIONS_COLUMN, NEAR_TAGS_COLUMN);
    });
}
/**
 * Process data from tweets and adds a tag cloud
 * @param {Array} tweets
 * @param {string} mentionColumn
 * @param {string} hashColumn
 * @returns {undefined}
 */
function processTweetsData(tweets, mentionColumn, hashColumn)
{
    //      addTweetsToPreview(tweets);
    addTweetsToMap(tweets);
    var loadedTagsMentions = loadHashagsAndMentionsFromTweets(tweets, 1);
    var mentions = loadedTagsMentions.mentions;
    var hashtags = loadedTagsMentions.hashtags;
    mentions.sortTags();
    hashtags.sortTags();
    if (mentionColumn)
    {
        mentions.column = mentionColumn;
        addTagCloudToColumn(mentions.tags, mentions.column);
    }
    if (hashColumn)
    {
        hashtags.column = hashColumn;
        addTagCloudToColumn(hashtags.tags, hashtags.column);
    }
//    return 
}

/**
 * Create key words
 * @param {type} text
 * @returns {jqXHR}
 */
function createKeys(text)
{
//    console.log(text);
    var patt1 = new RegExp("http");
    var patt2 = /\w+\W+\w+/;
    var patt3 = /\W(\W+)/;
    var patt4 = /\W/
    var keys = new Array();
    var f_words = text.split(" ");
    var words = new Array();
    for (var i = 0; i < f_words.length; i++) {
        if (patt3.test(f_words[i]) && !patt1.test(f_words[i])) {
            f_words[i] = f_words[i].split(patt3)[0];
            words.push(f_words[i]);
        }
        else if (patt2.test(f_words[i]) && !patt1.test(f_words[i]))
        {
            var temp = f_words[i].split(patt4);
            words.push(temp[0]);
            words.push(temp[1]);
        }
        else
            words.push(f_words[i]);

    }
    for (var i = 0; i < words.length; i++) {
        if (words[i].length > 3 && words[i].substr(0, 1) != "#" && words[i].substr(0, 1) != "@" && !patt1.test(words[i])) {
            keys.push(words[i])
        }
        for (var k = 0; k < keys.length; k++) {
            keys[k] = keys[k].toLowerCase();
        }
    }
    return returnKeys(keys);
}
/**
 * returns Twitter Keys
 * @param {type} keys
 * @returns {jqXHR}
 */
function returnKeys(keys) {
    return $.ajax({
        url: 'keys.php',
        type: "POST",
        dataType: "json",
        data:
                {'jsonkey': keys},
        success: function(data) {
//            console.log(data);
        },
        error: function(data) {

        }
    });
}
/*----------------------------------------------
 *                  Map Actions                 |
 *----------------------------------------------*/
/**
 * Initialize Map
 * @returns {undefined}
 */
function initializeMap()
{
    if (navigator.geolocation)
    {
        return navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert("Geolocation is not supported by this browser.");
        return;
    }
}
/**
 * Show current position on map
 * @param {position} position
 * @returns {undefined}
 */
function showPosition(position)
{
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    currentPosition.lat = lat;
    currentPosition.long = lon;
    centerMap(lat, lon);
    var title = "You are here! (at least within a "
            + position.coords.accuracy + " meter radius)";
    addMarkerToMap(lat, lon, title);
    loadTweetsByLocation(lat, lon, 3);
}
/**
 * Add marker to map by latitude and longitude
 * @param {number} lat
 * @param {number} long
 * @param {string} title
 * @returns {undefined}
 */
function addMarkerToMap(lat, long, title)
{
    var latlng = new google.maps.LatLng(lat, long);
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: title
    });

    console.log('Marker added\t' + latlng + "\t" + title);
}
/**
 * Center the map to specified coordinates
 * @param {string} lat
 * @param {string} long
 * @returns {undefined}
 */
function centerMap(lat, long)
{
    var latlng = new google.maps.LatLng(lat, long);
    var mapOptions = {
        center: latlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);

//    console.log('Map centered to ' + latlng);
}

/**
 * adds tweet location markers to MAP
 * Currently not functional because of limieted location data from twitter
 * @param {Array} tweets
 * @returns {undefined}
 */
function addTweetsToMap(tweets)
{
    for (var i = 0, j = tweets.length; i < j; i++)
    {
        var tweet = new Tweet();
        tweet = tweets[i];

        if (tweet.coordinates)
        {
//            console.log('adding user marker: ' + tweet.coordinates.lat + ',' + tweet.coordinates.long);
            addMarkerToMap(tweet.coordinates.lat,
                    tweet.coordinates.long,
                    tweet.user.screen_name);
        }
    }
}
/**
 * Hide the map
 * @returns {undefined}
 */
function hideMap()
{
    $('#map-canvas').fadeOut(500);
    $('#toggle-map-button').val('Show Map');
}
/**
 * Show the map
 * @returns {undefined}
 */
function showMap()
{
    $('#map-canvas').fadeIn(500);
    $('#toggle-map-button').val('Hide Map');
    centerMap(currentPosition.lat, currentPosition.long);
    addMarkerToMap(currentPosition.lat, currentPosition.long, 'You are here');
}