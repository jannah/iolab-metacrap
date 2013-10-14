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
//    loadTweets('UCBerkeley');


}
var MY_TAGS_COLUMN = "#my-tags-column";
var MY_MENTIONS_COLUMN = "#my-mentions-column";
var FRIENDS_TAGS_COLUMN = "#friend-tags-column";
var FRIENDS_MENTIONS_COLUMN = "#friend-mentions-column";
var TWEET_AREA_TEXT = "#tweet-text";
var TWEET_LIMIT = 140;
var TagListTypes = {Tags: "#", Mentions: "@"};

function loadTweets(screen_name)
{
//    console.log("Testing");
//    var randomTweets = generateTweets(100);

//    console.log("Testing API Call");

    var parameters = {'screen_name': screen_name, 'count': 100};
    var api = '1.1/statuses/user_timeline';
    var deferredObject = callTwitterAPI(parameters, api);
    deferredObject.done(function(data) {
        console.log(data);
        var tweets = convertToTweets(data);

        addTweetsToPreview(tweets);
        var loadedTagsMentions = loadHashagsAndMentionsFromTweets(tweets);
//    var mentions = new TagList();
//    var hashtags = new TagList();
//    console.log(loadedTagsMentions);
        var mentions = loadedTagsMentions.mentions;
        var hashtags = loadedTagsMentions.hashtags;

        mentions.sortTags();
        hashtags.sortTags();
        console.log(mentions);
        console.log(hashtags);

        mentions.column = FRIENDS_MENTIONS_COLUMN;
        hashtags.column = FRIENDS_TAGS_COLUMN;
//    mentions.addTagListToColumn();
//    hashtags.addTagListToColumn();

        addTagCloudToColumn(mentions.tags, mentions.column);
        addTagCloudToColumn(hashtags.tags, hashtags.column);



    });

    /*
     var myMentions = new TagList();
     myMentions.title = "My Mentions";
     myMentions.column = MY_MENTIONS_COLUMN;
     myMentions.type = TagListTypes.Mentions;
     myMentions.addTag("@donjannah");
     myMentions.addTag("@donjannah");
     myMentions.addTag("@donjannah");
     for (var i = 1; i <= 10; i++) {
     myMentions.addTag("@test-" + i);
     myMentions.tags["@test-" + i] = Math.floor((Math.random() * 20) + 1);
     }
     
     //    console.log(myMentions);
     addTagCloudToColumn(myMentions.tags, FRIENDS_MENTIONS_COLUMN);
     myMentions.sortTags();
     for (var key in myMentions.tags)
     {
     //        console.log("Adding " + key + "to " + myMentions.column);
     addItemToColumn(key, myMentions.column);
     }
     */




}

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
            mentionsList.addTag('@' + tweet.user_mentions[m].screen_name);
        for (var m = 0, l = tweet.hashtags.length; m < l; m++)
        {
            hashtagList.addTag('#' + tweet.hashtags[m]);
        }
    }

    var combined = {'hashtags': hashtagList,
        'mentions': mentionsList};
    return combined;
}
function TagList() {

    this.title = "";
    this.type;
    this.tags = {};
    this.column;
    this.addTag = addTag;
    this.sortTags = sortTags;
    this.addTagListToColumn = addTagListToColumn;
}

function addTagListToColumn()
{
    console.log('Adding ' + this.title + ' to ' + this.column + ' (' + this.tags.length + ')');
    for (var i = 0, j = this.tags.length; i < j; i++)
    {
        console.log(column + '\t' + this.tags[i]);
        addItemToColumn(this.tags[i], this.column);
    }
}
function addTag(tag) {

    if (tag in this.tags)
    {
        var value = this.tags[tag];
        value++;
        this.tags[tag] = value;
    }
    else {
        this.tags[tag] = 1;
    }

}
/**
 * 
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
function formatItemForList(item) {
    var str = "<label>";
    str += item;
    str += "</label>";
    return str;
}
/**
 * 
 * @param {Array} tags
 * @returns {String}
 */
function formatCloudTag(tags) {

    var maxFontSize = 3;
    var minFontSize = 1;
    var maxOpacity = 1;
    var minOpacity = .6;
    var fontSizeUnit = "em";
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
//    console.log("Max Size=" + maxSize + "\nMin Size=" + minSize);
    for (var key in tags)
    {
        var frequency = tags[key];
        var fontSize = (frequency - minSize) / (maxSize - minSize) * (maxFontSize - minFontSize) + minFontSize;
        var opacity = maxOpacity * (frequency - minSize) / (maxSize - minSize) + minOpacity;
        var str = "<label style='font-size:" + fontSize + fontSizeUnit + ";opacity:" + opacity + ";'>";
        str += key;
        str += "</label>";
        cloud.push(str);
    }
//console.log(cloud);
    return cloud;
}

function addItemToColumn(item, column) {
    var itemHTML = $(formatItemForList(item));
//    console.log(itemHTML);
    $(column).append(itemHTML);
    $(column + " li:last").hide().fadeIn(500);
    eventAppendItemToTweet();
}
function addTagCloudToColumn(tags, column)
{
    var cloud = formatCloudTag(tags);
    for (var i in cloud)
    {
        var itemHTML = $(cloud[i]);
        $(column).append(itemHTML);
        $(column).hide().fadeIn(500);
    }

//    $(column).addClass("tag-cloud");
    eventAppendItemToTweet();
}

function removeItemFromColumn(item, column) {

}
//
//function appendTextToTweet(text) {
//    var original_text = $("tweet-text").text();
//    if (original_text.indexOf(text) === text)
//        $("tweet-text").text(original_text + " " + text);
//    else
//        alert(text + " already exists in tweet");
//}

function eventAppendItemToTweet()
{
    $(".suggestion-column label").unbind("click");
    $(".suggestion-column label").click(function() {

        var original_text = $(TWEET_AREA_TEXT).text();
        var text = $(this).text();
//        console.log(text);
//        console.log(original_text);
        if (original_text.indexOf(text) === -1 || original_text.length === 0)
        {
            if (original_text.length > 0)
                text = " " + text;
            $(TWEET_AREA_TEXT).append(text);
        }
        else
            alert(text + " already exists in tweet");
        updateTweetCount();
    });
}

function eventSubmitTweet()
{
    $("#tweet-submit").click(function() {
        var tweet = $("#tweet-text").text();
        alert("Submitting tweet:\n" + tweet);
    });
}

function eventUpdateTweetCount() {
//     var tweet = $("#tweet-text").text();
//     /var rem = (TWEET_LIMIT - tweet.length);
//     $("#tweet-length-label").text(rem+" left");
    var lbl = $("#tweet-length-label");
    lbl.text(TWEET_LIMIT + " left");
    $("#tweet-text").bind('input propertychange', function(event, previousText) {
        updateTweetCount();
    });
}

function updateTweetCount()
{
    var lbl = $("#tweet-length-label");
    var text = TWEET_LIMIT - parseInt($("#tweet-text").val().length);
//        console.log(text);
    lbl.text(text + " left");
    if (text < 0) {
        lbl.css("color", "red");
    }
    else {
        lbl.css("color", "black");
    }
}
function logonToTwitter()
{




    $("#logon-submit").click(function() {
        var username = $("#logon-username").val();
        var password = $("#logon-password").val();
        loadTweets(username);

        return false;
    });
}


var Twitter_Access_level = "Read-only";
var Twitter_Consumer_key = "hXbF1F2QUVnJcjqj8vUBQ";
var Twitter_Consumer_secret = "BcdY1uVAPBYtncN0ksS7PHtvPPyXLHaSNpetLJdu8";
var Twitter_Access_Token = "22654218-QoAwLex61Qu43j7wfqli78SgnnuUm1oymDfDI9Gw";
var Twitter_Access_Token_Secret = "qFxeo4S55CSHPHIAe9c0GBUTn7SSRADNZuIcnLUC5c";
var Twitter_Request_token_URL = "https://api.twitter.com/oauth/request_token";
var Twitter_Authorize_URL = "https://api.twitter.com/oauth/authorize";
var Twitter_Access_token_URL = "https://api.twitter.com/oauth/access_token";
var Twitter_Callback_URL = "http://people.ischool.berkeley.edu/~jannah/";


