import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Locations } from '../shared/locations.js';

import './shuttle.html';

Template.locator.onCreated(function locatorOnCreated() {
    this.geoloc = new ReactiveVar({});
    this.timeid = setTimeout(function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(pos) {
              pos = {type:'Point',coordinates:[pos.coords.latitude, pos.coords.longitude]};
              Meteor.call('update.pos', 'shuttle', pos);
              Template.instance().geoloc.set(pos);
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
                Template.instance().geoloc.set({error: errStr});
                
            });
        } else {
            Template.instance().geoloc.set({error: "Geolocation is not supported by this browser."});
        }
    }, 1000);
});

Template.locator.helpers({
  location() {
    return JSON.stringify(Template.instance().geoloc.get());
  },
});

