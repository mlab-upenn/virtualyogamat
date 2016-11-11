function extractVideoID(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if( match && match[7].length == 11 ){
        return match[7];
    }
    else{
        alert("Could not extract video ID.");
    }
}
function uploadVid() {
  var url = $("#vidURL").val();
  vidId = extractVideoID(url);
  $("#videoContainer").empty();
  designContent();
  onYouTubeIframeAPIReady();
  onPlayerReady();
}
var player;
function onYouTubeIframeAPIReady() {
  if(vidId != "") {
    player = new YT.Player("player", {
      height: 400 * 0.6,
      width: 400,
      videoId: vidId,
      playerVars: {
        "controls": 1,
      },
      events: {
        "onReady": onPlayerReady,
        "onStateChange": onPlayerStateChange
      }
    });
  }
}
















import { Template } from 'meteor/templating';
import { Mat } from '../api/mat.js';

import './body.html';
var w = window.innerWidth * 0.35;
var h = window.innerHeight * 0.65;
var miniGrid = [];
var elOutputs = [];
var myDiv;
var selectedCol;
var defaultCol;
var yogaPattern;

var elMap;  //in a 9x22 grid of chevrons

//for grid
var x = 10;
var y = 32;
var padding = 2;
var patchH = h * 0.8;
var patchW = patchH / 3;

var elPosX = w * 0.2 + x*padding + 20;
var elPosY = 0;
var scaleToMat = 0.9;
var elW = patchW;
var elH = elW * 2.6;
var elXn = 9;
var elYn = 22;
var elColor = "rgb(19,62,115)";

var viewMode = true;
var data;
var vidWidth = window.innerWidth * 0.275;
var vidId = "";
var timeSlices = [];
var sliceCount = 0;
var play = false;

//setting things up when the document is ready
$(document).ready(function() {
  /*setting up tool tips.
  If you want to add a tool tip, add a title attribute to a tag
  ex. <div title="hello world"></div>
  */
  $("*").css("display","block");
  $(function() {$( document ).tooltip({position: { my: "center bottom-20", at: "center top"}});});
  //populate sample videos
  populateSampleVideos();
});
/***********************************************/
// for toggling rect patch sensor grid
/***********************************************/
function toggleColor(rID) {
  //can only change sensor in authoring mode
  if(!viewMode) {
    var svg = d3.select("svg")[0];
    var currColor = $("#r" + rID).css("fill");
    console.log(currColor);
    if(currColor === "rgb(170, 170, 170)") {
      $("#r" + rID).css("fill", "rgb(100,119,122)");
      miniGrid[rID].selected = true;
    } else {
      $("#r" + rID).css("fill", "rgb(170,170,170)");
      miniGrid[rID].selected = false;
    }
    sensorToEL();
  }
}

//for clearing all selected rectangles
function clearSelection() {
  for(i = 0; i < miniGrid.length; i+=1) {
    miniGrid[i].selected = false;
  }
  sensorToEL();
}

function rectGrid() {

  miniGrid = [];
  for(j = 0; j < y; j+=1) {
  for(i = 0; i < x; i+=1) {
    miniGrid.push(new RectPatch( (j*x + i), //id
      i * (patchW/x + padding) + 5,
      j * (patchH/y + padding) + 10,
      patchW/x, patchH/y));
    }
  }
  elOutput();
}

function RectPatch(n, px, py, sizeX, sizeY) {
  this.id = n;
  this.x_axis = px;
  this.y_axis = py;
  this.width = sizeX;
  this.height = sizeY;
  this.selected = false;
  this.color = "rgb(170,170,170)";

  this.intersect = function() {
    if(mouseIsPressed && mouseX-5 > this.x && mouseX-5 < this.x + sizeX
      && mouseY-5 > this.y && mouseY-5 < this.y + sizeY) {
      this.selected = !this.selected;
    }
  }

  this.display = function() {
    $("#r" + this.id).css("fill", "rgb(" + this.currColor() + ")");
  }

  this.currColor = function() {
    var r;
    var g;
    var b;
    if(this.selected) {
      r = 100;
      g = 119;
      b = 122;
    } else {
      r = 170;
      g = 170;
      b = 170;
    }
    return r + "," + g + "," + b;
  }

  //create the rect patch
  return this;
}

function elOutput() {
  var pad = 10;
  elPosX = 7;
  elPosY = 5;

  elOutputs = [];

  for (b = 0; b < elYn; b+=1) {
    for (a = 0; a < elXn; a+=1) {
      elOutputs.push(new elPatch(b * elXn + a,
        elPosX + a * (elW/elXn + 3), elPosY + (b+0.5) * elH/elYn,
        elW/elXn, elH/elYn));
      elOutputs[elOutputs.length -1].create();
    }
  }

  sensorToEL();
}

function elPatch(n, px, py, wi, he) {
  this.id = n;
  this.x = px;
  this.y = py;
  this.rad = 30;
  this.w = wi;
  this.h = he;
  this.strength = 10;
  this.color = elColor;
  this.points = [];

  this.display = function() {
    $("#p" + this.id).css("fill", "rgb(" + this.currColor() + ")");
  }

  //function for creating current color
  this.currColor = function() {
    var r = 2 * this.strength;
    var g = 8 * this.strength;
    var b = 10 * this.strength;
    return r + "," + g + "," + b;
  }

  this.create = function() {
    // fill(color(2 * this.strength,8 * this.strength, 10 * this.strength));
    // smooth();

    var poly1 = [];
    poly1.push(this.x);
    poly1.push(this.y);

    poly1.push(this.x);
    poly1.push(this.y + this.h/2);

    poly1.push(this.x + this.w/2);
    poly1.push(this.y + this.h);

    poly1.push(this.x + this.w/2);
    poly1.push(this.y + this.h/2);

    poly1.push(this.x + this.w);
    poly1.push(this.y);

    poly1.push(this.x + this.w);
    poly1.push(this.y + this.h/2);

    poly1.push(this.x + this.w/2);
    poly1.push(this.y + this.h);

    poly1.push(this.x + this.w/2);
    poly1.push(this.y + this.h/2);


    this.points = poly1;
    this.display();
  }

  return this;

}

function sensorToEL() {
  var elStrengths = [];

  for (z = 0; z < elOutputs.length; z+=1) {
    elStrengths[z] = 10;
  }

  for (i = 0; i < miniGrid.length; i+=1) {
    if(miniGrid[i].selected) {
      defaultMap(i, elStrengths);
    }
    miniGrid[i].display();
  }

  for( i = 0; i < elOutputs.length; i+=1) {
    if(typeof elStrengths[i] !== "undefined") {
      elOutputs[i].strength = elStrengths[i];
      elOutputs[i].display();
    }
  }
}

function default6x6Map(k, elStrengths) {

  for( i = k-1; i <= k + 1; i+=1) {
    if(i >= 0 && parseInt(i/elXn) === parseInt(k/elXn)) {
      for( j = 0; j < elYn/y + 2; j+=1) {
        elInd = parseInt(i/elXn) * (elYn/y) * elXn + j * elXn + i%elXn;
        elStrengths[elInd] += (1.5 - Math.abs(i - k)) *
                    (((elYn/y + 2)*0.5 - Math.abs(j - (elYn/y + 2)*0.45)) * 10);
      }
    }
  }
}

function defaultMap(k, elStrengths) {
  var LMorR = lmr(k);
  var lights = findLight(LMorR, k);

  if(elMap[lights] != undefined) {
    for( i = 0; i < elMap[lights].length; i+=1) {
      elStrengths[elMap[lights][i]] += 20;
    }
  }

}

function readSenses(input) {
  for( i = 0; i < miniGrid.length; i+=1) {
    miniGrid[i].selected = false;
  }
  for( i = 0; i < input.length; i+=1) {
    miniGrid[input[i]]. selected = true;
  }
}

function updateSensors(){
  sensors = [];
  for( i = 0; i < miniGrid.length; i+=1) {
    if(miniGrid[i].selected) {
      sensors.push(i);
    }
  }
  return sensors;
}

function savePose(){
  currentTime = $("#slider").slider( "value" );
  for( i = 0; i < data.events.length; i+=1) {
    if((data.events[i].startTime < currentTime &&
        data.events[i].endTime > currentTime) ||
        data.events[i].startTime == currentTime) {

      //update this pose"s sensor input array by miniGrid"s selected rectPatches
      data.events[i].pose.sensors = updateSensors();
      data.events[i].pose.posename = $("#poseName").val();
      data.events[i].pose.poseDesc = $("#yogaPoseDescription").val();
      $( "#" + timeSlices[i].id).attr("title", data.events[i].pose.posename);
        localStorage[vidId] = JSON.stringify(data);
        break;
    }
   }
}

function saveName() {
  currentTime = player.getCurrentTime();
  for( i = data.events.length-1; i >= 0; i--) {
    if((data.events[i].startTime < currentTime &&
        data.events[i].endTime > currentTime) ||
        data.events[i].startTime == currentTime) {
        data.events[i].pose.posename = $("#poseName").val();
      localStorage[vidId] = JSON.stringify(data);
        break;
    }
   }
}

function exportJson() {
   txt = localStorage[vidId];
    document.getElementById("export").href = "data:text/plain;charset=utf-8,"
        + encodeURIComponent(txt);
}

var jsData;
function readJson() {

  var jqxhr = $.getJSON( "../data.json", function(poses) {
  localStorage[vidId] = JSON.stringify(poses);
  })
  .done(function() {
    console.log( "second success" );
  })
  .fail(function() {
    console.log( "error" );
  })
  .always(function() {
    console.log( "complete" );
  });
}


function extractVideoID(url){
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if( match && match[7].length == 11 ){
        return match[7];
    }
    else{
        alert("Could not extract video ID.");
    }
}

function uploadVid() {
  var url = $("#vidURL").val();
  timeSlices = [];
  vidId = extractVideoID(url);
  $("#videoContainer").empty();





  designContent();
  onYouTubeIframeAPIReady();
  onPlayerReady();
}


function populateSampleVideos() {

  var samples = {"samples":[{"videoID": "7EkjlkYVzpA"},
              {"videoID": "ps3vmnVsnF8"},
              {"videoID": "0vnn0qXOrLw"}]};
  localStorage["sampleVideos"] = JSON.stringify(samples);
  var sampleVideos = JSON.parse(localStorage["sampleVideos"]).samples;

  for( i = 0; i < sampleVideos.length; i+=1) {
    $("#sampleVideos").append("<li onclick=\"loadSampleVid(\" + i + \");\" id = \"sample\" + i + \"\">" + "<iframe class = \"sampleVid\" src=\"http://www.youtube.com/embed/\"" + sampleVideos[i].videoID + "?autoplay=0&controls=0></iframe></li>");
  }

}

function loadSampleVid(vidNum) {
  var sampleVid= JSON.parse(localStorage["sampleVideos"]).samples[vidNum];
  vidId = sampleVid.videoID;
  console.log(sampleVid.videoID);

  $("#videoContainer").empty();




  designContent();
  onYouTubeIframeAPIReady();
  onPlayerReady();
}

function Pose(i, start, end, name, sens) {
  this.startTime = start;
  this.endTime = end;
  this.pose = {
    "poseid" : i,
    "posename" : name,
    "poseDesc" : "",
    "sensors" : sens,
  }
  return this;
}

function Slice(i, start, end, x1, x2) {
  this. id = i;
  this.startTime = start;
  this.endTime = end;
  this.startX = x1;
  this.endX = x2;

  return this;
}

function handleSlice() {
  slice(parseFloat($(".ui-slider-handle").css("left")),
        $("#slider").slider( "value" ));
}

function sliceFromMass(slicePoint, sliceTime) {

  var intervalIndex = -1;
  var currSlice;

  for( i = 0; i < timeSlices.length; i+=1) {
    if(timeSlices[i].startTime < sliceTime
      && timeSlices[i].endTime > sliceTime) {
      currSlice = timeSlices[i];
      intervalIndex = i;
      break;
    }
  }

  if (intervalIndex > -1) {
    sliceCount+=1;
    var interval1 = new Slice(sliceCount,
                          currSlice.startTime,
                          sliceTime,
                          currSlice.startX,
                          slicePoint);
    var pose1 = new Pose(sliceCount,
                currSlice.startTime,
                          sliceTime,
                          "",
                          []);

    sliceCount+=1;
    var interval2 = new Slice(sliceCount,
                          sliceTime,
                          currSlice.endTime,
                          slicePoint,
                          currSlice.endX);
    var pose2 = new Pose(sliceCount,
                sliceTime,
                          currSlice.endTime,
                          "",
                          []);

    //remove current slice
    timeSlices.splice(intervalIndex, 1);

     //add right slice
    timeSlices.splice(intervalIndex, 0, interval2);
    //add left slice
    timeSlices.splice(intervalIndex, 0, interval1);

    //redraw slices
    redrawSlices();
   }
}

function slice(slicePoint, sliceTime) {

  var intervalIndex = -1;
  var currSlice;

  for( i = 0; i < timeSlices.length; i+=1) {
    if(timeSlices[i].startTime < sliceTime
      && timeSlices[i].endTime > sliceTime) {
      currSlice = timeSlices[i];
      intervalIndex = i;
      break;
    }
  }

  if (intervalIndex > -1) {
    sliceCount+=1;
    var interval1 = new Slice(sliceCount,
                          currSlice.startTime,
                          sliceTime,
                          currSlice.startX,
                          slicePoint);
    var pose1 = new Pose(sliceCount,
                currSlice.startTime,
                          sliceTime,
                          data.events[intervalIndex].pose.posename,
                          data.events[intervalIndex].pose.sensors);

    sliceCount+=1;
    var interval2 = new Slice(sliceCount,
                          sliceTime,
                          currSlice.endTime,
                          slicePoint,
                          currSlice.endX);
    var pose2 = new Pose(sliceCount,
                sliceTime,
                          currSlice.endTime,
                          "",
                          []);

    //remove current slice
    timeSlices.splice(intervalIndex, 1);
    data.events.splice(intervalIndex, 1);

     //add right slice
    timeSlices.splice(intervalIndex, 0, interval2);
    data.events.splice(intervalIndex, 0, pose2);

    //add left slice
    timeSlices.splice(intervalIndex, 0, interval1);
    data.events.splice(intervalIndex, 0, pose1);

    //redraw slices
    redrawSlices();
   }
}

function redrawSlices() {
   $("#slices").empty();
    for( i = 0; i < timeSlices.length; i+=1) {
    $("#slices").append("<div id=" + timeSlices[i].id + " " + "class=\"selectable ui-widget-content slice\"><p>" + (i+1) + "</p></div>");
    $( "#" + timeSlices[i].id).attr("title", data.events[i].pose.posename);
    $( "#"+timeSlices[i].id).css({
                            "color" : "#FEFEFE",
                            "font-size":"0.8em",
                            "left" : "0px",
                            "width" : (timeSlices[i].endX - timeSlices[i].startX - 4) + "px"
                          });
    }

    $("#slices").selectable({stop: function() {
      $( ".ui-selected", this ).each(function() {

        //update handle
        for( j = 0; j < timeSlices.length; j+=1) {
          if($(".ui-selected").attr("id") == timeSlices[j].id) {
            $( "#slider" ).slider( "option", "value", timeSlices[j].startTime);
            break;
          }
        }
      });
    }});
}

function removeSlice() {

  var sliceTime = $("#slider").slider( "value" );
  var intervalIndex = -1;
  var currSlice;

  for( i = 0; i < timeSlices.length; i+=1) {
    if((timeSlices[i].startTime < sliceTime
      && timeSlices[i].endTime > sliceTime) ||
      timeSlices[i].startTime == sliceTime) {
      intervalIndex = i;
      currSlice = timeSlices[i];
      break;
    }
  }

  if(timeSlices.length > 1) {
     sliceCount+=1;

    if(intervalIndex == 0) {
      //first element
      var mergedInterval = new Slice(sliceCount,
                                    0, timeSlices[intervalIndex + 1].endTime,
                                    0, timeSlices[intervalIndex + 1].endX);

      var mergedPose = new Pose(sliceCount, 0, timeSlices[intervalIndex + 1].endTime,
                    data.events[intervalIndex].pose.posename,
                    data.events[intervalIndex].pose.sensors);

      var rm1 = timeSlices[intervalIndex];
      timeSlices.splice(intervalIndex, 1);
      data.events.splice(intervalIndex, 1);
      $("#" + rm1.id).remove();

      var rm2 = timeSlices[intervalIndex];
      timeSlices.splice(intervalIndex, 1);
      data.events.splice(intervalIndex, 1);
      $("#" + rm2.id).remove();

      timeSlices.splice(0, 0, mergedInterval);
      data.events.splice(0, 0, mergedPose);

    } else if (intervalIndex == timeSlices.length -1) {
      //last element
      mergedInterval = new Slice(sliceCount,
                                    timeSlices[intervalIndex - 1].startTime,
                                    timeSlices[intervalIndex].endTime,
                                    timeSlices[intervalIndex-1].startX,
                                    timeSlices[intervalIndex].endX);

      mergedPose = new Pose(sliceCount,
                                    timeSlices[intervalIndex - 1].startTime,
                                    timeSlices[intervalIndex].endTime,
                                    data.events[intervalIndex-1].posename,
                                    data.events[intervalIndex-1].sensors);

      rm1 = timeSlices[intervalIndex - 1];
      timeSlices.splice(intervalIndex - 1, 1);
      data.events.splice(intervalIndex-1, 1);
      $("#" + rm1.id).remove();

      rm2 = timeSlices[intervalIndex - 1];
      timeSlices.splice(intervalIndex - 1, 1);
      data.events.splice(intervalIndex-1, 1);
      $("#" + rm2.id).remove();

      timeSlices.push(mergedInterval);
      data.events.push(mergedPose);
    } else {
      //in between element
      var newPrevInterval = new Slice(sliceCount,
                                    timeSlices[intervalIndex - 1].startTime,
                                    timeSlices[intervalIndex].endTime,
                                    timeSlices[intervalIndex - 1].startX,
                                    timeSlices[intervalIndex].endX);

      var newPrevIPose = new Pose(sliceCount,
                                    timeSlices[intervalIndex - 1].startTime,
                                    timeSlices[intervalIndex].endTime,
                                    data.events[intervalIndex - 1].posename,
                                    data.events[intervalIndex - 1].sensors);

      //remove previous slice
      rm1 = timeSlices[intervalIndex-1];
      timeSlices.splice(intervalIndex-1, 1);
      data.events.splice(intervalIndex-1, 1);
      $("#" + rm1.id).remove();

      //remove current slice
      rm2 = timeSlices[intervalIndex-1];
      timeSlices.splice(intervalIndex-1, 1);
      data.events.splice(intervalIndex-1, 1);
      $("#" + rm2.id).remove();

      //update previous slice to merged slice
      timeSlices.splice(intervalIndex-1, 0, newPrevInterval);
      data.events.splice(intervalIndex-1, 0, newPrevIPose);
    }
  }
  redrawSlices();
}

function massSlice() {
  var reference = JSON.parse(localStorage[vidId]).events;
  var sliderWidth = parseFloat($("#slider").css("width"));
  var timeToSliderPos = sliderWidth/player.getDuration();

  for( i = 0; i < reference.length; i+=1) {
    sliceFromMass(timeToSliderPos * reference[i].startTime, reference[i].startTime - 0.1);
  }
}

function designContent() {





  //
  $("#poseNumber").html("Pose 0");

}

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  if(vidId != "") {
    player = new YT.Player("player", {
      height: vidWidth * 0.6,
      width: vidWidth,
      videoId: vidId,
      playerVars: {
        "controls": 0,
      },
      events: {
        "onReady": onPlayerReady,
        "onStateChange": onPlayerStateChange
      }
    });
  }
}

function displayUI() {

   $("#slider").slider({
      min : 0,
      slide: function(event, ui) {
        player.seekTo(ui.value);
        updateInfo(ui.value);
      },
      change: function( event, ui ) {

        //updating current Time display
        $("#currTime").html(secondToMin(ui.value));
        //update info based on time
        updateInfo(ui.value);
      }
  });

  if(player != undefined) {
    console.log(player);
    $("#slider").slider( "option", "max", player.getDuration());




    var firstSlice = new Slice(0, 0, player.getDuration(),
                           0, parseFloat($("#slider").css("width")));
    timeSlices.push(firstSlice);

  $("#slices").append("<div id=\"" + firstSlice.id + "\" class=\"selectable ui-widget-content slice\"><p>" + parseInt(firstSlice.id) + 1 +"</p></div>");

  $( "#"+firstSlice.id).css({"color" : "#FEFEFE",
                            "font-size":"0.8em",
                            "left" : "0px",
                            "width" : (firstSlice.endX - firstSlice.startX) + "px"});
  }

  $("#currTime").html(secondToMin(0));
  $("#totalTime").html(" / " + secondToMin(player.getDuration()));

  //slice up if there exists metadata
  if(data != undefined) {
    console.log("not undefined");
    massSlice();
  } else {
    console.log("undefined");
    var events = {"events": [new Pose(0, 0, player.getDuration(), "", [])]};
    data = events;
  }
}

function updateInfo(currentTime) {

  /*add server socket to read sensor data*/

  var currentEvent;

  for( i = data.events.length-1; i >= 0; i--) {
    if((data.events[i].startTime < currentTime &&
        data.events[i].endTime > currentTime) ||
        data.events[i].startTime == currentTime) {
      currentEvent = data.events[i];
      $("#poseNumber").html("Pose " + (i+1));
      break;
    }
  }

  //update sensors based on video meta data
  if(currentEvent != undefined) {
     //if slider handle is not within selected, unselect
    if($(".ui-selected").attr("id") != currentEvent.id) {
      $("#slices > .ui-selected").removeClass("ui-selected");
    }

    $("#poseName").val(currentEvent.pose.posename); //for authoring mode
    $("#poseNameP").html(currentEvent.pose.posename); //for viewing mode
    $("#yogaPoseDescription").val(currentEvent.pose.poseDesc); //for authoring mode
    $("#poseDescriptionP").html(currentEvent.pose.poseDesc); //for viewing mode

    readSenses(currentEvent.pose.sensors);
    sensorToEL();
  } else {
    $("#poseName").val("");
    $("#poseNameP").html("");
    $("#yogaPoseDescription").val("");
    $("#poseDescriptionP").html("");
    readSenses([]);
    sensorToEL();
  }
}


// 4. The API will call this function when the video player is ready.
// var videotime = 0;
function updateTime() {
   if(play) {
     // var videotime = $("#slider").slider( "value" );
     // videotime += 0.15;
     $("#slider").slider("option", "value", player.getCurrentTime());
     // player.seekTo(videotime);
   } else {
     player.pauseVideo();
   }
}

function togglePlayState() {
  if(play) {
    $("#playerState").html("Play");
    player.pauseVideo();
  } else {
    player.playVideo();
    $("#playerState").html("Pause");
  }
  play = !play;
}

function onPlayerReady(event) {

  //Instead of loading from local storage get it from the cloudl
  if(localStorage[vidId] != undefined) {
    data = JSON.parse(localStorage[vidId]);
  }

  //if you want to read from data folder
  /* $.getJSON( "../data/data.json", function(poses) {
    data = JSON.stringify(poses);
  })*/

  displayUI();
  $( "#slider" ).slider( "option", "value", 0);
  toggleModes();
  updateTime();
  setInterval(updateTime, 150);
}

// when the time changes, this will be called.
function onProgress(currentTime) {
  //update time
  $("#currTime").html(secondToMin(currentTime));
  $( "#slider" ).slider( "option", "value", currentTime );
}

function onPlayerStateChange(event) {

  if(localStorage[vidId] != undefined) {

  var currentTime = $("#slider").slider( "value" );
  var currentEvent;
    for( i = data.events.length-1; i >= 0; i--) {
      if((data.events[i].startTime < currentTime &&
        data.events[i].endTime > currentTime) ||
        data.events[i].startTime == currentTime) {
        currentEvent = data.events[i];
        break;
      }
    }

    if(currentEvent != undefined) {
      readSenses(currentEvent.pose.sensors);
      sensorToEL();
    }
  }

}

function stopVideo() {
  player.stopVideo();
}

function secondToMin(sec) {
    var hours   = Math.floor(sec / 3600);
    var minutes = Math.floor((sec - (hours * 3600)) / 60);
    var seconds = parseInt(sec - (hours * 3600) - (minutes * 60));

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+":"+minutes+":"+seconds;
    return time;
}

function editName() {
 currentTime = $("#slider").slider( "value" );
  for( i = data.events.length-1; i >= 0; i--) {
    if((data.events[i].startTime < currentTime &&
        data.events[i].endTime > currentTime) ||
        data.events[i].startTime == currentTime) {
        data.events[i].pose.name = $("#poseName").value;
        localStorage[vidId] = JSON.stringify(data);
        break;
    }
   }
}

function toggleModes() {
  if(viewMode) {
    $("#mode").html("View Mode");







  } else {
    $("#mode").html("Authoring Mode");
    //






  }
  viewMode = !viewMode;
}

function lmr(ind) {
  if(ind%x < parseInt(x/3)) {
    return "L";
  } else if(ind%x > (x - 1 - parseInt(x/3))) {
    return "R";
  } else {
    return "M";
  }
}

function findLight(lmr, ind) {
  var q = Math.round(((ind/y) * elYn)/y);
  if(q == 0) {
    q = 1;
  }
  if(q > elYn) {
    q = elYn;
  }
  return lmr + q.toString();
}