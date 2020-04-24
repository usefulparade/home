let w, canvWidth, canvHeight;
let columns;
let rows;
let board;
let next;
let c, cParent;
let speed;
let synths = [];
let envelopes = [];
let notes = [];
var speedP, speedSlider;
var volumeP, volumeSlider;
var detuneSlider, filterSlider;
var pitchSpread;
var context;
var touchIsDown;
var paused;
var scaleVal, microInterval;

var filter;

function setup() {
  
  context = getAudioContext();
  context.suspend();

  scaleVal = 2;

  if (windowWidth > 640){
    canvWidth = 640;
    canvHeight = 320;
    w = 40;
  } else {
    canvWidth = windowWidth;
    canvHeight = (canvWidth/16)*8;
    w = canvWidth/16;
  }

  c = createCanvas(canvWidth, canvHeight);
  cParent = document.getElementById("game");
  c.parent(cParent);

  // Calculate columns and rows
  columns = floor(width / w);
  rows = floor(height / w);

  // Wacky way to make a 2D array in JS
  board = new Array(columns);
  for (let i = 0; i < columns; i++) {
    board[i] = new Array(rows);
  }
  
  // Going to use multiple 2D arrays and swap them
  next = new Array(columns);
  for (i = 0; i < columns; i++) {
    next[i] = new Array(rows);
  }

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      board[i][j] = 0;
      next[i][j] = 0;
    }
  }
  
  notes = [48, 50, 52, 53, 55, 57, 59, 
          60, 62, 64, 65, 67, 69, 71, 
          72, 74, 76, 77, 79, 81, 83, 
          84, 86, 88];

  filter = new p5.LowPass();
  filter.freq(1100);
  filter.res(10);

  synths = new Array(columns);
  for (i = 0;i<columns;i++){
    synths[i] = new Array(rows);
  }

  envelopes = new Array(columns);
  for (i = 0;i<columns;i++){
    envelopes[i] = new Array(rows);
  }

  for (j=0; j<columns; j++){
    for (k=0;k<rows;k++){
      synths[j][k] = new p5.Oscillator();
      synths[j][k].freq(midiToFreq(notes[j]) * random(-1,1)*2);
      
      synths[j][k].start();

      envelopes[j][k] = new p5.Envelope()
      envelopes[j][k].setADSR(0.005, 0.5, 0.07, 0.01);
      envelopes[j][k].setRange(0.5, 0);
      synths[j][k].amp(envelopes[j][k]);
      synths[j][k].disconnect();
      synths[j][k].connect(filter);
    }
  }

  

  speed = 30;
  speedP = document.getElementById("speedP");
  speedSlider = document.getElementById("speedSlider");
  speedSliderChange();

  volume = 0.5;
  volumeP = document.getElementById("volumeP");
  volumeSlider = document.getElementById("volumeSlider");
  volumeSliderChange();

  pitchSpread = 2;
  microInterval = 1.0293;
  pitchSlider = document.getElementById("detuneSlider");
  detuneSliderChange();

  filterSlider = document.getElementById("filterSlider");
  filterSliderChange();
  // init();


  context.suspend();
  touchIsDown = false;
  paused = true;
}

function draw() {
  background(15, 15, 19);

  if (frameCount%speed == 0){
    if (!paused){
      generate();
    }
  }

  for ( let i = 0; i < columns;i++) {
    for ( let j = 0; j < rows;j++) {
      var r = w/2;
      var x = i*w+r;
      var y = j*w+r;
      
      if (mouseX > x-r && mouseX < x+r && mouseY > y-r && mouseY < y+r && board[i][j] != 1) {
        ellipse(i * w + w/2, j * w + w/2, w/2);
        if (mouseIsPressed){
          if (board[i][j] == 0){
            board[i][j] = 1;
            playVoice(i, j);
          }
        }
      }
      else if (touchIsDown){
          if (touches[0].x > x-r && touches[0].x < x+r && touches[0].y > y-r && touches[0].y < y+r && board[i][j] != 1) {
          board[i][j] = 1;
          playVoice(i, j);
        }
      }
      else if ((board[i][j] == 1)) fill(255);
      else noFill();
      stroke(255);
      ellipse(i * w + w/2, j * w + w/2, w);


    }
  }

}

// function mousePressed() {
//   init();
// }

// Fill board randomly
function randomize() {
  frameCount = 0;
  paused = false;

  userStartAudio();
  getAudioContext().resume();

  for (let x = 0; x<rows;x++){
    for (let y = 0; y<columns, y++;){
      synths[x][y].releaseVoice();
    }
  }

  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      board[i][j] = floor(random(1.2));
      next[i][j] = 0;
      if (board[i][j] == 1) playVoice(i, j);
    }
  }
}

// The process of creating the new generation
function generate() {

  // Loop through every spot in our 2D array and check spots neighbors
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Add up all the states in a 3x3 surrounding grid
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          neighbors += getNeighborWrapped(x+i, y+j);
        }
      }
      // A little trick to subtract the current cell's state since
      // we added it in the above loop
      neighbors -= board[x][y];
      // Rules of Life
      if      ((board[x][y] == 1) && (neighbors <  2)) next[x][y] = 0;           // Loneliness
      else if ((board[x][y] == 1) && (neighbors >  3)) next[x][y] = 0;           // Overpopulation
      else if ((board[x][y] == 0) && (neighbors == 3)) next[x][y] = 1;           // Reproduction
      else                                             next[x][y] = board[x][y]; // Stasis
    }
  }


  //play the sounds!
  for (let x2 = 0; x2 < columns; x2++) {
    for (let y2 = 0; y2 < rows; y2++) {
      
      if      ((board[x2][y2] == 0) && (next[x2][y2] == 0)) releaseVoice(x2, y2);                         // 0 to 0, no change, no voice
      else if ((board[x2][y2] == 0) && (next[x2][y2] == 1)) playVoice(x2, y2);        // 0 to 1, play a note!
      else if ((board[x2][y2] == 1) && (next[x2][y2] == 0)) releaseVoice(x2, y2);     // 1 to 0, release a note!
      
      else if ((board[x2][y2] == 1) && (next[x2][y2] == 1)) ;                         // 1 to 1, no change, keep playing
      else                                                  ;                         // shouldn't come to this but w/e!
    }
  }
  

  // Swap!
  let temp = board;
  board = next;
  next = temp;
}

 function getNeighborWrapped(c0, r0){
    var c, r;

    if (c0 < 0) c = c0 + columns;
    else c = c0 % columns;
    if (r0 < 0) r = r0 + rows;
    else r = r0 % rows;

    return board[c][r];
   }

function playVoice(x, y){
  let note = notes[x];
  let vel = map(y, 0, rows, 0.01, 0.5);
  envelopes[x][y].triggerAttack();
  // synths[x][y].amp(0.3, 0.0001);
}

function releaseVoice(x, y){
  let note = notes[x];
  envelopes[x][y].triggerRelease();
  // synths[x][y].amp(0, 0.0001);
}

function speedSliderChange(){
  speed = floor(speedSlider.value);
  // console.log(speed);
  // speedP.innerHTML = "speed: " + speed;
}

function volumeSliderChange(){
  volume = map(volumeSlider.value, 0, 100, 0, 1);
  masterVolume(volume);
}

function octUp(){
  for (i=0;i<notes.length;i++){
    if (scaleVal != 0){
      notes[i] += 12;
    } else {
      notes[i] = notes[i]*2;
    }
  }
  remapNotes();
}

function octDown(){
  
  for (i=0;i<notes.length;i++){
    if (scaleVal != 0){
      notes[i] -= 12;
    } else {
      notes[i] = notes[i]*0.5;
    }
  }
  remapNotes();
}

function stepUp(){

  for (i=0;i<notes.length;i++){
    if (scaleVal != 0){
      notes[i] += 1;
    } else {
      notes[i] = notes[i] * microInterval;
    }
  }
  remapNotes();
}

function stepDown(){
  for (i=0;i<notes.length;i++){
    if (scaleVal != 0){
      notes[i] -= 1;
    } else {
      notes[i] = notes[i] * (1/microInterval);
    }
  }
  remapNotes();
}


function detuneSliderChange(){
  pitchSpread = map(ySlider.value, 0, 100, 0, 10);
  remapNotes();
}

function filterSliderChange(){
  var frequency = map(filterSlider.value, 0, 100, 100, 1100);
  filter.freq(frequency);
}

function remapNotes(){
  if (scaleVal != 0){
    for (i=0;i<columns;i++){
      for (j=0;j<rows;j++){
        synths[i][j].freq(midiToFreq(notes[i+(rows-j-1)]) + (random(-1, 1)*pitchSpread));
      }
    }
  } else {
    for (i=0;i<columns;i++){
      for (j=0;j<rows;j++){
        synths[i][j].freq(notes[i+(rows-j-1)]) + (random(-1, 1)*(pitchSpread));
      }
    }
  }
}

function windowResized(){
  if (windowWidth > 640){
    resizeCanvas(640, 320);
    w = 40;
  } else {
    resizeCanvas(windowWidth, (windowWidth/16)*8);
    w = windowWidth/16;
  }
}

function touchStarted(){
  touchIsDown = true;
}
function touchEnded(){
  touchIsDown = false;
}

function playButton(){
  paused = false;
  frameCount = 0;

  userStartAudio();
  getAudioContext().resume();

  for (let x = 0; x<rows;x++){
    for (let y = 0; y<columns, y++;){
      synths[x][y].releaseVoice();
    }
  }
  
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      board[i][j] = board[i][j];
      next[i][j] = 0;
      if (board[i][j] == 1) playVoice(i, j);
    }
  }

}

function pauseButton(){
  paused = true;
}

function scaleSelector(scaleRadio){
  scaleVal = scaleRadio.value;
  var interval = 1;
  var base = notes[0];
  var newNotes = [];

  if (scaleVal == 0){
   makeMicroNotes();
      
  } else if (scaleVal == 1){
    notes = [48, 49, 50, 51, 52, 53, 54, 
            55, 56, 57 ,58 ,59 ,60, 61,
            62, 63, 64, 65, 66, 67, 68,
            69, 70, 71];

  } else if (scaleVal == 2){
    notes = [48, 50, 52, 53, 55, 57, 59, 
      60, 62, 64, 65, 67, 69, 71, 
      72, 74, 76, 77, 79, 81, 83, 
      84, 86, 88];
  } else if (scaleVal == 3){
    notes[0] = 48;
    for (i=1;i<notes.length;i++){
      notes[i] = notes[i-1] + 2;
    }
  }

  remapNotes();

}

function makeMicroNotes(){
  notes[0] = midiToFreq(60);
  microInterval = 1.0293;
  for (i=1;i<notes.length;i++){
    notes[i] = notes[i-1]*microInterval;
  }
}

