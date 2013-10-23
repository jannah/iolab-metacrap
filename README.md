iolab-metacrap
==============
Project title: 
Twitter for Dummies

Project description:
The project users Twitter API to suggest mentions and hashtags based on multiple criteria
This web site helps users find relevant twitter hashtags and mentions based on the following:

Friends: Recently used hashtags and mentions from your home line (people you follow)
Nearby: Recently used hashtags and mentions within 3 miles of your current location
Specific Users: Recently used hashtags and mentions for a specific user. TO use, type a username in the left username box anc click "Grab'em". 
Suggestions: Recently used hashtags based on what you type in your tweet. To use, type your tweet and click "Suggest Tags". An algorithm will analyze the text and suggest mentions and hashtags. Note: Multiword matches are ranked higher than single word matches.

Team members and roles:
- Hassan Jannah: UI and Backend object classes
- Christopher Fan: API calls, PHP, ranking function
- Ramit Malhotra: Text analysis backend

Technologies used
HTML, Javascript, JQuery, Twitter API, PHP

Link to demo version
http://people.ischool.berkeley.edu/~jannah/iolab-metacrap/index.html

Known bugs
- Twitter API does not return geolocation. We implemented the ability to add markers to the map but we are not getting location data to display it. 
