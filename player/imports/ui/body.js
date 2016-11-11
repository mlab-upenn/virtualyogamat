import { Template } from 'meteor/templating';
import { Mat } from '../api/mat.js';
import { Pose } from '../api/pose.js';

//for(i=2; i<18; i++){
//  Mat.insert({imgsrc: "matLayer"+i+".svg"});
//}
import './body.html';
function updateMat(){
    if(Pose.find({time:player.currentTime, vidfile: path.substr(path.lastIndexOf('/')+1},{mat:1})!=[]){
        Mat.remove({});
        Mat.insert({Pose.find({time:player.currentTime, vidfile: path.substr(path.lastIndexOf('/')+1},{mat:1}})
    }
}
 Meteor.setInterval(function() {
    updateMat();
  }, 1000);
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
