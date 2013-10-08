/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$(document).ready(function() {
    init();
});
function init() {
    test();
}
var MY_TAGS_COLUMN = "#my-tags-column ul";
var MY_MENTIONS_COLUMN = "#my-metnions-column ul";
var FRIENDS_TAGS_COLUMN = "#friend-tags-column ul";
var FRIENDS_mentions_COLUMN = "#friend-mentions-column ul";
var TWEET_AREA_TEXT = "#tweet-text";
var TagListTypes = {Tags: "t", Mentions: "m"};
function test() {

    var myMentions = new TagList();
    myMentions.title = "My Mentions";
    myMentions.column = MY_MENTIONS_COLUMN;
    myMentions.type = TagListTypes.Mentions;
    myMentions.addTag("@donjannah");
    myMentions.addTag("@test2");
    myMentions.addTag("@test2");

    console.log(myMentions);
    for (var key in myMentions.tags)
    {
        console.log("Adding " + key + "to " + myMentions.column);
        addItemToColumn(key, myMentions.column);
    }


}

function TagList() {

    this.title = "";
    this.type;
    this.tags = {};
    this.column;
    this.addTag = addTag;
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

    /* ADD SORT LIST HERE*/

}
function formatItemForList(item) {
    var str = "<li>"
    str += "<a href='#'>" + item + "</a>"

    str += "</li>";
    return str;
}

function addItemToColumn(item, column) {
    var itemHTML = $(formatItemForList(item));
    console.log(itemHTML);
    $(column).append(itemHTML);
    $(column + " li:last").hide().fadeIn(500);
    eventAddItemToColumn();

}

function removeItemFromColumn(item, column) {

}

function appendTextToTweet(text) {
    var original_text = $("tweet-text").text();
    if (original_text.indexOf(text) !== text)
        $("tweet-text").text(original_text + " " + text);
    else
        alert(text + " already exists in tweet");
}

function eventAddItemToColumn()
{
    $(".suggestion-column ul li").unbind("click");
    $(".suggestion-column ul li").click(function() {

        var original_text = $(TWEET_AREA_TEXT).text();
        var text = $(this).text();
        console.log(text);
        console.log(original_text);
        if (original_text.indexOf(text) !== -1 || original_text.length === 0)
        {
            if (original_text.length > 0)
                text = " " + text;
            $(TWEET_AREA_TEXT).append(text);
        }
        else
            alert(text + " already exists in tweet");


    });
}
