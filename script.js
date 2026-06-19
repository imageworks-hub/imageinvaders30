const titleScreen =
document.getElementById("titleScreen");

const startBtn =
document.getElementById("startBtn");

const titleImage =
document.getElementById("titleImage");

let gameStarted = false;
let startWait = 0;


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const saveBtn =
document.getElementById("saveBtn");

const cardImage = document.getElementById("cardImage");



const enemyImage = new Image();

const enemyW = 60;
const enemyH = 70;
const enemyGlow = 0;

const enemySprite = document.createElement("canvas");
enemySprite.width = enemyW + enemyGlow * 2;
enemySprite.height = enemyH + enemyGlow * 2;

const enemySpriteCtx = enemySprite.getContext("2d");
let enemySpriteReady = false;

enemyImage.onload = function(){

    enemySpriteCtx.imageSmoothingEnabled = false;

    enemySpriteCtx.filter = "brightness(1.25) contrast(1.15)";

    enemySpriteCtx.drawImage(
        enemyImage,
        enemyGlow,
        enemyGlow,
        enemyW,
        enemyH
    );

    enemySpriteCtx.filter = "none";

    enemySpriteReady = true;

};

enemyImage.src = "enemy.png";

const bossImage = new Image();

bossImage.src = "boss.png";

const playerImage = new Image();

playerImage.src = "player.png";

const backgroundImage = new Image();

backgroundImage.src = "background.png";

const clearBgImage = new Image();

clearBgImage.src = "clear-bg.png";

function resize(){

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize", resize);

function drawCoverImage(image){

    const imageRatio = image.width / image.height;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth;
    let drawHeight;
    let drawX;
    let drawY;

    if(canvasRatio > imageRatio){

        drawWidth = canvas.width;
        drawHeight = canvas.width / imageRatio;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;

    }else{

        drawHeight = canvas.height;
        drawWidth = canvas.height * imageRatio;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;

    }

    ctx.drawImage(
        image,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );

}

/////////////////////////////////////////////////
// プレイヤー
/////////////////////////////////////////////////

const player = {
    x:window.innerWidth/2,
    y:window.innerHeight-100,
    speed:7,
    size:60
};

let targetX = player.x;
let targetY = player.y;

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

let bullets=[];

let enemyBullets=[];
let bossBullets=[];

/////////////////////////////////////////////////
// カード一覧
/////////////////////////////////////////////////

const cards = [

{
    name:"SS ゆいim",
    image:"card1.png"
},

{
    name:"SS ゆうちim",
    image:"card2.png"
},

{
    name:"A みなim",
    image:"card3.png"
},

{
    name:"S しろたim",
    image:"card4.png"
},

{
    name:"S いくみim",
    image:"card5.png"
},

{
    name:"A あすみim",
    image:"card6.png"
},

{
    name:"A りみim",
    image:"card7.png"
},

{
    name:"A  さくらim",
    image:"card8.png"
},

{
    name:"S  ななえim",
    image:"card9.png"
},

{
    name:"A  いこim",
    image:"card10.png"
},

{
    name:"A よこやim",
    image:"card11.png"
},

{
    name:"A れいim",
    image:"card12.png"
},

{
    name:"A まはるim",
    image:"card13.png"
},

{
    name:"A ねむim",
    image:"card14.png"
},

{
    name:"SS スリーim",
    image:"card15.png"
}

];

/////////////////////////////////////////////////
// スコア
/////////////////////////////////////////////////

let score=0;
let lives=3;
let gameOver=false;
let clearFlag = false;
let damageCooldown = 0;

let canRestart = false;

let obtainedCard = null;

let showSaveMessage = true;
let saveMessageScale = 0;

let barrierCount = 0;

if(localStorage.getItem("barrier")){

    barrierCount =
    Number(
        localStorage.getItem("barrier")
    );

}

/////////////////////////////////////////////////
// 敵42体
/////////////////////////////////////////////////

let enemies=[];

for(let r=0;r<6;r++){
    for(let c=0;c<7;c++){

        enemies.push({
            x: canvas.width*(c+1)/8,
            y: canvas.height*0.1+r*50,
            alive: true
        });

    }
}

let enemyDir = 0.5;



/////////////////////////////////////////////////
// ボス
/////////////////////////////////////////////////

let bossShotTimer=0;

const boss={
    x:canvas.width/2,
    y:canvas.height*0.15,
    hp:100,
    angle:0,
    speed:3,
    dir:1,
    size:90
};

let explosions = [];

let bossDamageTimer = 0;



/////////////////////////////////////////////////
// スマホ操作
/////////////////////////////////////////////////

canvas.addEventListener("touchmove",(e)=>{

    e.preventDefault();

    targetX = e.touches[0].clientX;
    targetY = e.touches[0].clientY;

});

canvas.addEventListener("touchstart",(e)=>{

    e.preventDefault();

    // GAME OVERまたはCLEARならリスタート
    if((gameOver || clearFlag) && canRestart){

    location.reload();
    return;

}

    bullets.push({
    x: player.x,
    y: player.y - player.size + 10
});

});

/////////////////////////////////////////////////
// 更新
/////////////////////////////////////////////////

function update(){

    if(!gameStarted) return;

    if(gameOver) return;
  
    /*
    if(startWait > 0){

    startWait--;

    return;

}
    */

    if(damageCooldown > 0){
    damageCooldown--;
}

if(bossDamageTimer > 0){
    bossDamageTimer--;
}

    if(moveLeft){
    player.x -= player.speed;
}

if(moveRight){
    player.x += player.speed;
}

if(moveUp){
    player.y -= player.speed;
}

if(moveDown){
    player.y += player.speed;
}

if(moveLeft || moveRight || moveUp || moveDown){
    targetX = player.x;
    targetY = player.y;
}

player.x += (targetX - player.x) * 0.3;
player.y += (targetY - player.y) * 0.3;

if(player.x < 20){
    player.x = 20;
}

if(player.x > canvas.width - 20){
    player.x = canvas.width - 20;
}

if(player.y < 20){
    player.y = 20;
}

if(player.y > canvas.height - 20){
    player.y = canvas.height - 20;
}


    if(player.x > canvas.width-20){
    player.x = canvas.width-20;
}

    bullets.forEach(b => {
    b.y -= 10;
});

bullets = bullets.filter(b => b.y > -20);
enemyBullets.forEach(b=>{

    b.y += 5;

    if(
        Math.abs(b.x-player.x)<20 &&
        Math.abs(b.y-player.y)<20
    ){
        if(barrierCount > 0){

    barrierCount--;

    localStorage.setItem(
        "barrier",
        barrierCount
    );

    if(barrierCount <= 0){

        localStorage.removeItem(
            "barrier"
        );

    }

}else{

    lives--;

}
        b.y=9999;
    }

});

if(!clearFlag){

    enemies.forEach(e=>{

        if(!e.alive)return;

        e.x+=enemyDir;

    });

    let edge=false;

    enemies.forEach(e=>{

        if(!e.alive)return;

        if(e.x < 30 || e.x > canvas.width - 30)
            edge=true;

    });

    if(edge){

        enemyDir*=-1;

        enemies.forEach(e=>e.y+=10);

    }

    boss.angle+=0.03;

    boss.x += boss.speed * boss.dir;

if(boss.x > canvas.width - 80){

    boss.dir = -1;

}

if(boss.x < 80){

    boss.dir = 1;

}

    bullets.forEach(b=>{

        enemies.forEach(e=>{

            if(!e.alive)return;

            if(
                Math.abs(b.x-e.x)<20 &&
                Math.abs(b.y-e.y)<20
            ){
                e.alive=false;
                score+=10;
                b.y=-100;
            }

        });

        if(

    b.x > boss.x - 50 &&
    b.x < boss.x + 50 &&
    b.y > boss.y - 30 &&
    b.y < boss.y + 30

){  

            boss.hp = Math.max(0, boss.hp - 1);
score += 50;
b.y = -100;

bossDamageTimer = 10;

            // ボス撃破
    if(boss.hp <= 0 && !clearFlag){

    clearFlag = true;

    obtainedCard =
cards[Math.floor(Math.random()*cards.length)];

saveBtn.style.display="block";
document.getElementById("saveMessage").style.display = "block";

cardImage.src = obtainedCard.image;
cardImage.style.display = "block";

    setTimeout(function(){

    canRestart = true;

},2000);

    for(let i=0;i<50;i++){

        explosions.push({

            x:boss.x,
            y:boss.y,
            dx:(Math.random()-0.5)*10,
            dy:(Math.random()-0.5)*10,
            size:10+Math.random()*20

        });

    }

}

        }

    });


    if(Math.random()<0.01){

    let aliveEnemies=enemies.filter(e=>e.alive);

    if(aliveEnemies.length){

        let e=aliveEnemies[
            Math.floor(Math.random()*aliveEnemies.length)
        ];

        enemyBullets.push({
            x:e.x,
            y:e.y
        });
    }
}

bossShotTimer++;

if(bossShotTimer > 60){

    bossShotTimer = 0;

    let bulletCount = 8;

    if(boss.hp <= 50){

        bulletCount = 12;

    }

    for(let i=0;i<bulletCount;i++){

        let angle = i * Math.PI * 2 / bulletCount;

        bossBullets.push({

            x:boss.x,
            y:boss.y,

            dx:Math.cos(angle) * 4,
            dy:Math.sin(angle) * 4

        });

    }

}

bossBullets.forEach(b=>{

    b.x += b.dx;
    b.y += b.dy;

    if(
        damageCooldown <= 0 &&
        Math.abs(b.x-player.x)<20 &&
        Math.abs(b.y-player.y)<20
    ){
        if(barrierCount > 0){

    barrierCount--;

    localStorage.setItem(
        "barrier",
        barrierCount
    );

    if(barrierCount <= 0){

        localStorage.removeItem(
            "barrier"
        );

    }

}else{

    lives--;

}
        damageCooldown = 60;

        b.x = -9999;
        b.y = -9999;
    }

});

bossBullets = bossBullets.filter(b =>

    b.x > -50 &&
    b.x < canvas.width + 50 &&
    b.y > -50 &&
    b.y < canvas.height + 50

);

    }


if(score>=10000){

    clearFlag=true;

}

if(lives<=0 && !gameOver){

    gameOver = true;

    setTimeout(function(){

        canRestart = true;

    },2000);

}

explosions.forEach(e=>{

    e.x += e.dx;
    e.y += e.dy;
    e.size *= 0.96;

});

explosions = explosions.filter(e=>e.size > 1);

if(clearFlag && showSaveMessage){

    if(saveMessageScale < 1){

        saveMessageScale += 0.03;

    }

}

}





/////////////////////////////////////////////////
// 描画
/////////////////////////////////////////////////

function draw(){

    if(!gameStarted){

        ctx.fillStyle="black";
        ctx.fillRect(0,0,canvas.width,canvas.height);

        return;

    }

    ctx.fillStyle = "#000";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    if(backgroundImage.complete){

        ctx.drawImage(
            backgroundImage,
            0,
            0,
            canvas.width,
            canvas.height
        );

    }

    if(clearFlag && clearBgImage.complete){

    drawCoverImage(clearBgImage);

}

    // ボス…

    // ボス
if(!clearFlag){

    ctx.drawImage(

        bossImage,

        boss.x - boss.size,
        boss.y - boss.size,

        boss.size*2,
        boss.size*2

    );

}

if(
    bossDamageTimer > 0 &&
    Math.floor(bossDamageTimer / 2) % 2 === 0
){

    ctx.fillStyle = "rgba(255,0,0,0.5)";

    ctx.fillRect(

        boss.x - boss.size,
        boss.y - boss.size,

        boss.size * 2,
        boss.size * 2

    );

}

    // 敵
    // 敵
enemies.forEach(e=>{

    if(!e.alive)return;

    if(enemySpriteReady){

        ctx.drawImage(
            enemySprite,
            e.x - enemySprite.width / 2,
            e.y - enemySprite.height / 2
        );

    }

});

    // プレイヤー
if(
    damageCooldown <= 0 ||
    Math.floor(damageCooldown / 5) % 2 === 0
){

    ctx.drawImage(

        playerImage,

        player.x - 80,
        player.y - 40,

        160,
        160

    );

}

// プレイヤーの周りにバリア表示
// エネルギードーム
if(barrierCount > 0){

    // 発光
    ctx.shadowColor = "#66ccff";
    ctx.shadowBlur = 20;

    // ドーム内部
    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        55,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "rgba(80,170,255,0.15)";
    ctx.fill();

    // 外側の輪
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#99ddff";
    ctx.stroke();

    ctx.shadowBlur = 0;

}


    // 弾
ctx.fillStyle = "skyblue";

bullets.forEach(b => {

    ctx.fillRect(
        b.x - 2,
        b.y,
        4,
        10
    );

});

ctx.fillStyle="red";

enemyBullets.forEach(b=>{

    ctx.fillRect(
        b.x-3,
        b.y,
        6,
        12
    );

});

ctx.fillStyle="orange";

bossBullets.forEach(b=>{

    ctx.beginPath();
    ctx.arc(b.x,b.y,5,0,Math.PI*2);
    ctx.fill();

});

ctx.fillStyle="orange";

explosions.forEach(e=>{

    ctx.beginPath();
    ctx.arc(
        e.x,
        e.y,
        e.size,
        0,
        Math.PI*2
    );
    ctx.fill();

});

    // UI
    // SCORE
ctx.font = "20px monospace";
ctx.fillStyle = "white";

ctx.fillText("SCORE",20,30);
ctx.fillText(score,100,30);

// BOSS
ctx.fillStyle = "white";
ctx.fillText("BOSS",20,60);

// BOSSのHPだけオレンジ色
ctx.fillStyle = "orange";
ctx.fillText(boss.hp,100,60);

ctx.fillStyle = "red";
ctx.font = "32px monospace";
ctx.textAlign = "right";

ctx.fillText(
    "♥".repeat(Math.max(0, lives)),
    canvas.width - 20,
    40
);

ctx.textAlign = "left";
    

    if(gameOver){

    ctx.fillStyle="red";
ctx.font="50px sans-serif";
ctx.textAlign="center";

ctx.fillText(
    "GAME OVER",
    canvas.width/2,
    canvas.height/2
);

}

if(clearFlag){

    ctx.fillStyle="cyan";
ctx.font="60px sans-serif";
ctx.textAlign="center";

ctx.fillText(
    "CLEAR",
    canvas.width/2,
    canvas.height/2
);

if(obtainedCard){

    ctx.font="30px sans-serif";

    ctx.fillText(
        obtainedCard.name + " GET!",
        canvas.width/2,
        canvas.height/2 + 80
    );

}



}

} 

/////////////////////////////////////////////////

function loop(){

    update();
    draw();

    requestAnimationFrame(loop);

}

loop();



document.addEventListener("keydown", function(e){

    if(
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.code === "Space"
    ){
        e.preventDefault();
    }

    if(e.key === "ArrowLeft") moveLeft = true;
    if(e.key === "ArrowRight") moveRight = true;
    if(e.key === "ArrowUp") moveUp = true;
    if(e.key === "ArrowDown") moveDown = true;

    if(e.code === "Space"){

    if((gameOver || clearFlag) && canRestart){

    location.reload();

}else{

    bullets.push({
        x:player.x,
        y:player.y - player.size + 10
    });

}

}

});

document.addEventListener("keyup", function(e){

    if(e.key === "ArrowLeft") moveLeft = false;
    if(e.key === "ArrowRight") moveRight = false;
    if(e.key === "ArrowUp") moveUp = false;
    if(e.key === "ArrowDown") moveDown = false;

});

saveBtn.onclick = function(){

    if(!obtainedCard)return;

    const link = document.createElement("a");

    link.href = obtainedCard.image;

    link.download = obtainedCard.name + ".png";

    link.click();

};

cardImage.onclick = function(){

    document.getElementById("saveMessage").style.display = "none";

};

startBtn.onclick = function(){

    gameStarted = true;

    titleScreen.style.display = "none";

    barrierCount =
    Number(
        localStorage.getItem("barrier")
    ) || 0;

};

const shopBtn =
document.getElementById("shopBtn");

const shopScreen =
document.getElementById("shopScreen");

shopBtn.onclick = function(){

    shopScreen.style.display = "flex";

};

backBtn.onclick = function(){

    shopScreen.style.display = "none";

};

const buyBtn =
document.getElementById("buyBtn");

buyBtn.onclick = function(){

    location.href =
    "https://buy.stripe.com/test_7sY6oA3Gh6SK3pA1IwbII00";

};