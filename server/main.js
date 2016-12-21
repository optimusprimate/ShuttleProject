import { Meteor } from 'meteor/meteor';
import { Locations } from '../shared/locations.js';

Meteor.startup(() => {
  // Locations.ensureIndex( { pos : "2dsphere" } );
});

var ALERT_RADIUS = 10  /* km */ / 6378.1 /* degrees to km constant */;
var NOTIFICATION_INTERVAL = 60000; // im ms
var SHUTTLE_NAME = 'shuttle';

Meteor.methods({
  'update.pos'(name, pos) {
    Locations.update({name}, {'$set': {pos}}, {upsert: true});
    if(name == SHUTTLE_NAME) {
      var people = Locations.find({pos: { $geoWithin: { $center: [ pos.coordinates, ALERT_RADIUS ]}}, name: {$ne: SHUTTLE_NAME}}).fetch();
      for (var useridx in people) {
        var user = people[useridx];
        var currentTime = new Date();
        if(typeof(user.lastNotificationDate) == 'undefined' || currentTime - user.lastNotificationDate > NOTIFICATION_INTERVAL) {
          if(user.name != null) {
            Locations.update(user._id, {'$set': {lastNotificationDate: currentTime}}, {upsert: true});
            OneSignal.Notifications.create([user.name], {
              contents: {
                en: 'Shuttle is near...',
              },
            });
          }
        }
      }
    }
  }
});