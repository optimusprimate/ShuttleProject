import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Locations } from '../shared/locations.js';

import './main.html';

Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', function () {
  this.render('spectator');
});

Router.route('/shuttle', function () {
  this.render('shuttle');
});

var OneSignal = window.OneSignal || [];
OneSignal.push(["init", {
  appId: "bca68e0e-2b2b-4270-82e0-e254e9e2069a",
  autoRegister: true,
  notifyButton: {
    enable: false
  }
}]);

var geoloc = new ReactiveVar({});

Template.locationDisplay.helpers({
  location() {
    return JSON.stringify(geoloc.get());
  },
});


function sendLocation(name) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      pos = {type:'Point',coordinates:[pos.coords.latitude, pos.coords.longitude]};
      Meteor.call('update.pos', name, pos);
      geoloc.set(pos);
    }, function(error) {
        var errStr = "";
        switch(error.code) {
            case error.PERMISSION_DENIED:
                errStr = "User denied the request for Geolocation."
                break;
            case error.POSITION_UNAVAILABLE:
                errStr = "Location information is unavailable."
                break;
            case error.TIMEOUT:
                errStr = "The request to get user location timed out."
                break;
            case error.UNKNOWN_ERROR:
                errStr = "An unknown error occurred."
                break;
        }
        geoloc.set({error: errStr});
    });
  } else {
    geoloc.set({error: "Geolocation is not supported by this browser."});
  }
}

Template.shuttle.onCreated(function () {
  this.timeid = setInterval(function() {
    sendLocation('shuttle');
  }, 1000);
});

function sendSpectatorLocation() {
  OneSignal.getUserId(function(userId) {
    sendLocation(userId);
  });
}


Template.spectator.onCreated(function () {
  OneSignal.push(function() {
    OneSignal.on('subscriptionChange', function (isSubscribed) {
        if(isSubscribed) {
          sendSpectatorLocation();
        }
    });
  });
});

Template.spectator.events({
  'click button'(event, instance) {
    sendSpectatorLocation();
  }
});