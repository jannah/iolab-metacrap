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
var MY_TAGS_COLUMN = '#my-tags-column';
var MY_MENTIONS_COLUMN = '#my-mentions-column';
var FRIENDS_TAGS_COLUMN = '#friend-tags-column';
var FRIENDS_MENTIONS_COLUMN = '#friend-mentions-column';
var TWEET_AREA_TEXT = '#tweet-text';
var TWEET_LIMIT = 140;
var DISPLAYED_TAGS_LIMIT = 10;
var TagListTypes = {Tags: '#', Mentions: '@'};

function loadTweets(screen_name)
{
//    console.log('Testing');
//    var randomTweets = generateTweets(100);

//    console.log('Testing API Call');

    var parameters = {'screen_name': screen_name, 'count': 500};
//    var api = '1.1/statuses/user_timeline';
    var deferredObject = callTwitterAPI(parameters, CALL_USER_TIMELINE);
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
     myMentions.title = 'My Mentions';
     myMentions.column = MY_MENTIONS_COLUMN;
     myMentions.type = TagListTypes.Mentions;
     myMentions.addTag('@donjannah');
     myMentions.addTag('@donjannah');
     myMentions.addTag('@donjannah');
     for (var i = 1; i <= 10; i++) {
     myMentions.addTag('@test-' + i);
     myMentions.tags['@test-' + i] = Math.floor((Math.random() * 20) + 1);
     }
     
     //    console.log(myMentions);
     addTagCloudToColumn(myMentions.tags, FRIENDS_MENTIONS_COLUMN);
     myMentions.sortTags();
     for (var key in myMentions.tags)
     {
     //        console.log('Adding ' + key + 'to ' + myMentions.column);
     addItemToColumn(key, myMentions.column);
     }
     */




}


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
    this.column;
    this.addTag = addTag;
    this.sortTags = sortTags;
    this.addTagListToColumn = addTagListToColumn;
}

/**
 * add this tag list to a the column specified in the list
 * @returns {undefined}
 */
function addTagListToColumn()
{
    console.log('Adding ' + this.title + ' to ' + this.column + ' (' + this.tags.length + ')');
    for (var i = 0, j = this.tags.length; i < j; i++)
    {
        console.log(column + '\t' + this.tags[i]);
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
    var maxFontSize = 3;
    var minFontSize = 1;
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

/**
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
 * @param {String} column
 * @returns {undefined}
 */
function addTagCloudToColumn(tags, column)
{
    var cloud = formatCloudTag(tags);
    for (var i = 0, j = cloud.length; i < j; i++)
    {
        var itemHTML = $(cloud[i]);
        $(column).append(itemHTML);
        if (i < DISPLAYED_TAGS_LIMIT)
        {
            $(column + ' label').last().hide().fadeIn(500);
        }
        else
        {
            $(column + ' label').last().addClass('tag-hidden').hide();
            ;

        }
    }

    var moreButton = $("<input type='button' class='view-more-tags-button' value='more..'/>");
    $(column).append(moreButton);
    $(column).css('display', 'inline-block');
    $(column).hide().delay(500).fadeIn(500);
    eventViewMoreTags();
//    $(column).addClass("tag-cloud");
    eventAppendItemToTweet();
}

function removeItemFromColumn(item, column) {

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

/*----------------------------------------------
 *                  Events                      |
 *----------------------------------------------*/
/**
 * event to append  a clicked mention or hashtag to the tweet text
 * @returns {undefined}
 */
function eventAppendItemToTweet()
{
    $('.suggestion-column label').unbind('click');
    $('.suggestion-column label').click(function() {

        var original_text = $(TWEET_AREA_TEXT).text();
        var text = $(this).text();
//        console.log(text);
//        console.log(original_text);
        if (original_text.indexOf(text) === -1 || original_text.length === 0)
        {
            if (original_text.length > 0)
                text = ' ' + text;
            $(TWEET_AREA_TEXT).append(text);
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
function eventUpdateTweetCount() {
//     var tweet = $('#tweet-text').text();
//     /var rem = (TWEET_LIMIT - tweet.length);
//     $('#tweet-length-label').text(rem+' left');
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
function eventViewMoreTags() {
    $('.view-more-tags-button').unbind('click');
    $('.view-more-tags-button').click(function()
    {
        var tags = $(this).siblings('.tag-hidden');

        for (var i = 0, m = tags.length; i < m && i < DISPLAYED_TAGS_LIMIT;
                i++)
        {
            var tag = tags.get(i);
            $(tag).removeClass('tag-hidden');
            $(tag).fadeIn(500);
        }
        return false;
    });
}
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
        loadTweets(username);

        return false;
    });
}
