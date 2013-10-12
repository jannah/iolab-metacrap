// JavaScript source code
/*
    Example to call the API as a deferred object.

    Please reference twitterAPI.js for interface
*/

$(document).ready(function () {
    //testTwitterUsertimeline();
    console.log("Testing API Call");

    var parameters = { 'screen_name': 'slate', 'count': 10 };
    var api = '1.1/statuses/user_timeline';
    var deferredObject = callTwitterAPI(parameters, api);
    deferredObject.done(function (data) {
        console.log(data)

    });
});