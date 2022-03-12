var c, cParent; 
var col;
var vertices = [];
var shapePoints = [];
var circlePoints = [];

var mode;

p5.disableFriendlyErrors = true; // disables FES

function setup(){

  c = createCanvas(windowWidth, windowHeight);
  cParent = select('#bg');
  c.parent(cParent);
  col = color(254, 215, 102);

  makeShape();

  // mode = floor(random(0,1.9));
  mode = 0;
  
}

function draw(){
  
  clear();
  push();
    translate(width*0.5, height*0.5);
    fill(col);
    noStroke();
    beginShape();
      for (j=0;j<shapePoints.length;j++){
          vertex(width*shapePoints[j].x*0.5, height*shapePoints[j].y*0.5);
      }
    endShape(CLOSE);
  pop();

  push();
    noFill();
    stroke(col);
    if (mode == 0){
      strokeWeight(10);
      beginShape(POINTS);
          for(i=0;i<vertices.length;i++){
            
            vertex(vertices[i].x, vertices[i].y);
        }
      endShape();
      //   strokeWeight(1);
      // beginShape();
      //     for(i=0;i<vertices.length;i++){
            
      //       vertex(vertices[i].x, vertices[i].y);
      //   }
      // endShape();
    } else if (mode==1){
      strokeWeight(2);
      beginShape();
          for(i=0;i<vertices.length;i++){
            
            vertex(vertices[i].x, vertices[i].y);
        }
      endShape();
    }
  pop();

  if (mouseX != 0 && mouseY != 0){
    // ellipse(mouseX, mouseY, 10, 10);
    // vertex(mouseX, mouseY);
    if (!mouseIsPressed){
      vertices.push(new p5.Vector(mouseX, mouseY, 1));
    } else {
      // vertices.push(new p5.Vector(mouseX, mouseY, 0));
    }
  }

  for (i=0;i<circlePoints.length;i++){
    var s;
    fill(col);
    stroke(col);
    strokeWeight(2);
    if (mode == 1){
      s = 50;
    } else {
      s = 100;
    }
    ellipse(circlePoints[i].x, circlePoints[i].y, s, s);
    // circlePoints[i].add(new p5.Vector(random(-0.3, 0.3),random(0.5,1)));
  }

  if (circlePoints.length > 1){
    if (mode==1){
      circlePoints.shift();
    }
  }

  if (vertices.length > 200){
    if (mode!=1){ // in lines mode (mobile), don't get rid of old vertices
      if (circlePoints.includes(p5.Vector(vertices[0].x, vertices[0].y))){
        circlePoints.shift();
      }
      vertices.shift();
      
    } else {
    }
  }

  
}

function mousePressed(){
  // noFill();
  // stroke(col);
  // strokeWeight(2);
  // ellipse(mouseX, mouseY, 100, 100);
  circlePoints.push(new p5.Vector(mouseX, mouseY));

  // mode = (mode+1)%2;
}

function touchStarted(){
  mode = 1;
}

function makeShape(){
  shapePoints[0] = new p5.Vector(random(0.4, 0.5), 1);
  shapePoints[1] = new p5.Vector(random(0.6, 0.7), random(0.6, 0.7));
  shapePoints[2] = new p5.Vector(random(0.8, 0.9), random(0.4, 0.5));
  shapePoints[3] = new p5.Vector(1, random(0.35, 0.45));
  shapePoints[4] = new p5.Vector(1, 1);
}

function colorChange(_page){
  if (_page == 0){
      col = color(254, 215, 102);
  } else if (_page == 1){
      col = color(254, 102, 102);
  } else if (_page == 2){
      col = color(229, 244, 239);
  }
}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight);
}