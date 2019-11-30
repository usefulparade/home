/// SOURCES!!
/// noise.js by josephg
/// matter.js
/// p5.js
/// NOAA api

var allBodies = [];
var allLeaves = [];

var chainLength = 16;

function setup(){
    noiseSeed(random()*100);
}

//CALL THE JSON

var windData = [];
var dataReady = false;
var noiseVal = 0,
    noiseX = 0, 
    noiseY = 0;

var baseSpeed, gustSpeed, diffSpeed;
var combinedWindSpeed = 0;

function windUpdate(){
    var base = "https://tidesandcurrents.noaa.gov/api/datagetter?";
    var options = "date=latest&station=9063020&datum=LWD&product=wind&units=metric&time_zone=lst_ldt&application=ports_screen&format=json";
    var url = base + options;
    console.log(url);
    var request = new XMLHttpRequest();
    var data = {
        model : "default",
    };

    request.open('GET', url, true);
    request.send(JSON.stringify(data));

    request.onreadystatechange = function(){
        if (request.readyState == 4 && request.status == 200){
            windData = JSON.parse(request.response);
            console.log(windData);
            dataReady = true;

        } else {
        }

    };
}

// seed the noise

// noise.seed(Math.random());

// noiseSeed(random()*100);

// START MATTER JS STUFF

var w = window.innerWidth,
    h = window.innerHeight;

// module aliases
var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Body = Matter.Body,
    Composites = Matter.Composites,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    World = Matter.World,
    Bodies = Matter.Bodies;
    Events = Matter.Events;
    Composite = Matter.Composite;
    Constraint = Matter.Constraint;
    Detector = Matter.Detector;



// create an engine
var engine = Engine.create(),
    world = engine.world;

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: w,
        height: h,
        showAngleIndicator: true,
        showCollisions: true,
        showVelocity: true
    }
});



// add cloth
var group = Body.nextGroup(true),

group = Body.nextGroup(true);

if (h > 750){
    chainLength = 16;
} else if (h > 400 && h <= 750){
    chainLength = 8;
} else {
    chainLength = 6;
}

var rope = Composites.stack(w*0.1, 50, chainLength, 1, 1, 0, function(x, y) {
    var newBody = Bodies.rectangle(x, y, 30, 20, { collisionFilter: { group: group } });
    allBodies.push(newBody);
    return newBody;
});

Composites.chain(rope, 0.5, 0, -0.5, 0, { stiffness: 0.2, length: 10, render: { type: 'line' } });
Composite.add(rope, Constraint.create({ 
    bodyB: rope.bodies[0],
    pointB: { x: 0, y: 0 },
    pointA: { x: rope.bodies[0].position.x, y: rope.bodies[0].position.y },
    stiffness: 1
}));

World.add(world, rope);



//update wind

Events.on(engine, "beforeUpdate", function(){

    noiseVal = noiseGen();
    baseSpeed = windData.data[0].s;
    gustSpeed = windData.data[0].g;
    // baseSpeed = 50;
    // gustSpeed = 70;
    diffSpeed = gustSpeed - baseSpeed;

    if (dataReady){
        if (noiseVal >= 0.9){
            // if noise gets above 0.9, make a gust!
           combinedWindSpeed = noiseVal*(gustSpeed);
        } else if (noiseVal < 0.9 && noiseVal > 0){
            // otherwise, if it's positive, just be windy
            combinedWindSpeed = noiseVal*(baseSpeed);
        } else {
            // when noise is negative, give us a lull
            combinedWindSpeed = noiseVal*(diffSpeed*0.5);
        }
    } else {
        combinedWindSpeed = noiseVal;
    }

    world.gravity.x = (combinedWindSpeed / 9.81);
    world.gravity.y = 1 - (combinedWindSpeed / 20);
    
});

// update canvas 
Events.on(engine, "beforeUpdate", function(){
    w = window.innerWidth; 
    h = window.innerHeight;
    rope.xOffsetA = w*0.5;
});

// play chimes

Events.on(engine, "collisionStart", function (event){
    var pairs = event.pairs;
    // console.log(event);
    // console.log(pair.bodyB.speed);
    for (i=0;i<pairs.length;i++){
        pair = pairs[i];
        // if it's not the mouse, & one of the pair is a chime, play!
        if (pair.bodyA != mouseMouse.body && pair.bodyB != mouseMouse.body){
            for (j=0;j<allBodies.length;j++){
                if (pair.bodyA == allBodies[j] || pair.bodyB == allBodies[j]){
                    env[j].play();
                    chimes[j].bonk();
                    
                }
            }
        }

            // if (pair.bodyA == allBodies[j]){
            //     // osc[j].scale(0, 1, 0, (pair.bodyB.speed * 0.1))
            //     env[j].setRange(pair.bodyB.speed * 0.1, 0);
            //     env[j].play();
            //     chimes[j].bonk();
                
            // }
        }
    
});

// update text

// add mouse control
// var mouse = Mouse.create(render.canvas),
// mouseConstraint = MouseConstraint.create(engine, {
//     mouse: mouse,
//     constraint: {
//         stiffness: 0.98,
//         render: {
//             visible: false
//         }
//     }
// });
// World.add(world,mouseConstraint);
// render.mouse = mouse;

// run the engine
Engine.run(engine);

// run the renderer
// Render.run(render);

// generate noise!

function noiseGen(){
    noiseX = (noiseX + Math.random()) % 1000;
    noiseY = (noiseY + Math.random()) % 1000;

    return (noise(noiseX, noiseY)*2 - 1);
}

// update window

function windowResized(){
    w = window.innerWidth; 
    h = window.innerHeight; 
    render.options.width = w; 
    render.options.height = h;
    rope.xOffsetA = w*0.5;
}