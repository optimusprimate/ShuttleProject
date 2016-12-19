import { Template } from 'meteor/templating';
import { Locations } from '../shared/locations.js';

import './spectator.html';

Template.hello.events({
  'click button'(event, instance) {
    Meteor.call('update.pos', 'spectator', 10);
  },
});