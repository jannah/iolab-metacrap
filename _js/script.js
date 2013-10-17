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
//    loadTweetsByScreenName('UCBerkeley');


}
/*
 var MY_TAGS_COLUMN = '#my-tags-column';
 var MY_MENTIONS_COLUMN = '#my-mentions-column';
 var FRIENDS_TAGS_COLUMN = '#friend-tags-column';
 var FRIENDS_MENTIONS_COLUMN = '#friend-mentions-column';
 var NEAR_TAGS_COLUMN = '#friend-tags-column';
 var NEAR_MENTIONS_COLUMN = '#friend-mentions-column';
 */
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
    this.addTagListToColumn = addTagListToColumn;
    this.addTagLocation = addTagLocation;
}

/**
 * add this tag list to a the column specified in the list
 * @returns {undefined}
 */
function addTagListToColumn()
{
    for (var i = 0, j = this.tags.length; i < j; i++)
    {
        addItemToColumn(this.tags[i], this.column);
    }
}

/**
 * add a tag to the tag list and update its frequency
 * @param {type} tag
 * @returns {undefined}
 */
function addTag(tag)
{
    if (tag in this.tags)
    {
        var value = this.tags[tag];
        value++;
        this.tags[tag] = value;

    }
    else
    {
        this.tags[tag] = 1;
    }
//    console.log(this.tags);
}
function addTagLocation(tag, coordinates)
{
    if (coordinates)
        console.log('coordinates:' + coordinates);
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
//    console.log(this.tags);
//    var sorted = {};

    var sorted = [];
    for (var key in this.tags)
        sorted.push([key, this.tags[key]]);
    sorted.sort(function(a, b) {
        a = a[1];
        b = b[1];
        return a > b ? -1 : (a < b ? 1 : 0);
    });
//    console.log(sorted);
    this.tags = {};
    for (var i = 0; i < sorted.length; i++) {
        var key = sorted[i][0];
        var value = sorted[i][1];
        this.tags[key] = value;
        // do something with key and value
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
//    console.log('Max Size=' + maxSize + '\nMin Size=' + minSize);
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
//console.log(cloud);
    return cloud;
}

/**TODO
 * Adds a text item to a column (No cloud tag)
 * @param {String} item
 * @param {String} column
 * @returns {undefined}
 */
function addItemToColumn(item, column)
{
    var itemHTML = $(formatItemForList(item));
//    console.log(itemHTML);
    $(column).append(itemHTML);
    $(column + ' li:last').hide().fadeIn(500);
    eventAppendItemToTweet();
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
//    $(column).css('display', 'inline-block');
//    $(column).fadeIn(500);
//    console.log(column);
    for (var i = 0, j = cloud.length; i < j; i++)
    {
        var itemHTML = $(cloud[i]);
        $(column).append(itemHTML);
        $(column).children('.tag').last().addClass('tag-hidden').hide();
        /*
         if (i < DISPLAYED_TAGS_LIMIT)
         {
         $(column).children('.tag').last().hide().fadeIn(500);
         }
         else
         {
         $(column).children('.tag').last().addClass('tag-hidden').hide();
         }
         */
    }
    eventAppendItemToTweet();
    console.log('New column added');
}
/**
 * 
 * @param {string} header
 * @returns {jQuery}
 */
function addColumnToSuggestions(header)
{
    /*
     var moreButton = $("<input type='button' class='view-more-tags-button' value='more..'/>");
     var lessButton = $("<input type='button' class='view-less-tags-button' value='less..'/>");
     $(column).append(lessButton);
     $(column).append(moreButton);
     */
    var itemHTML = $("<li class='suggestion-column area'>"

            + "<h2>"
            + "<lable class='area-header'>"
            + header
            + "</label>"
            + "</h2>"
            + "<input type='button' class='view-more-tags-button' value='+'/>"
            + "<input type='button' class='view-less-tags-button' value='-'/>"

            + "</li>");
    itemHTML.addClass('suggestion-column')
            .addClass('area');
    $('#suggestion-area ul').append(itemHTML);

    var column = $('#suggestion-area ul .suggestion-column').last();
    $(column).show();
    eventViewMoreTags();
    eventViewLessTags();
    return column;
//    console.log('column added');
}
function removeItemFromColumn(item, column) {

}

/*----------------------------------------
 *              Processing
 *---------------------------------------*/
/**
 * 
 * @param {Array} tweets
 * @returns {loadHashagsAndMentionsFromTweets.combined}
 */
function loadHashagsAndMentionsFromTweets(tweets)
{
    var hashtagList = new TagList();
    hashtagList.title = 'Hashtag List';
    hashtagList.type = '#';
    var mentionsList = new TagList();
    mentionsList.title = 'Mentions List';
    mentionsList.type = '@';
    for (var i = 0, j = tweets.length; i < j; i++)
    {
        var tweet = new Tweet();
        tweet = tweets[i];

        for (var m = 0, l = tweet.user_mentions.length; m < l; m++)
        {
            mentionsList.addTag('@' + tweet.user_mentions[m].screen_name);
            mentionsList.addTagLocation('@' + tweet.user_mentions[m].screen_name, tweet.coordinates);
        }
        for (var m = 0, l = tweet.hashtags.length; m < l; m++)
        {
            hashtagList.addTag('#' + tweet.hashtags[m]);
            hashtagList.addTagLocation('#' + tweet.hashtags[m], tweet.coordinates);
        }
    }

//    console.log(mentionsList.tagLocations);
//    console.log(hashtagList.tagLocations);


    var combined = {'hashtags': hashtagList,
        'mentions': mentionsList};
    return combined;
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
//    console.log('adding event: append item to tweet');
    $('.tag').unbind('click');
    $('.tag').click(function() {

//        var original_text = $(TWEET_AREA_TEXT).text();
        var original_value = $(TWEET_AREA_TEXT).val();
        var text = $(this).text();

//        console.log('Original Text: ' + original_text);
        console.log('Original value: ' + original_value);
        console.log('Additional Text: ' + text);
        if (original_value.indexOf(text) === -1 || original_value.length === 0)
        {
            if (original_value.length > 0)
                text = ' ' + text;
//            $(TWEET_AREA_TEXT).append(text);
            $(TWEET_AREA_TEXT).val(original_value + text);

//           console.log('New Text: ' + $(TWEET_AREA_TEXT).text()); 
            console.log('New Value: ' + $(TWEET_AREA_TEXT).val());
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
        var tweet = $('#tweet-text').text();
        alert('Submitting tweet:\n' + tweet);
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
//    console.log('adding event: more tags');
    $('.view-more-tags-button').unbind('click');
    $('.view-more-tags-button').click(function()
    {
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
//    console.log('adding event: more tags');
    $('.view-less-tags-button').unbind('click');
    $('.view-less-tags-button').click(function()
    {
        var tags = $(this).siblings('.tag-shown');

        for (var i = 0, m = tags.length - 1; m >= 0 && i < DISPLAYED_TAGS_LIMIT;
                i++, m--)
        {
            var tag = tags.get(m);
            $(tag).addClass('tag-hidden');
            $(tag).addClass('tag-shown');
            $(tag).hide();
        }
        return false;
    });
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
//        console.log(text);
    lbl.text(text + ' left');
    if (text < 0) {
        lbl.css('color', 'red');
    }
    else {
        lbl.css('color', 'black');
    }
}
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

function loadTweetsByLocation(lat, long, query, radius)
{
    console.log('loading tweeter around ' + lat + ',' + long);
    var deferredObject = getSearchResults(query, 800, parseTwitterLocation(lat, long, radius));
    deferredObject.done(function(data) {
//        console.log(data);
        var tweets = convertToTweets(data[0]);

        processTweetsData(tweets, NEAR_MENTIONS_COLUMN, NEAR_TAGS_COLUMN);
    });
}

function processTweetsData(tweets, mentionColumn, hashColumn)
{
    //      addTweetsToPreview(tweets);
    addTweetsToMap(tweets);
    var loadedTagsMentions = loadHashagsAndMentionsFromTweets(tweets);
    var mentions = loadedTagsMentions.mentions;
    var hashtags = loadedTagsMentions.hashtags;
    mentions.sortTags();
    hashtags.sortTags();
//    console.log(mentions);
//    console.log(hashtags);
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
 * 
 * @param {position} position
 * @returns {undefined}
 */
function showPosition(position)
{

    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
//    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
//    console.log("Latitude: " + lat + "\nLongitude: " + lon);

    //    $("#lat-label").text(lat);
//    $("#lon-label").text(lon);

    centerMap(lat, lon);
    var title = "You are here! (at least within a "
            + position.coords.accuracy + " meter radius)";
    addMarkerToMap(lat, lon, title);

    loadTweetsByLocation(lat, lon, 3);
    /*   var mapOptions = {
     center: latlng,
     zoom: 16,
     mapTypeId: google.maps.MapTypeId.ROADMAP
     };
     var map = new google.maps.Map(document.getElementById("map-canvas"),
     mapOptions);
     
     var marker = new google.maps.Marker({
     position: latlng,
     map: map,
     title: "You are here! (at least within a " + position.coords.accuracy + " meter radius)"
     });*/
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
//    var mapOptions = {
////        center: latlng,
////        zoom: 16,
//        mapTypeId: google.maps.MapTypeId.ROADMAP
//    };
//    var map = google.maps.Map(document.getElementById("map-canvas"),
//            mapOptions);

    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: title
    });

    console.log('Marker added\t' + latlng + "\t" + title);
    console.log(marker);
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
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(document.getElementById("map-canvas"),
            mapOptions);

    console.log('Map centered to ' + latlng);
}

function addTweetsToMap(tweets)
{
    for (var i = 0, j = tweets.length; i < j; i++)
    {
        var tweet = new Tweet();
        tweet = tweets[i];

        if (tweet.coordinates)
        {
            console.log('adding user marker: ' + tweet.coordinates.lat + ',' + tweet.coordinates.long);
            addMarkerToMap(tweet.coordinates.lat,
                    tweet.coordinates.long,
                    tweet.user.screen_name);
        }
    }
}