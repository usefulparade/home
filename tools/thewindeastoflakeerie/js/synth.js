
var canv;

var osc = [], 
    env = [], 
    chimes = [], 
    touchBodies = [];

var mouseMouse;

var filter, 
    bandpass, 
    whiteNoise;

var keyCodes = [90, 83, 88, 68, 67, 86, 71, 66, 72, 78, 74, 77, 188,
                81, 50, 87, 51, 69, 82, 53, 84, 54, 89, 55, 85, 73];
var notes = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48,
            48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];

var oscActive = 0;

var height;

var floor, wallR;

function setup(){
    var canvasParent = select(".p5Canvas");
    canv = createCanvas(windowWidth,windowHeight);
    canv.parent(canvasParent);
    filter = new p5.LowPass();

    for (j=0;j<notes.length;j++){
        notes[j] = notes[j] + 24;
    }

    whiteNoise = new p5.Noise();
    whiteNoise.disconnect();
    whiteNoise.connect(filter);
    whiteNoise.start();

    for (i=0;i<allBodies.length;i++){
        osc[i] = new p5.Oscillator();
        osc[i].setType('square');
        osc[i].freq(midiToFreq(notes[i]));
        // osc[i].amp(0);
        osc[i].disconnect();
        osc[i].connect(filter);
        osc[i].start();

        env[i] = new p5.Envelope();
        env[i].setADSR(0.001, 0.1, 0.3, 1.5);
        env[i].setRange(0.1, 0);
        env[i].setExp(true);

        osc[i].amp(env[i]);

        chimes[i] = new Chime(allBodies[i].position.x, allBodies[i].position.y);
    }

    // add walls

    floor = Bodies.rectangle(width/2, height+100, width*10, 210, {isStatic: true});
    World.add(world, floor);

    wallR = Bodies.rectangle(width+100, height/2, 210, height*10, {isStatic: true});
    // Body.rotate(wallR, 45);
    World.add(world, wallR);

    //add mouse body

    mouseMouse = new mouseBody(-100, -100);

    World.add(world, mouseMouse.body);
}

function draw(){
    clear();
    // background(0);

    filter.res(2);
    filter.freq(map(allBodies[allBodies.length-1].position.x, -200, 300, 80, 300));

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

    
    push();
        fill(250,250,250);
        noStroke();
        beginShape();
        for (i=0;i<allBodies.length;i++){
            vertex(allBodies[i].position.x, allBodies[i].position.y);
        }
        endShape();
    pop();

    if (random() > 0.9){
        makeLeaf();
    }

    showLeaves();
    destroyLeaves();
    mouseMouse.move();

    
    // masterVolume(constrain(map((allBodies[allBodies.length-1].position.x - allBodies[0].position.x), -1000, 1000, 0, 1), 0, 1), 0.1);

    // show mouse / touch circle
    if (touchBodies.length > 0){
        push();
            // ellipse(touchBodies[0].position.x, touchBodies[0].position.y, 30, 30);
        pop();
    }

}

function noiseGen(){
    noiseX = (noiseX + Math.random()) % 1000;
    noiseY = (noiseY + Math.random()) % 1000;

    return (noise(noiseX, noiseY)*2 - 1);
}



function makeLeaf(){
    var newLeaf = Bodies.rectangle(random(0, width), random(0, -height), 5, 5);
    newLeaf.frictionAir = random(0.03, 0.04);
    Body.setMass(newLeaf, random(0, 0.05));
    allLeaves.push(newLeaf);
    World.add(world, newLeaf);
    // console.log("leaf!");
}


function showLeaves(){
    for (i=0;i<allLeaves.length;i++){
        noStroke();
        fill(250, 250, 250);
        rotate(allLeaves[i].rotationZ);
        rect(allLeaves[i].position.x, allLeaves[i].position.y, 5, 5);
    }
}

function destroyLeaves(){
    for (i=0;i<allLeaves.length;i++){
        if (allLeaves[i].position.y > height){
            World.remove(world, allLeaves[i]);
            allLeaves.splice(i, 1);
        }

        if (allLeaves.length > 200){
            World.remove(world, allLeaves[0]);
            allLeaves.shift();
        }
    }
}


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

function windowResized(){
    resizeCanvas(windowWidth, windowHeight);
    Body.setPosition(wallR, new p5.Vector(width+100, wallR.position.y));
    Body.setPosition(floor, new p5.Vector(floor.position.x, height+100));
    Composites.setPosition(rope, new p5.Vector(width*0.1, 50));
}

// KEYPRESSES

function keyPressed(){
    for (i=0;i<keyCodes.length;i++){
        if (keyCode == keyCodes[i]){
            osc[oscActive].freq(midiToFreq(notes[i]));
            env[oscActive].play();
            chimes[oscActive].bonk();
            oscActive = (oscActive + 1) % osc.length;
        }
    }

    if (keyCode == 219){
        for (j=0;j<notes.length;j++){
            notes[j] -= 12;
        }
    }
    if (keyCode == 221){
        for (j=0;j<notes.length;j++){
            notes[j] += 12;
        }
    }
}

function keyReleased(){
    for (i=0;i<keyCodes.length;i++){
        if (keyCode == keyCodes[i]){
            // osc[oscActive].freq(midiToFreq(notes[i]));
            // osc[0].freq(midiToFreq(notes[i]));
            // env[0].triggerRelease();
            // oscActive = (oscActive + 1) % osc.length;
            // console.log(oscActive);
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
}

// function mousePressed(){
//     var newTouchBody = Bodies.circle(mouseX, mouseY, 30, 30);
//     Body.setStatic(newTouchBody, true);
//     touchBodies.push(newTouchBody);
//     World.add(world, newTouchBody);
// }

// function mouseDragged(){  
//     Body.setPosition(touchBodies[0], new p5.Vector(mouseX, mouseY)); 
// }

// function mouseReleased(){
//     World.remove(world, touchBodies[0]);
//     touchBodies.pop();
// }
