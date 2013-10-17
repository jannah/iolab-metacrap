/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*
 $(document).ready(function() {
 //    init();
 });
 
 function init() {
 var myTweets = [];
 for (var tweet in sampleTweets)
 {
 myTweets.push(new Tweet(sampleTweets[tweet]));
 }
 //    console.log(myTweets);
 //    getRequest();
 var randomTweets = generateTweets(100);
 addTweetsToPreview(randomTweets);
 
 }
 */
/**
 * 
 * @returns {Tweet}
 */
function Tweet(/*tweetObj */) {

    if (arguments.length === 1)
    {

        var tweetObj = arguments[0];
        this.coordinates = tweetObj.coordinates;
        this.created_at = tweetObj.created_at;
        this.entities = tweetObj.entities;
        this.hashtags = [];
        for (var i in tweetObj.entities.hashtags)
        {
//            console.log(tweetObj.entities.hashtags[i].text);
            this.hashtags.push(tweetObj.entities.hashtags[i].text);
//            this.user_mentions.push(mention);
        }
//        ]tweetObj.entities.hashtags;

        this.user_mentions = [];
        for (var i in tweetObj.entities.user_mentions)
        {
            var mention = new UserMention(tweetObj.entities.user_mentions[i]);
            this.user_mentions.push(mention);
        }

        this.urls = tweetObj.entities.urls;
        this.text = tweetObj.text;
        this.user = new TwitterUser(tweetObj.user);
//        console.log(this);
    }
    else {
        this.coordinates;
        this.created_at;
        this.entities = {'hashtags': [], 'urls': [], 'user_mentions': []};
        this.hashtags = [];
        this.user_mentions = [];
        this.urls = [];
        this.text = '';
        this.user;
    }

    this.getHTMLFormat = getHTMLFormat;
}
function getHTMLFormat() {
    var str = "<div class='tweet'>";
    str += "<img src='" + this.user.profile_image_url + "'";
    str += " alt='" + this.user.screen_name + "'/>";
    str += "<h1>" + this.user.screen_name + "</h1>  <h2>";
    str += " "+ this.user.name + "<h2><br><p>";
    var textArray = this.text.split(' ');
    for (var i = 0, j = textArray.length; i < j; i++)
    {
        var word = '' + textArray[i];
        if (word.substr(0, 1) === '@')
            str += "<a href='#' class='tweet-user-mention'>" + word + "</a>";
        else if (word.substr(0, 1) === '#')
            str += "<a href='#' class='tweet-hashtag'>" + word + "</a>";
        else
            str += word;

        str += ' ';
    }

    str += '</p></div>'
    return str;
}

function UserMention(/* user_mentions object*/) {
    if (arguments.length === 1)
    {
        var user_mention = arguments[0];
        this.name = user_mention.name;
        this.id = user_mention.id;
        this.indices = user_mention.indices;
        this.screen_name = user_mention.screen_name;
    }
    else
    {
        this.name;
        this.id;
        this.indices = [];
        this.screen_name;
    }

}

function TwitterUser(/*user*/) {
    if (arguments.length === 1)
    {
        var user = arguments[0];
        this.name = user.name;
        this.profile_image_url = user.profile_image_url;
        this.friends_count = user.friends_count;
        this.statuses_count = user.statuses_count;
        this.screen_name = user.screen_name;
        this.following = user.following;
    }
    else {
        this.name;
        this.profile_image_url;
        this.friends_count;
        this.statuses_count;
        this.screen_name;
        this.following;
    }
}
function convertToTweets(data)
{
    console.log(data.length+ " tweets retrieved");
    var tweets = [];
    for (var i = 0, j = data.length; i < j; i++)
    {
        tweets.push(new Tweet(data[i]));
    }
    return tweets;
}
/**
 * 
 * @param {Array[Tweet}} tweets
 * @returns {undefined}
 */
function addTweetsToPreview(tweets)
{
    for (var i = 0, j = tweets.length; i < j; i++)
    {
        var tweet = tweets[i];
//        console.log(tweet)
        var element = $(tweet.getHTMLFormat());
        $("#tweets-preview-feed").append(element);
    }
    $("#tweets-preview-feed").css('height','700px')
    
}

/**
 * 
 * @param {type} count
 * @returns {generateTweets.tweets|Array}
 */
function generateTweets(count)
{
    var userPrefix = '@user-';
    var hashtagPrefix = '#tag-';
    var tweets = [];
    for (var i = 0; i < count; i++)
    {
        var tweet = new Tweet();
        tweet.created_at = new Date();
        tweet.user = new TwitterUser();
        tweet.user.name = userPrefix + getRandomNumber(1, 10);
        tweet.user.screen_name = tweet.user.name;
        var mentionCount = getRandomNumber(0, 4);
        var tagCount = getRandomNumber(0, 5);
        for (var m = 0; m < mentionCount; m++)
        {
            var mention;
            do
            {
                mention = userPrefix + getRandomNumber(1, 20);
            }
            while (mention === tweet.user || $.inArray(mention, tweet.user_mentions) !== -1);
            var user_mention = new UserMention();
            user_mention.name = mention;
            user_mention.screen_name = mention;
            tweet.user_mentions[m] = user_mention;
//            tweet.entities.user_mentions.push(mention);
        }
        for (var t = 0; t < mentionCount; t++)
        {
            var hashtag;
            do
            {
                hashtag = hashtagPrefix + getRandomNumber(1, 20);
            }
            while ($.inArray(hashtag, tweet.hashtags) !== -1);
            tweet.hashtags[t] = hashtag;
//            tweet.entities.hashtags.push(hashtag);
        }

        tweet.text += tweet.hashtags + ' ';
        for (var k = 0, l = tweet.user_mentions.length; k < l; k++)
        {
            tweet.text += tweet.user_mentions[k].screen_name + ' ';
        }
        tweet.text = tweet.text.replace(',', ' ');
        tweets.push(tweet);
    }

//    console.log(tweets);
    return tweets;
}

/**
 * 
 * @param {Number} lower
 * @param {Number} upper
 * @returns {Number}
 */
function getRandomNumber(lower, upper)
{
    return  Math.floor((Math.random() * upper) + lower);
}
/*
 function getRequest()
 {
 $.get('https://api.twitter.com/1/statuses/home_timeline.json',
 {'OAuth': 'oauth_consumer_key = 'hXbF1F2QUVnJcjqj8vUBQ','
 + ' oauth_nonce = '73d2b87f572d0072b87a757ec1d0adb3','
 + ' oauth_signature = 'D9YNFlg6%2Bsflb1rOMfkM6HvJ5gc%3D','
 + ' oauth_signature_method = 'HMAC-SHA1', '
 + 'oauth_timestamp = '1381367017', '
 + 'oauth_token = '22654218-QoAwLex61Qu43j7wfqli78SgnnuUm1oymDfDI9Gw','
 + ' oauth_version = '1.0'',
 'Access-Control-Allow-Origin': '*'}, function(data) {
 console.log(data);
 });
 }
 */


var sampleTweets = [
    {
        "coordinates": null,
        "favorited": false,
        "created_at": "Fri Jul 16 16:58:46 +0000 2010",
        "truncated": false,
        "entities": {
            "urls": [
                {
                    "expanded_url": null,
                    "url": "http://www.flickr.com/photos/cindyli/4799054041/",
                    "indices": [
                        75,
                        123
                    ]
                }
            ],
            "hashtags": [
            ],
            "user_mentions": [
                {
                    "name": "Stephanie",
                    "id": 15473839,
                    "indices": [
                        27,
                        39
                    ],
                    "screen_name": "craftybeans"
                }
            ]
        },
        "text": "got a lovely surprise from @craftybeans. She sent me the best tshirt ever. http://www.flickr.com/photos/cindyli/4799054041/ ::giggles::",
        "annotations": null,
        "contributors": null,
        "id": 18700887835,
        "geo": null,
        "in_reply_to_user_id": null,
        "place": null,
        "in_reply_to_screen_name": null,
        "user": {
            "name": "cindy li",
            "profile_sidebar_border_color": "AD0066",
            "profile_background_tile": false,
            "profile_sidebar_fill_color": "AD0066",
            "created_at": "Wed Nov 29 06:08:08 +0000 2006",
            "profile_image_url": "http://a1.twimg.com/profile_images/553508996/43082001_N00_normal.jpg",
            "location": "San Francisco, CA",
            "profile_link_color": "FF8500",
            "follow_request_sent": false,
            "url": "http://www.cindyli.com",
            "favourites_count": 465,
            "contributors_enabled": false,
            "utc_offset": -28800,
            "id": 29733,
            "profile_use_background_image": true,
            "profile_text_color": "000000",
            "protected": false,
            "followers_count": 3395,
            "lang": "en",
            "notifications": true,
            "time_zone": "Pacific Time (US & Canada)",
            "verified": false,
            "profile_background_color": "cfe8f6",
            "geo_enabled": true,
            "description": "Just me, Cindy Li.Giving cute substance since 1997.\r\nMarried to @themattharris.\r\nProduct designer for Yahoo! ",
            "friends_count": 542,
            "statuses_count": 4847,
            "profile_background_image_url": "http://a3.twimg.com/profile_background_images/3368753/twitter_flowerbig.gif",
            "following": true,
            "screen_name": "cindyli"
        },
        "source": "web",
        "in_reply_to_status_id": null
    },
    {
        "coordinates": null,
        "favorited": false,
        "created_at": "Fri Jul 16 16:55:52 +0000 2010",
        "truncated": false,
        "entities": {
            "urls": [
                {
                    "expanded_url": null,
                    "url": "http://bit.ly/libraryman",
                    "indices": [
                        78,
                        102
                    ]
                }
            ],
            "hashtags": [
            ],
            "user_mentions": [
                {
                    "name": "Cal Henderson",
                    "id": 6104,
                    "indices": [
                        108,
                        115
                    ],
                    "screen_name": "iamcal"
                }
            ]
        },
        "text": "Anything is possible when you're in the library... with a celestial sandwich: http://bit.ly/libraryman (via @iamcal)",
        "annotations": null,
        "contributors": null,
        "id": 18700688341,
        "geo": null,
        "in_reply_to_user_id": null,
        "place": {
            "name": "San Francisco",
            "country_code": "US",
            "country": "The United States of America",
            "attributes": {
            },
            "url": "http://api.twitter.com/1/geo/id/5a110d312052166f.json",
            "id": "5a110d312052166f",
            "bounding_box": {
                "coordinates": [
                    [
                        [
                            -122.51368188,
                            37.70813196
                        ],
                        [
                            -122.35845384,
                            37.70813196
                        ],
                        [
                            -122.35845384,
                            37.83245301
                        ],
                        [
                            -122.51368188,
                            37.83245301
                        ]
                    ]
                ],
                "type": "Polygon"
            },
            "full_name": "San Francisco, CA",
            "place_type": "city"
        },
        "in_reply_to_screen_name": null,
        "user": {
            "name": "Daniel Burka",
            "profile_sidebar_border_color": "a655ec",
            "profile_background_tile": true,
            "profile_sidebar_fill_color": "f1ccff",
            "created_at": "Mon Jan 15 15:22:14 +0000 2007",
            "profile_image_url": "http://a3.twimg.com/profile_images/74260755/2009-square-small_normal.jpg",
            "location": "San Francisco",
            "profile_link_color": "5a0d91",
            "follow_request_sent": false,
            "url": "http://deltatangobravo.com",
            "favourites_count": 92,
            "contributors_enabled": false,
            "utc_offset": -28800,
            "id": 635543,
            "profile_use_background_image": true,
            "profile_text_color": "0C3E53",
            "protected": false,
            "followers_count": 9950,
            "lang": "en",
            "notifications": false,
            "time_zone": "Pacific Time (US & Canada)",
            "verified": false,
            "profile_background_color": "BADFCD",
            "geo_enabled": true,
            "description": "Director of design at Tiny Speck. Ex-Creative director at Digg. CSS. Design. UX. Climbing. Cycling. Chilaquiles mmm.",
            "friends_count": 219,
            "statuses_count": 806,
            "profile_background_image_url": "http://a3.twimg.com/profile_background_images/4444585/back.png",
            "following": true,
            "screen_name": "dburka"
        },
        "source": "web",
        "in_reply_to_status_id": null
    },
    {
        "coordinates": null,
        "favorited": false,
        "created_at": "Fri Jul 16 16:40:34 +0000 2010",
        "truncated": false,
        "entities": {
            "urls": [
            ],
            "hashtags": [
            ],
            "user_mentions": [
            ]
        },
        "text": "Walking the DOM like Huggybear.",
        "annotations": null,
        "contributors": null,
        "id": 18699620902,
        "geo": null,
        "in_reply_to_user_id": null,
        "place": null,
        "in_reply_to_screen_name": null,
        "user": {
            "name": "Kevin Lawver",
            "profile_sidebar_border_color": "A8A37E",
            "profile_background_tile": true,
            "profile_sidebar_fill_color": "E6E2B0",
            "created_at": "Sat Jul 29 18:23:37 +0000 2006",
            "profile_image_url": "http://a3.twimg.com/profile_images/980477983/oh_lawver_normal.jpg",
            "location": "Savannah, GA, US",
            "profile_link_color": "DC4104",
            "follow_request_sent": false,
            "url": "http://lawver.net",
            "favourites_count": 148,
            "contributors_enabled": false,
            "utc_offset": -18000,
            "id": 3404,
            "profile_use_background_image": true,
            "profile_text_color": "003030",
            "protected": false,
            "followers_count": 1049,
            "lang": "en",
            "notifications": false,
            "time_zone": "Eastern Time (US & Canada)",
            "verified": false,
            "profile_background_color": "003030",
            "geo_enabled": true,
            "description": "Nerd who loves web standards, Ruby on Rails and all things webbish. Chief Architect @ http://uplaya.com and co-founder of http://ficly.com. Happy dad & husband.",
            "friends_count": 268,
            "statuses_count": 10561,
            "profile_background_image_url": "http://a1.twimg.com/profile_background_images/1391712/twitter_back.png",
            "following": true,
            "screen_name": "kplawver"
        },
        "source": "<a href=\"http://twitter.com\" rel=\"nofollow\">Tweetie for Mac</a>",
        "in_reply_to_status_id": null
    },
];