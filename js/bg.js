var c, cParent; 
var col;
var vertices = [];
var shapePoints = [];
var circlePoints = [];

var mode;

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
    fill(col);
    noStroke();
    beginShape();
      for (j=0;j<shapePoints.length;j++){
          vertex(width*shapePoints[j].x, height*shapePoints[j].y);
      }
    endShape(CLOSE);
  pop();

  push();
    noFill();
    stroke(col);
    
    if (mode == 0){
      strokeWeight(10);
      beginShape(POINTS);
    } else if (mode==1){
      strokeWeight(2);
      beginShape(LINES);
    }
      for(i=0;i<vertices.length;i++){
        
          vertex(vertices[i].x, vertices[i].y);
      }
    endShape();
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
    noFill();
    stroke(col);
    strokeWeight(2);
    ellipse(circlePoints[i].x, circlePoints[i].y, 50, 50);
    // circlePoints[i].add(new p5.Vector(random(-0.3, 0.3),random(0.5,1)));
  }

  while (vertices.length > 200){
    vertices.shift();
    if (mode==1){ // in lines mode, have to get rid of 2 every time to avoid flickering
      vertices.shift();
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

function makeShape(){
  shapePoints[0] = new p5.Vector(random(0.4, 0.5), 1);
  shapePoints[1] = new p5.Vector(random(0.6, 0.7), random(0.6, 0.7));
  shapePoints[2] = new p5.Vector(random(0.8, 0.9), random(0.4, 0.5));
  shapePoints[3] = new p5.Vector(1, random(0.4, 0.5));
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