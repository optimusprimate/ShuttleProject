import { Meteor } from 'meteor/meteor';
import { Locations } from '../shared/locations.js';

Meteor.startup(() => {
  db.locations.ensureIndex( { pos : "2dsphere" } );
});

/*
  db.locations.update({name:'shuttle'},{$set:{pos:{type:'Point',coordinates:[30,40]}}})
  db.locations.update({name:'spectator'},{$set:{pos:{type:'Point',coordinates:[31,40]}}})
*/

Meteor.methods({
  'update.pos'(name, pos) {
    Locations.update({name}, {'$set': {pos}}, {upsert: true});
    // db.locations.find({pos: { $geoWithin: { $center: [ [30, 40], 10 ]}}});
    // push notification here
  }
});