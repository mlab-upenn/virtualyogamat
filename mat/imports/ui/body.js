import { Template } from 'meteor/templating';
import { Mat } from '../api/mat.js';

//for(i=2; i<18; i++){
//  Mat.insert({imgsrc: "matLayer"+i+".svg"});
//}
import './body.html';
Template.body.helpers({
  mat: function() {

    Pose.find({time: player.currentTime},{pose: 1}).forEach(function(u) { result.push(u.lit) });
    Mat.remove({});
    Mat.insert(result);
    return Mat.find({},{lit: 1}).fetch();
  },

});

Handlebars.registerHelper('litcolor', function() {
    var result = [];
    Mat.find({_id: this._id},{lit:1}).forEach(function(u) { result.push(u.lit) });
    if(result[0]==="true"){return "rgb(220,220,220)";};
    if(result[0]==="false"){return "#000000";};
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
