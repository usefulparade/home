var canv;

var osc = [], 
    env = [], 
    chimes = [], 
    touchBodies = [];

var fmOsc, fmBaseline, fmPitch;

var mouseMouse;

var windFilter, 
    chimeFilter,
    whiteNoise;

var keyCodes = [90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188,
                81, 50, 87, 51, 69, 82, 53, 84, 54, 89, 55, 85, 73];
var notes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
            48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];
var microNotes = [];

var oscActive = 0;

var height;

var floor, wallR;

var volSlider, releaseSlider;

var options, optionsButton;
var optionsAreOpen = false;

var chimeMax, chimeVal, chimeValNormalized;

var snowAmt;

var scaleVal, microInterval;

function setup(){

    //normal canvas setup stuff

    var canvasParent = select(".p5Canvas");
    canv = createCanvas(windowWidth,windowHeight);
    canv.parent(canvasParent);

    // setup the lowpass filters

    windFilter = new p5.LowPass();
    windFilter.res(2);
    chimeFilter = new p5.LowPass();
    chimeFilter.res(5);

    // i just didn't want to re-type all the numbers lol
    for (j=0;j<notes.length;j++){
        notes[j] = notes[j] + 24;
    }

    // WHITE NOISE
    whiteNoise = new p5.Noise();
    whiteNoise.disconnect();
    whiteNoise.connect(windFilter);
    whiteNoise.start();


    // init the FM oscillator, which modulates the main oscillators
    fmBaseline = 600;
    fmPitch = 600;
    fmOsc = new p5.Oscillator();
    fmOsc.setType('sine');
    fmOsc.freq(fmPitch);
    fmOsc.amp(150);
    fmOsc.start();
    fmOsc.disconnect();

    
    for (i=0;i<allBodies.length;i++){
        // init ALL main oscillators
        osc[i] = new p5.Oscillator();
        osc[i].setType('square');
        osc[i].freq(midiToFreq(notes[i]));
        osc[i].freq(fmOsc);
        osc[i].disconnect();
        osc[i].connect(chimeFilter);
        osc[i].start();

        // one envelope per oscillator
        env[i] = new p5.Envelope();
        env[i].setADSR(0.001, 0.1, 0.3, 1.5);
        env[i].setRange(0.4, 0);
        env[i].setExp(true);

        // hook them all up
        osc[i].amp(env[i]);

        // make the chimes
        chimes[i] = new Chime(allBodies[i].position.x, allBodies[i].position.y); 
    }

    // this value will come from the user controls, determines notes
    scaleVal = 2;

    // add walls
    floor = Bodies.rectangle(width/2, height+500, width*10, 1010, {isStatic: true});
    World.add(world, floor);

    wallR = Bodies.rectangle(width+500, height/2, 1010, height*10, {isStatic: true});
    World.add(world, wallR);

    //add mouse body
    mouseMouse = new mouseBody(-100, -100);
    World.add(world, mouseMouse.body);

    // grab some DOM elements
    volSlider = document.getElementById("vol");
    releaseSlider = document.getElementById("release");
    options = document.getElementById("options");
    optionsButton = document.getElementById("optionsButton");
    optionsAreOpen = false;

    // init chime values
    chimeMax = allBodies[allBodies.length-1].position.x;
    chimeVal = chimeMax;
    chimeValNormalized = chimeVal / chimeMax;

    snowAmt = 0.9;

    userStartAudio();
    makeMicroNotes();
}

function draw(){
    clear();

    // keep chime position values up to date, to control various parameters
    chimeVal = allBodies[allBodies.length - 1].position.x;
    chimeValNormalized = chimeVal / chimeMax;

    // such as: filters!
    windFilter.freq(map(chimeValNormalized, -0.5, 1, 80, 500));
    chimeFilter.freq(map(chimeValNormalized, -0.5, 1, 80, 1000));

    // update & draw the chimes
    push();
        stroke(250, 250, 250);
        noFill();
        for (j=0;j<allBodies.length;j++){
            if (j == oscActive){
                // fill(250, 250, 250);
            } else {
                noFill();
            }
            chimes[j].update(allBodies[j].position.x, allBodies[j].position.y);
            chimes[j].show();
        }
    pop();

    // draw the cloth
    push();
        fill(250,250,250);
        noStroke();
        beginShape();
        for (i=0;i<allBodies.length;i++){
            vertex(allBodies[i].position.x, allBodies[i].position.y);
        }
        endShape();
    pop();

    // handle snowflakes :)
    if (random() > snowAmt){
        makeFlake();
    }
    showFlakes();
    destroyFlakes();
    mouseMouse.move();

    // hook volume up to slider
    masterVolume(map(volSlider.value, 0, 100, 0, 1));

    // update fm pitch & fluctuate with chimes
    fmPitch = fmBaseline + chimeValNormalized * 500;
    fmOsc.freq(fmPitch);
}

// makenoise 0-coast

function noiseGen(){
    noiseX = (noiseX + Math.random()) % 1000;
    noiseY = (noiseY + Math.random()) % 1000;

    return (noise(noiseX, noiseY)*2 - 1);
}


// three functions for handling snowflakes

function makeFlake(){
    var newFlake = Bodies.rectangle(random(0, width), random(0, -height), 5, 5);
    newFlake.frictionAir = random(0.03, 0.04);
    Body.setMass(newFlake, random(0, 0.05));
    allFlakes.push(newFlake);
    World.add(world, newFlake);
}

function showFlakes(){
    for (i=0;i<allFlakes.length;i++){
        noStroke();
        fill(250, 250, 250);
        rotate(allFlakes[i].rotationZ);
        rect(allFlakes[i].position.x, allFlakes[i].position.y, 5, 5);
    }
}

function destroyFlakes(){
    for (i=0;i<allFlakes.length;i++){
        if (allFlakes[i].position.y > height*2){
            World.remove(world, allFlakes[i]);
            allFlakes.splice(i, 1);
        }

        if (allFlakes.length > 200){
            World.remove(world, allFlakes[0]);
            allFlakes.shift();
        }
    }
}

// CHIME object definition

var Chime = function(_x, _y){
    this.position = new p5.Vector(_x, _y);
    this.lerpVal = 0;
    this.size = 25;
    this.size2 = 0;

    this.update = function(_x, _y){
        this.position = new p5.Vector(_x, _y);
    };

    this.show = function(){
        //main
        push();
            fill(250, 250, 250, lerp(0, 255, this.lerpVal));
            // stroke(250, 250, 250);
            noStroke();
            ellipse(this.position.x, this.position.y, this.size);
        pop();

        //radiation
        push();
            noFill();
            stroke(250, 250, 250, lerp(0, 255, this.lerpVal));
            ellipse(this.position.x, this.position.y, lerp(this.size*2, this.size, this.lerpVal));
        pop();

        if (this.lerpVal > 0){
            this.lerpVal -= 0.02;
        }

    };

    this.bonk = function(){
        this.lerpVal = 1;
    };
};

// re-set some elements on window resize

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    Body.setPosition(wallR, new p5.Vector(width+500, wallR.position.y));
    Body.setPosition(floor, new p5.Vector(floor.position.x, height+500));
    Composites.setPosition(rope, new p5.Vector(width*0.1, 50));
}

// KEYPRESSES

function keyPressed(){
    for (i=0;i<keyCodes.length;i++){
        if (keyCode == keyCodes[i]){
            if (scaleVal != 3){
                osc[oscActive].freq(midiToFreq(notes[i]));
            } else {
                osc[oscActive].freq(microNotes[i]);
            }
            env[oscActive].play();
            chimes[oscActive].bonk();
            oscActive = (oscActive + 1) % osc.length;
        }
    }

    if (keyCode == 219){
        for (j=0;j<notes.length;j++){
            notes[j] -= 12;
            microNotes[j] = microNotes[j] * 0.5;
        }
    }
    if (keyCode == 221){
        for (j=0;j<notes.length;j++){
            notes[j] += 12;
            microNotes[j] = microNotes[j] * 2;
        }
    }
}


//TOUCHES

function touchStarted(){
    var newTouchBody = Bodies.circle(touches[0].x, touches[0].y, 30, 30);
    Body.setStatic(newTouchBody, true);
    touchBodies.push(newTouchBody);
    World.add(world, newTouchBody);
    World.remove(world, mouseMouse.body);
}

function touchMoved(){  
    Body.setPosition(touchBodies[0], new p5.Vector(touches[0].x, touches[0].y)); 
}

function touchEnded(){
    World.remove(world, touchBodies[0]);
    touchBodies.pop();
    
}

//MOUSE

var mouseBody = function(_x, _y){
    this.position = new p5.Vector(_x, _y);
    this.body = Bodies.circle(this.position.x, this.position.y + 15, 30, 30);
    Body.setStatic(this.body, true);

    this.move = function(){
        this.position = new p5.Vector(mouseX, mouseY+15);
        Body.setPosition(this.body, this.position);
    };
};

function mousePressed(){
}

function mouseDragged(){  
}

function mouseReleased(){
}

// grabbing values from various sliders & checkboxes

function waveformSelector(radioChanger){
    var waveforms = ['sine', 'triangle', 'square', 'sawtooth'];
    for (i=0;i<osc.length;i++){
        osc[i].setType(waveforms[radioChanger.value]);
    }
}

function releaseChange(releaseSlider){
    var newRelease = map(releaseSlider.value, 0, 100, 0.5, 12);
    console.log(newRelease);
    for (i=0;i<env.length;i++){
        env[i].setADSR(0.001, 0.1, 0.3, newRelease);
        env[i].setRange(0.4, 0);
        env[i].setExp(true);
    }
}

function fmAmp(fmAmpSlider){
    var fmAmp = map(fmAmpSlider.value, 0, 100, 0, 600);
    fmOsc.amp(fmAmp);
}

function fmFreq(fmFreqSlider){
    var fmFreq = map(fmFreqSlider.value, 0, 100, 0.1, 1200);
    fmBaseline = fmFreq;
}

function snowChange(snowSlider){
    var newSnow;
    if (snowSlider.value > 80){
        newSnow = map(snowSlider.value, 100, 80, 0.2, 0.9);
    } else {
        newSnow = map(snowSlider.value, 80, 0, 0.9, 0.99);
    }
    snowAmt = newSnow;
}

function scaleSelector(scaleRadio){
    scaleVal = scaleRadio.value;
    var newInterval = 0;
    var newBase = notes[0];
    var newNotes = [];

    if (scaleVal == 0){
        newBase = notes[0] - int(random(12, 24));
        newInterval = 7;
        osc[0].freq(midiToFreq(newBase));
    } else if (scaleVal == 1){
        newBase = notes[0] - int(random(12, 24));
        newInterval = 5;
        osc[0].freq(midiToFreq(newBase));
    } else if (scaleVal == 2){
        newBase = int(random(45, 60));
        newInterval = 1;
        osc[0].freq(midiToFreq(newBase));
    } else if (scaleVal == 3){
        newBase = midiToFreq(int(random(45, 60)));
        osc[0].freq(newBase);
    }

    newNotes[0] = newBase;
    

    for (i=1;i<osc.length;i++){
        if (scaleVal != 3){
            newNotes[i] = newNotes[i-1] + newInterval;
            osc[i].freq(midiToFreq(newNotes[i]));
        } else {
            newNotes[i] = newNotes[i-1]*microInterval;
            osc[i].freq(newNotes[i]);
        }
    }
}


// toggle the options box

function optionsToggle(){
    if (!optionsAreOpen){
        options.setAttribute('style', 'height: 90%');
        optionsButton.setAttribute('style', 'transform: rotate(855deg)');
        optionsAreOpen = true;
    } else {
        options.setAttribute('style', 'height: 0%');
        optionsButton.setAttribute('style', 'transform: rotate(0deg)');
        optionsAreOpen = false;
    }
}

// generate an array of quarter tones from a base freq;

function makeMicroNotes(){
    microNotes[0] = midiToFreq(60);
    microInterval = 1.0293;
    for (i=1;i<30;i++){
        if (i == 13){
            microNotes[i] = microNotes[i-1];
        } else {
            microNotes[i] = microNotes[i-1]*microInterval;
        }
    }
}