const canvas=
document.getElementById("game");

const ctx=
canvas.getContext("2d");


// ====================================
// AUDIO
// ====================================

const audioContext=
new(
window.AudioContext||
window.webkitAudioContext
)();

let musicStarted=false;

function playTone(
freq,
duration,
type="square",
volume=.05
){

const osc=
audioContext.createOscillator();

const gain=
audioContext.createGain();

osc.connect(gain);

gain.connect(
audioContext.destination
);

osc.type=type;

osc.frequency.value=freq;

gain.gain.value=volume;

osc.start();

gain.gain.exponentialRampToValueAtTime(

0.0001,

audioContext.currentTime+
duration

);

osc.stop(
audioContext.currentTime+
duration
);

}


function playShoot(){

playTone(
750,
.06,
"square",
.04
);

}


function playHit(){

playTone(
250,
.1,
"sawtooth",
.06
);

setTimeout(()=>{

playTone(
120,
.08,
"triangle",
.04
);

},50);

}



function startMusic(){

if(musicStarted)return;

musicStarted=true;

const melody=[

523,
659,
784,
659,

587,
698,
880,
698,

523,
659,
784,
659,

698,
587,
523,
440

];

let note=0;

setInterval(()=>{

playTone(

melody[note],

0.2,

"square",

0.02

);

note++;

if(
note>=melody.length
){

note=0;

}

},300);

}



// ====================================
// VARIABLES
// ====================================

let player;

let bullets=[];

let enemies=[];

let keys={};

let score=0;

let gameOver=false;

let enemySpeed=2;

let shootCooldown=0;

let spawnInterval;



function resetGame(){

player={

x:canvas.width/2-25,

y:canvas.height-60,

width:50,

height:20,

speed:8

};

bullets=[];

enemies=[];

score=0;

gameOver=false;

enemySpeed=2;

clearInterval(
spawnInterval
);


spawnInterval=

setInterval(()=>{

enemies.push({

x:
Math.random()*
(canvas.width-50),

y:-50,

width:35,

height:35,

frame:0

});

},900);

}


resetGame();



// ====================================
// CONTROLS
// ====================================

document.addEventListener(

"keydown",

e=>{

if(!musicStarted){

audioContext.resume();

startMusic();

}

keys[e.key]=true;

if(
gameOver &&
e.key==="Enter"
){

resetGame();

}

});

// Tap/click anywhere to restart

document.addEventListener(

"pointerdown",

()=>{

if(gameOver){

resetGame();

}

}

);

document.addEventListener(

"keyup",

e=>{

keys[e.key]=false;

});



// Mobile buttons

const leftBtn=
document.getElementById(
"leftBtn"
);

const rightBtn=
document.getElementById(
"rightBtn"
);

const fireBtn=
document.getElementById(
"fireBtn"
);


leftBtn.addEventListener(
"touchstart",
()=>{
keys["ArrowLeft"]=true;
});

leftBtn.addEventListener(
"touchend",
()=>{
keys["ArrowLeft"]=false;
});


rightBtn.addEventListener(
"touchstart",
()=>{
keys["ArrowRight"]=true;
});

rightBtn.addEventListener(
"touchend",
()=>{
keys["ArrowRight"]=false;
});


fireBtn.addEventListener(
"touchstart",
()=>{

if(!musicStarted){

audioContext.resume();

startMusic();

}

keys[" "]=true;

});

fireBtn.addEventListener(
"touchend",
()=>{
keys[" "]=false;
});



// ====================================
// COLLISION
// ====================================

function collision(a,b){

return(

a.x<
b.x+b.width &&

a.x+a.width>
b.x &&

a.y<
b.y+b.height &&

a.y+a.height>
b.y

);

}



// ====================================
// UPDATE
// ====================================

function update(){

if(gameOver)return;


if(
keys["ArrowLeft"] &&
player.x>0
){

player.x-=player.speed;

}


if(

keys["ArrowRight"] &&

player.x+
player.width<
canvas.width

){

player.x+=player.speed;

}



// rapid fire

if(

keys[" "] &&
shootCooldown<=0

){

bullets.push({

x:player.x+22,
y:player.y,
width:5,
height:12

});

playShoot();

shootCooldown=6;

}

shootCooldown--;



bullets.forEach(

(b,index)=>{

b.y-=10;

if(
b.y<0
){

bullets.splice(
index,
1
);

}

});



enemies.forEach(

(enemy,eIndex)=>{

enemy.y+=enemySpeed;

enemy.frame+=0.1;

enemy.x+=
Math.sin(
enemy.frame
)*1.5;


if(

enemy.y+
enemy.height
>=player.y

){

gameOver=true;

}


bullets.forEach(

(b,bIndex)=>{

if(
collision(
enemy,
b
)
){

enemies.splice(
eIndex,
1
);

bullets.splice(
bIndex,
1
);

score+=10;

playHit();

if(
score%100===0
){

enemySpeed+=0.5;

}

}

});

});

}


function drawStars(){

ctx.fillStyle="white";

for(
let i=0;
i<75;
i++
){

ctx.fillRect(

(i*41)%canvas.width,

(i*79)%canvas.height,

2,
2

);

}

}


function draw(){

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

drawStars();


ctx.fillStyle="lime";

ctx.beginPath();

ctx.moveTo(
player.x,
player.y+20
);

ctx.lineTo(
player.x+25,
player.y
);

ctx.lineTo(
player.x+50,
player.y+20
);

ctx.fill();


ctx.fillStyle="red";

enemies.forEach(

e=>{

ctx.fillRect(
e.x,
e.y,
e.width,
e.height
);

});


ctx.fillStyle="yellow";

bullets.forEach(

b=>{

ctx.fillRect(
b.x,
b.y,
b.width,
b.height
);

});


ctx.fillStyle="white";

ctx.font="20px Arial";

ctx.fillText(
"Score: "+score,
10,
30
);


if(gameOver){

ctx.font="40px Arial";

ctx.fillStyle="red";

ctx.fillText(
"GAME OVER",
240,
300
);

ctx.font="24px Arial";

ctx.fillStyle="white";

ctx.fillText(
"Press ENTER to restart",
250,
360
);

}

}



function gameLoop(){

update();

draw();

requestAnimationFrame(
gameLoop
);

}

gameLoop();