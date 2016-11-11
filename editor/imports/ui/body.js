import { Template } from 'meteor/templating';
import { Mat } from '../api/mat.js';
var database;
database = new MongoInternals.RemoteCollectionDriver("mongodb://username:password@localhost:3000/meteor");
Pose = new Mongo.Collection('Pose', { _driver: database });

//for(i=2; i<18; i++){
//  Mat.insert({imgsrc: "matLayer"+i+".svg"});
//}
import './body.html';

Template.body.events({
  'click [data-action=\'task/save\']': function(e){
    e.preventDefault();
    console.log("save");
    var result = [];
    var player = document.getElementById('player');
    Mat.find({}).forEach(function(u) { result.push(u.lit) });
    // Insert a task into the collection
    Pose.insert({vidfile: path.substr(path.lastIndexOf('/')+1), pose: result, time: player.currentTime, desc: document.getElementById("yogaPoseDescription").value, name: document.getElementById("poseName").value});

  },
  'click [data-action=\'task/loadvid\']': function(e){
    console.log("play")
    var player = document.getElementById('player');
    var source = document.createElement('source');
    path = document.getElementById("vidURL").value;
    if (player.hasChildNodes()) {player.removeChild(player.childNodes[0]);}
    source.setAttribute('src', path);
    //source.setAttribute('src', 'http://www.w3schools.com/html/mov_bbb.mp4');
    player.setAttribute('style','display: block;')
    player.appendChild(source);
    player.play();
  }

});
Template.body.helpers({
  mat: function() {
    return Mat.find({},{lit: 1}).fetch();
  },

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
Handlebars.registerHelper('imgsrc', function() {


});

Template.section.helpers({
    styles(){
        var result = [];
    Mat.find({_id: this._id},{styles: 1, lit: 0}).forEach(function(u) { result.push(u.styles) });
    return result;
    },
    imgsrc(){
        var result = [];
        Mat.find({_id: this._id},{imgsrc:1}).forEach(function(u) { result.push(u.imgsrc) });
        return result;
      }

});
