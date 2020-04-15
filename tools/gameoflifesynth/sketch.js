let w;
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
var pitchSpread;

function setup() {
  c = createCanvas(640, 320);
  cParent = document.getElementById("game");
  c.parent(cParent);

  w = 40;
  // Calculate columns and rows
  columns = floor(width / w);
  rows = floor(height / w);
  // Wacky way to make a 2D array is JS
  board = new Array(columns);
  for (let i = 0; i < columns; i++) {
    board[i] = new Array(rows);
  }
  // Going to use multiple 2D arrays and swap them
  next = new Array(columns);
  for (i = 0; i < columns; i++) {
    next[i] = new Array(rows);
  }
  
  notes = [48, 50, 52, 53, 55, 57, 59, 60, 62, 64, 65, 67, 69, 71, 72, 74, 76];
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
      envelopes[j][k].setADSR(0, 0.5, 0.07, 0);
      envelopes[j][k].setRange(0.5, 0);
      synths[j][k].amp(envelopes[j][k]);
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
  pitchSlider = document.getElementById("ySlider");
  ySliderChange();
  // init();
}

function draw() {
  clear();
  if (frameCount%speed == 0){
    generate();
  }
  for ( let i = 0; i < columns;i++) {
    for ( let j = 0; j < rows;j++) {
      if ((board[i][j] == 1)) fill(255);
      else noFill();
      stroke(255);
      ellipse(i * w + w/2, j * w + w/2, w);
      // rect(i * w + w/2, j * w, w-1, w-1);
    }
  }

}

// reset board when mouse is pressed
// function mousePressed() {
//   init();
// }

// Fill board randomly
function init() {
  frameCount = 0;
  userStartAudio();

  for (let x = 0; x<rows;x++){
    for (let y = 0; y<columns, y++;){
      synths[x][y].releaseVoice();
    }
  }
  for (let i = 0; i < columns; i++) {
    for (let j = 0; j < rows; j++) {
      // Lining the edges with 0s
      if (i == 0 || j == 0 || i == columns-1 || j == rows-1) board[i][j] = 0; 
      // Filling the rest randomly
      else board[i][j] = floor(random(2));
      next[i][j] = 0;
      if (board[i][j] == 1) playVoice(i, j);
    }
  }
}

// The process of creating the new generation
function generate() {

  // Loop through every spot in our 2D array and check spots neighbors
  for (let x = 1; x < columns - 1; x++) {
    for (let y = 1; y < rows - 1; y++) {
      // Add up all the states in a 3x3 surrounding grid
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          neighbors += board[x+i][y+j];
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
  for (let x2 = 1; x2 < columns - 1; x2++) {
    for (let y2 = 1; y2 < rows - 1; y2++) {
      
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
    notes[i] += 12;
  }
  remapNotes();
}

function octDown(){
  for (i=0;i<notes.length;i++){
    notes[i] -= 12;
  }
  remapNotes();
}

function stepUp(){
  for (i=0;i<notes.length;i++){
    notes[i] += 1;
  }
  remapNotes();
}

function setpDown(){
  for (i=0;i<notes.length;i++){
    notes[i] -= 1;
  }
  remapNotes();
}


function ySliderChange(){
  pitchSpread = map(ySlider.value, 0, 100, 0, 10);
  remapNotes();
}

function remapNotes(){
  for (i=0;i<columns;i++){
    for (j=0;j<rows;j++){
      synths[i][j].freq(midiToFreq(notes[i]) + (random(-1, 1)*pitchSpread));
    }
  }
}


