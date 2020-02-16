var request = require("request");
var ical = require("ical-generator");

var DOMAIN = 'sfu-med.academyfive.net';
var NAME = 'SFU';

var username = '';
var password = '';

var cal = ical({
  domain: DOMAIN,
  name: NAME
});

var options = {
  "method": "POST",
  "url": "https://" + DOMAIN + "/",
  "gzip": true,
  "form": {
    'login-form': 'login-form',
    "user": username,
    "password": password,
    'login-referrer': ''
  }
};

request(options, function (error, response, body) {
  var cookies = response.headers['set-cookie'];
  var cookie = cookies[cookies.length - 1];
  request.cookie(cookie);

  var todayDate = new Date();
  var futureDate = new Date(todayDate.getTime() + (60 * 60 * 24 * 1000) * 35);

  var todayString = todayDate.getFullYear() + "-" + (todayDate.getMonth() + 1) + "-" + todayDate.getDate();
  var futureString = futureDate.getFullYear() + "-" + (futureDate.getMonth() + 1) + "-" + futureDate.getDate();

  var options = {
    "method": "GET",
    "url": "https://" + DOMAIN + "/ajax/8/EventPlanerSite/DefaultController/fetchEventDates?&timeshift=-120&from=" + todayString + "&to=" + futureString,
    "gzip": true,
    "headers": {
      "Cookie": cookie
    }
  };

  request(options, function (error, response, body) {
    var data = JSON.parse(body);
    var events = data.data;

    for (var i = 0; i < events.length; i++) {
      var event = events[i];

      cal.createEvent({
        uid: event.id,
        start: new Date(event.start_date),
        end: new Date(event.end_date),
        location: event.rooms,
        summary: event.event_name,
        description: event.text,
        organizer: event.lecturers + " <unknown@unknown.com>"
      });
    }

    console.log(cal.toString());
  });
});
