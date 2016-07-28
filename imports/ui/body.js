import { Template } from 'meteor/templating';
import { Mat } from '../api/mat.js';
import { Pose } from '../api/pose.js';

import './body.html';

Template.body.events({
  'submit .new-task'(event) {
    event.preventDefault();
 
    // Get value from form element
    const target = event.target;
    const text = target.text.value;
    var result = [];
    Mat.find({}).forEach(function(u) { result.push(u.lit) });
    // Insert a task into the collection
    Pose.insert({time: text, pose: result});
 
    // Clear form
    target.text.value = '';
  },
});
Template.body.helpers({
  mat: function() {
    return Mat.find({},{lit: 1}).fetch();
  },
  litcolor: function(){
    var result = [];
    Mat.find({_id: this._id},{lit:1}).forEach(function(u) { result.push(u.lit) });
    if(result[0]==="true"){return "rgb(220,220,220)";};
    if(result[0]==="false"){return "#000000";};

  }
});
Template.section.events({
  'click .matsection': function(e){
    e.preventDefault();
    console.log("you clicked");
    var curval;
    var result = [];
    Mat.find({_id: this._id},{lit:1}).forEach(function(u) { result.push(u.lit) });
    console.log(result);
    if(result[0]==="true"){curval=true;};
    if(result[0]==="false"){curval=false;};
    console.log(curval);
    Mat.update({_id: this._id},{$set: {lit: (!curval).toString()}});

  },
  
});
Handlebars.registerHelper('litcolor', function() {
    var result = [];
    Mat.find({_id: this._id},{lit:1}).forEach(function(u) { result.push(u.lit) });
    if(result[0]==="true"){return "rgb(220,220,220)";};
    if(result[0]==="false"){return "#000000";};
});
