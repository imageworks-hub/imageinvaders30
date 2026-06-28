const titleScreen =
document.getElementById("titleScreen");

const startBtn =
document.getElementById("startBtn");

if(Number(localStorage.getItem("barrier")) > 0){

    startBtn.classList.add("purchased");

}

const titleImage =
document.getElementById("titleImage");

const accessCount =
document.getElementById("accessCount");

if(accessCount){

    fetch("https://api.countapi.xyz/hit/imageinvaders30/title")
    .then(response => response.json())
    .then(data => {

        accessCount.textContent =
        String(data.value).padStart(6,"0");

    })
    .catch(() => {

        const localAccess =
        Number(localStorage.getItem("localAccessCount")) + 1;

        localStorage.setItem(
            "localAccessCount",
            localAccess
        );

        accessCount.textContent =
        String(localAccess).padStart(6,"0");

    });

}

let gameStarted = false;
let startWait = 0;


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const saveBtn =
document.getElementById("saveBtn");

const cardImage = document.getElementById("cardImage");

const damageFlashOverlay =
document.getElementById("damageFlashOverlay");

let damageFlashTimeout = null;

function triggerPlayerDamageFlash(barrierBlocked){

    if(!damageFlashOverlay)return;

    clearTimeout(damageFlashTimeout);

    damageFlashOverlay.classList.remove(
        "damage-flash-red",
        "damage-flash-barrier"
    );

    void damageFlashOverlay.offsetWidth;

    damageFlashOverlay.classList.add(
        barrierBlocked
            ? "damage-flash-barrier"
            : "damage-flash-red"
    );

    damageFlashTimeout = setTimeout(function(){
        damageFlashOverlay.classList.remove(
            "damage-flash-red",
            "damage-flash-barrier"
        );
    },340);

}

const clearRewardPanel =
document.getElementById("clearRewardPanel");

const clearRestartBtn =
document.getElementById("clearRestartBtn");

const clearTitleBtn =
document.getElementById("clearTitleBtn");

const cardCaseBtn =
document.getElementById("cardCaseBtn");

const cardCaseCount =
document.getElementById("cardCaseCount");

const cardCaseScreen =
document.getElementById("cardCaseScreen");

const cardCaseGrid =
document.getElementById("cardCaseGrid");

const cardCaseClose =
document.getElementById("cardCaseClose");

const cardCaseTabs =
document.querySelectorAll(".cardCaseTab");

const cardDetailView =
document.getElementById("cardDetailView");

const cardDetailClose =
document.getElementById("cardDetailClose");

const cardDetailImage =
document.getElementById("cardDetailImage");

const cardDetailStage =
document.getElementById("cardDetailStage");

const stage4CommentBox =
document.getElementById("stage4CommentBox");

const stage4CommentLog =
document.getElementById("stage4CommentLog");

const stage4CommentForm =
document.getElementById("stage4CommentForm");

const stage4CommentInput =
document.getElementById("stage4CommentInput");

let stage4Comments = [];
let stage4CommentIndex = 0;
let stage4CommentTimer = null;

function loadStage4Comments(){

    try{

        stage4Comments =
        JSON.parse(localStorage.getItem("stage4Comments")) || [];

    }catch(e){

        stage4Comments = [];

    }

}

function renderStage4Comments(){

    if(!stage4CommentLog)return;

    stage4CommentLog.innerHTML = "";

    if(stage4Comments.length === 0)return;

    const comment =
    stage4Comments[stage4CommentIndex % stage4Comments.length];

    const item = document.createElement("div");

    item.className = "stage4CommentItem active";
    item.textContent = "笆ｶ " + comment;

    stage4CommentLog.appendChild(item);

    stage4CommentIndex++;

}

function setStage4CommentVisible(visible){

    if(!stage4CommentBox)return;

    stage4CommentBox.style.display = visible ? "block" : "none";

    if(visible){

        renderStage4Comments();

        if(!stage4CommentTimer){

            stage4CommentTimer =
            setInterval(renderStage4Comments,2800);

        }

    }else if(stage4CommentTimer){

        clearInterval(stage4CommentTimer);
        stage4CommentTimer = null;

    }

}

function isStage4CommentEditing(){

    return (
        currentStage === 4 &&
        stage4CommentInput &&
        document.activeElement === stage4CommentInput
    );

}

loadStage4Comments();
renderStage4Comments();

if(stage4CommentForm){

    stage4CommentForm.addEventListener("submit",function(e){

        e.preventDefault();

        const text = stage4CommentInput.value.trim();

        if(!text)return;

        stage4Comments.push(text);
        stage4Comments = stage4Comments.slice(-20);

        localStorage.setItem(
            "stage4Comments",
            JSON.stringify(stage4Comments)
        );

        stage4CommentInput.value = "";
        stage4CommentInput.blur();

        if(
            currentStage === 4 &&
            gameStarted &&
            !clearFlag &&
            !gameOver
        ){

            damageBossByComment();

        }

        renderStage4Comments();

    });

}



const enemyImage = new Image();

const enemyW = 64;
const enemyH = 74;
const enemyGlow = 0;

const enemySprite = document.createElement("canvas");
enemySprite.width = enemyW + enemyGlow * 2;
enemySprite.height = enemyH + enemyGlow * 2;

const enemySpriteCtx = enemySprite.getContext("2d");
let enemySpriteReady = false;

enemyImage.onload = function(){

    enemySpriteCtx.clearRect(
        0,
        0,
        enemySprite.width,
        enemySprite.height
    );

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

const teamImage = new Image();

teamImage.src = "team.png";

const team3Image = new Image();

team3Image.src = "team3.png";

const team4Image = new Image();

team4Image.src = "team4.png";

const item1Image = new Image();

item1Image.src = "item1.png";

const playerImage = new Image();

playerImage.src = "player.png";

const backgroundImage = new Image();

backgroundImage.src = "background.png";

const clearBgImage = new Image();

clearBgImage.src = "clear-bg.png";

const clearBgOverlay = document.createElement("img");

clearBgOverlay.src = "clear-bg.png";

clearBgOverlay.style.display = "none";
clearBgOverlay.style.position = "fixed";
clearBgOverlay.style.top = "0";
clearBgOverlay.style.left = "0";
clearBgOverlay.style.width = "100vw";
clearBgOverlay.style.height = "100vh";
clearBgOverlay.style.objectFit = "contain";
clearBgOverlay.style.background = "white";
clearBgOverlay.style.zIndex = "150";
clearBgOverlay.style.pointerEvents = "none";

document.body.appendChild(clearBgOverlay);

function resize(){

    const viewportWidth =
    Math.floor(window.visualViewport?.width || window.innerWidth);

    const viewportHeight =
    Math.floor(window.visualViewport?.height || window.innerHeight);

    canvas.width = viewportWidth;
    canvas.height = viewportHeight;

    canvas.style.width = viewportWidth + "px";
    canvas.style.height = viewportHeight + "px";

}

resize();

window.addEventListener("resize", resize);

if(window.visualViewport){

    window.visualViewport.addEventListener("resize", resize);
    window.visualViewport.addEventListener("scroll", resize);

}

function drawContainImage(image){

    const imageRatio = image.width / image.height;
    const canvasRatio = canvas.width / canvas.height;

    let drawWidth;
    let drawHeight;
    let drawX;
    let drawY;

    if(canvasRatio > imageRatio){

        drawHeight = canvas.height;
        drawWidth = canvas.height * imageRatio;
        drawX = (canvas.width - drawWidth) / 2;
        drawY = 0;

    }else{

        drawWidth = canvas.width;
        drawHeight = canvas.width / imageRatio;
        drawX = 0;
        drawY = (canvas.height - drawHeight) / 2;

    }

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
        image,
        drawX,
        drawY,
        drawWidth,
        drawHeight
    );

    ctx.restore();

}

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
// 繝励Ξ繧､繝､繝ｼ
/////////////////////////////////////////////////

const player = {
    x:window.innerWidth/2,
    y:window.innerHeight-100,
    speed:7,
    size:60
};

let playerStartY = player.y;
let playerEntering = false;

let targetX = player.x;
let targetY = player.y;

let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

let bullets=[];

let tripleShotEnabled = false;

function firePlayerBullets(){

    if(playerEntering)return;

    const shotX = player.x;
    const shotY = player.y - player.size + 10;
    const shotDirections = tripleShotEnabled ? [-3.4,0,3.4] : [0];

    shotDirections.forEach(dx=>{

        bullets.push({
            x:shotX,
            y:shotY,
            dx:dx,
            dy:-9.4
        });

    });

}

let enemyBullets=[];
let bossBullets=[];

/////////////////////////////////////////////////
// 繧ｫ繝ｼ繝我ｸ隕ｧ
/////////////////////////////////////////////////

const stage1Cards = [

{
    name:"SS 繧・＞im",
    image:"card1.png"
},

{
    name:"SS 繧・≧縺｡im",
    image:"card2.png"
},

{
    name:"A 縺ｿ縺ｪim",
    image:"card3.png"
},

{
    name:"S 縺励ｍ縺殃m",
    image:"card4.png"
},

{
    name:"S 縺・￥縺ｿim",
    image:"card5.png"
},

{
    name:"A 縺ゅ☆縺ｿim",
    image:"card6.png"
},

{
    name:"A 繧翫∩im",
    image:"card7.png"
},

{
    name:"A  縺輔￥繧永m",
    image:"card8.png"
},

{
    name:"S  縺ｪ縺ｪ縺・m",
    image:"card9.png"
},

{
    name:"A  縺・％im",
    image:"card10.png"
},

{
    name:"A 繧医％繧・m",
    image:"card11.png"
},

{
    name:"A 繧後＞im",
    image:"card12.png"
},

{
    name:"A 縺ｾ縺ｯ繧喫m",
    image:"card13.png"
},

{
    name:"A 縺ｭ繧im",
    image:"card14.png"
},

{
    name:"SS 繧ｹ繝ｪ繝ｼim",
    image:"card15.png"
}

];

const stage2Cards = [

{
    name:"STAGE2 CARD 1",
    image:"st2card1.png"
},

{
    name:"STAGE2 CARD 2",
    image:"st2card2.png"
},

{
    name:"STAGE2 CARD 3",
    image:"st2card3.png"
},

{
    name:"STAGE2 CARD 4",
    image:"st2card4.png"
},

{
    name:"STAGE2 CARD 5",
    image:"st2card5.png"
},

{
    name:"STAGE2 CARD 6",
    image:"st2card6.png"
},

{
    name:"STAGE2 CARD 7",
    image:"st2card7.png"
},

{
    name:"STAGE2 CARD 8",
    image:"st2card8.png"
},

{
    name:"STAGE2 CARD 9",
    image:"st2card9.png"
},

{
    name:"STAGE2 CARD 10",
    image:"st2card10.png"
},

{
    name:"STAGE2 CARD 11",
    image:"st2card11.png"
},

{
    name:"STAGE2 CARD 12",
    image:"st2card12.png"
},

{
    name:"STAGE2 CARD 13",
    image:"st2card13.png"
},

{
    name:"STAGE2 CARD 14",
    image:"st2card14.png"
},

{
    name:"STAGE2 CARD 15",
    image:"st2card15.png"
}

];

const stage3Cards = [

{
    name:"STAGE3 CARD 1",
    image:"st3card1.png"
},

{
    name:"STAGE3 CARD 2",
    image:"st3card2.png"
},

{
    name:"STAGE3 CARD 3",
    image:"st3card3.png"
},

{
    name:"STAGE3 CARD 4",
    image:"st3card4.png"
},

{
    name:"STAGE3 CARD 5",
    image:"st3card5.png"
},

{
    name:"STAGE3 CARD 6",
    image:"st3card6.png"
},

{
    name:"STAGE3 CARD 7",
    image:"st3card7.png"
},

{
    name:"STAGE3 CARD 8",
    image:"st3card8.png"
},

{
    name:"STAGE3 CARD 9",
    image:"st3card9.png"
},

{
    name:"STAGE3 CARD 10",
    image:"st3card10.png"
},

{
    name:"STAGE3 CARD 11",
    image:"st3card11.png"
},

{
    name:"STAGE3 CARD 12",
    image:"st3card12.png"
},

{
    name:"STAGE3 CARD 13",
    image:"st3card13.png"
},

{
    name:"STAGE3 CARD 14",
    image:"st3card14.png"
},

{
    name:"STAGE3 CARD 15",
    image:"st3card15.png"
}

];

const stage4Cards = [

{
    name:"STAGE4 CARD 1",
    image:"st4card1.png"
},

{
    name:"STAGE4 CARD 2",
    image:"st4card2.png"
},

{
    name:"STAGE4 CARD 3",
    image:"st4card3.png"
},

{
    name:"STAGE4 CARD 4",
    image:"st4card4.png"
},

{
    name:"STAGE4 CARD 5",
    image:"st4card5.png"
},

{
    name:"STAGE4 CARD 6",
    image:"st4card6.png"
},

{
    name:"STAGE4 CARD 7",
    image:"st4card7.png"
},

{
    name:"STAGE4 CARD 8",
    image:"st4card8.png"
},

{
    name:"STAGE4 CARD 9",
    image:"st4card9.png"
},

{
    name:"STAGE4 CARD 10",
    image:"st4card10.png"
},

{
    name:"STAGE4 CARD 11",
    image:"st4card11.png"
},

{
    name:"STAGE4 CARD 12",
    image:"st4card12.png"
},

{
    name:"STAGE4 CARD 13",
    image:"st4card13.png"
},

{
    name:"STAGE4 CARD 14",
    image:"st4card14.png"
},

{
    name:"STAGE4 CARD 15",
    image:"st4card15.png"
}

];

const stage5Cards = [

{
    name:"STAGE5 CARD 1",
    image:"st5card1.png"
},

{
    name:"STAGE5 CARD 2",
    image:"st5card2.png"
},

{
    name:"STAGE5 CARD 3",
    image:"st5card3.png"
},

{
    name:"STAGE5 CARD 4",
    image:"st5card4.png"
},

{
    name:"STAGE5 CARD 5",
    image:"st5card5.png"
},

{
    name:"STAGE5 CARD 6",
    image:"st5card6.png"
},

{
    name:"STAGE5 CARD 7",
    image:"st5card7.png"
},

{
    name:"STAGE5 CARD 8",
    image:"st5card8.png"
},

{
    name:"STAGE5 CARD 9",
    image:"st5card9.png"
},

{
    name:"STAGE5 CARD 10",
    image:"st5card10.png"
},

{
    name:"STAGE5 CARD 11",
    image:"st5card11.png"
},

{
    name:"STAGE5 CARD 12",
    image:"st5card12.png"
},

{
    name:"STAGE5 CARD 13",
    image:"st5card13.png"
},

{
    name:"STAGE5 CARD 14",
    image:"st5card14.png"
},

{
    name:"STAGE5 CARD 15",
    image:"st5card15.png"
}

];

function getStageCards(){

    if(currentStage === 5){

        return stage5Cards;

    }

    if(currentStage === 4){

        return stage4Cards;

    }

    if(currentStage === 3){

        return stage3Cards;

    }

    if(currentStage === 2){

        return stage2Cards;

    }

    return stage1Cards;

}
const ownedCardsKey = "imageInvadersOwnedCards";

function normalizeOwnedCards(savedCards){

    if(!Array.isArray(savedCards))return [];

    const cardsById = new Map();

    savedCards.forEach(card=>{

        if(!card || !card.image)return;

        const cardId = card.id || card.image.replace(".png","");
        const savedCount = Math.max(
            1,
            Math.floor(Number(card.count) || 1)
        );

        const existingCard = cardsById.get(cardId);

        if(existingCard){

            existingCard.count += savedCount;

        }else{

            cardsById.set(cardId,{
                ...card,
                id:cardId,
                count:savedCount
            });

        }

    });

    return Array.from(cardsById.values());

}

function getOwnedCards(){

    try{

        const savedCards =
        JSON.parse(localStorage.getItem(ownedCardsKey)) || [];

        return normalizeOwnedCards(savedCards);

    }catch(e){

        return [];

    }

}

function updateCardCaseCount(){

    if(!cardCaseCount)return;

    const totalCards = getOwnedCards().reduce(
        (total,card)=>total + card.count,
        0
    );

    cardCaseCount.textContent = totalCards;

}

function saveOwnedCard(card){

    if(!card)return false;

    const ownedCards = getOwnedCards();
    const cardId = card.image.replace(".png","");
    const ownedCard = ownedCards.find(c=>c.id === cardId);
    const now = Date.now();

    if(ownedCard){

        ownedCard.count += 1;
        ownedCard.lastObtainedAt = now;

    }else{

        ownedCards.push({
            id:cardId,
            name:card.name,
            image:card.image,
            stage:currentStage,
            count:1,
            obtainedAt:now,
            lastObtainedAt:now
        });

    }

    localStorage.setItem(
        ownedCardsKey,
        JSON.stringify(ownedCards)
    );

    updateCardCaseCount();

    return true;

}
function showCardCaseSavedMessage(){

    const saveMessage = document.getElementById("saveMessage");

    if(!saveMessage)return;

    saveMessage.textContent = "OK!";
    saveMessage.style.display = "block";

}

function resetSaveMessage(){

    const saveMessage = document.getElementById("saveMessage");

    if(!saveMessage)return;

    saveMessage.textContent = "\u30bf\u30c3\u30d7\u3057\u3066\u4fdd\u5b58";

}

/////////////////////////////////////////////////
// 繧ｹ繧ｳ繧｢
/////////////////////////////////////////////////

let score=0;
let lives=3;
let gameOver=false;
let clearFlag = false;
let damageCooldown = 0;

let currentStage = 1;

const stageSettings = {
    1:{
        background:"background.png",
        enemy:"enemy.png",
        boss:"boss.png",
        bossHp:100,
        bossSpeed:3,
        enemyDir:0.5,
        bossBulletCount1:8,
        bossBulletCount2:12
    },
    2:{
        background:"background2.png",
        enemy:"enemy2.png",
        team:"team.png",
        bossHp:100,
        bossSpeed:4,
        enemyDir:0.8,
        bossBulletCount1:10,
        bossBulletCount2:16
    },
    3:{
        background:"background3.png",
        enemy:"enemy3.png",
        team:"team3.png",
        bossHp:100,
        bossSpeed:4,
        enemyDir:0.8,
        bossBulletCount1:10,
        bossBulletCount2:16
    },
    4:{
        background:"background4.png",
        enemy:"enemy4.png",
        team:"team4.png",
        bossHp:100,
        bossSpeed:4,
        enemyDir:0.8,
        bossBulletCount1:10,
        bossBulletCount2:16
    },
    5:{
        background:"background5.png",
        enemy:"enemy5.png",
        team:"team5.png",
        bossHp:100,
        bossSpeed:4,
        enemyDir:0.8,
        bossBulletCount1:10,
        bossBulletCount2:16
    }
};

let canRestart = false;

let obtainedCard = null;
let obtainedCardSaved = false;

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
// 謨ｵ42菴・
/////////////////////////////////////////////////

let enemies=[];

for(let r=0;r<6;r++){
    for(let c=0;c<7;c++){

        enemies.push({
            x: canvas.width*(c+1)/8,
            y: canvas.height*0.1+r*50,
            alive: true,
            hasHeart: false,
            hasItem1: false
        });

    }
}

let enemyDir = 0.5;
let heartItems = [];
let item1Drops = [];



/////////////////////////////////////////////////
// 繝懊せ
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

const team = {
    x:canvas.width / 2,
    y:canvas.height * 0.32,
    speed:2.5,
    size:65
};

let teamShotTimer = 0;
let teamBullets = [];

const team3 = {
    x:canvas.width / 2,
    y:canvas.height * 0.32,
    size:45
};

let team3ShotTimer = 0;
let team3Bullets = [];

const team4 = {
    x:canvas.width / 2,
    y:canvas.height * 0.35,
    targetX:canvas.width / 2,
    targetY:canvas.height * 0.35,
    speed:3.2,
    jitter:0,
    size:55
};

let team4ShotTimer = 0;
let team4Bullets = [];

function applyStage(stageNumber){

    currentStage = stageNumber;

    const setting = stageSettings[stageNumber];

    enemySpriteReady = false;

    backgroundImage.src = setting.background;
    enemyImage.src = setting.enemy;

    tripleShotEnabled = false;
    item1Drops = [];
    heartItems = [];

    enemies.forEach(e=>{
        e.hasHeart = false;
        e.hasItem1 = false;
    });

    if(stageNumber === 3){

        const itemEnemy =
        enemies[Math.floor(Math.random()*enemies.length)];

        if(itemEnemy){
            itemEnemy.hasItem1 = true;
        }

    }

    if(setting.boss){
    bossImage.src = setting.boss;
}

    if(stageNumber === 3 && setting.team){
        team3Image.src = setting.team;
    }

    if(stageNumber === 4 && setting.team){
        team4Image.src = setting.team;
        team4.x = canvas.width / 2;
        team4.y = canvas.height * 0.35;
        team4.targetX = team4.x;
        team4.targetY = team4.y;
        team4.jitter = 0;
        team4ShotTimer = 0;
        team4Bullets = [];

        const heartEnemy =
        enemies[Math.floor(Math.random()*enemies.length)];

        if(heartEnemy){
            heartEnemy.hasHeart = true;
        }
    }

    boss.hp = setting.bossHp;
    boss.speed = setting.bossSpeed;
    enemyDir = setting.enemyDir;

}

let explosions = [];

let bossDamageTimer = 0;

function triggerClear(){

    if(clearFlag)return;

    clearFlag = true;

    const availableCards = getStageCards();

    obtainedCard =
    availableCards[Math.floor(Math.random()*availableCards.length)];

    obtainedCardSaved = false;
cardImage.src = obtainedCard.image;
    resetSaveMessage();

    setTimeout(function(){

        document.getElementById("saveMessage").style.display = "block";
        cardImage.style.display = "block";
        clearRewardPanel.style.display = "flex";

    },2000);

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

window.stage5Bridge = {

    getBarrier:function(){
        return barrierCount;
    },

    takeDamage:function(){

        if(barrierCount > 0){
            barrierCount--;
            localStorage.setItem("barrier",barrierCount);

            if(barrierCount <= 0){
                localStorage.removeItem("barrier");
            }
        }else{
            lives--;
        }

        return lives;
    },

    clear:function(finalScore){
        score = finalScore;
        boss.hp = 0;
        gameStarted = false;
        triggerClear();
        clearBgOverlay.style.display = "block";
    },

    gameOver:function(finalScore){
        score = finalScore;
        lives = 0;
        gameOver = true;
    }

};

function damageBossByComment(){

    boss.hp = Math.max(0, boss.hp - 50);
    bossDamageTimer = 40;

    if(boss.hp <= 0){

        triggerClear();

    }

}



/////////////////////////////////////////////////
// 繧ｹ繝槭・謫堺ｽ・
/////////////////////////////////////////////////

canvas.addEventListener("touchmove",(e)=>{

    e.preventDefault();

    targetX = e.touches[0].clientX;
    targetY = e.touches[0].clientY;

});

canvas.addEventListener("touchstart",(e)=>{

    e.preventDefault();

    // GAME OVER縺ｾ縺溘・CLEAR縺ｪ繧峨Μ繧ｹ繧ｿ繝ｼ繝・
    if((gameOver || clearFlag) && canRestart){

    location.reload();
    return;

}

    firePlayerBullets();

});

/////////////////////////////////////////////////
// 譖ｴ譁ｰ
/////////////////////////////////////////////////

function update(){

    if(!gameStarted) return;

    if(isStage4CommentEditing()) return;

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

if(playerEntering){

    player.y += (playerStartY - player.y) * 0.08;
    player.x += (canvas.width / 2 - player.x) * 0.08;
    targetX = player.x;
    targetY = playerStartY;

    if(Math.abs(player.y - playerStartY) < 2){

        player.y = playerStartY;
        playerEntering = false;
        targetX = player.x;
        targetY = player.y;

    }

}else{

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

}

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
    b.x += b.dx || 0;
    b.y += typeof b.dy === "number" ? b.dy : -10;
});

bullets = bullets.filter(b =>
    b.y > -20 &&
    b.x > -20 &&
    b.x < canvas.width + 20
);
enemyBullets.forEach(b=>{

    b.y += 5;

    if(
        Math.abs(b.x-player.x)<20 &&
        Math.abs(b.y-player.y)<20
    ){
        if(barrierCount > 0){

    triggerPlayerDamageFlash(true);

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

    triggerPlayerDamageFlash(false);

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

if(currentStage === 2 && !clearFlag){

    team.y = boss.y + 130;

    if(team.x < player.x){
        team.x += team.speed;
    }

    if(team.x > player.x){
        team.x -= team.speed;
    }

    if(team.x < 70){
        team.x = 70;
    }

    if(team.x > canvas.width - 70){
        team.x = canvas.width - 70;
    }

    teamShotTimer++;

    if(teamShotTimer >= 180){

        teamShotTimer = 0;

        const dx = player.x - team.x;
        const dy = player.y - team.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        teamBullets.push({
            x:team.x,
            y:team.y + 30,
            dx:dx / distance * 6,
            dy:dy / distance * 6
        });

    }

}

if(currentStage === 3 && !clearFlag){

    team3.x = canvas.width / 2;
    team3.y = boss.y + 130;

    team3ShotTimer++;

    if(team3ShotTimer >= 600){

        team3ShotTimer = 0;

        const dx = player.x - team3.x;
        const dy = player.y - team3.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        team3Bullets.push({
            x:team3.x,
            y:team3.y + 30,
            dx:dx / distance * 4,
            dy:dy / distance * 4,
            speed:4
        });

    }

}

if(currentStage === 4 && !clearFlag){

    team4.jitter--;

    const minX = team4.size;
    const maxX = canvas.width - team4.size;
    const minY = boss.y + 110;
    const maxY = canvas.height * 0.68;
    const dx = team4.targetX - team4.x;
    const dy = team4.targetY - team4.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if(distance < 18 || team4.jitter <= 0){

        team4.targetX = minX + Math.random() * (maxX - minX);
        team4.targetY = minY + Math.random() * (maxY - minY);
        team4.jitter = 35 + Math.random() * 55;

    }else{

        team4.x += dx / distance * team4.speed;
        team4.y += dy / distance * team4.speed;

    }

    team4.x = Math.max(minX, Math.min(maxX, team4.x));
    team4.y = Math.max(minY, Math.min(maxY, team4.y));

    team4ShotTimer++;

    if(team4ShotTimer >= 180){

        team4ShotTimer = 0;

        for(let i=0;i<6;i++){

            let angle = i * Math.PI * 2 / 6;

            team4Bullets.push({
                x:team4.x,
                y:team4.y,
                dx:Math.cos(angle) * 5,
                dy:Math.sin(angle) * 5
            });

        }

    }

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

                if(currentStage === 4 && e.hasHeart){

                    heartItems.push({
                        x:e.x,
                        y:e.y
                    });

                    e.hasHeart = false;

                }

                if(currentStage === 3 && e.hasItem1){

                    item1Drops.push({
                        x:e.x,
                        y:e.y
                    });

                    e.hasItem1 = false;

                }
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

            // 繝懊せ謦・ｴ
    if(boss.hp <= 0 && !clearFlag){

    clearFlag = true;

    const availableCards = getStageCards();

obtainedCard =
availableCards[Math.floor(Math.random()*availableCards.length)];

obtainedCardSaved = false;
cardImage.src = obtainedCard.image;
    resetSaveMessage();

setTimeout(function(){

    document.getElementById("saveMessage").style.display = "block";
    cardImage.style.display = "block";
    clearRewardPanel.style.display = "flex";

},2000);

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

    triggerPlayerDamageFlash(true);

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

    triggerPlayerDamageFlash(false);

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

teamBullets.forEach(b=>{

    b.x += b.dx;
    b.y += b.dy;

    if(
        damageCooldown <= 0 &&
        Math.abs(b.x-player.x)<20 &&
        Math.abs(b.y-player.y)<20
    ){
        if(barrierCount > 0){

    triggerPlayerDamageFlash(true);

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

            triggerPlayerDamageFlash(false);

    lives--;

        }

        damageCooldown = 60;

        b.x = -9999;
        b.y = -9999;
    }

});

teamBullets = teamBullets.filter(b =>

    b.x > -50 &&
    b.x < canvas.width + 50 &&
    b.y > -50 &&
    b.y < canvas.height + 50

);

team3Bullets.forEach(b=>{

    const dx = player.x - b.x;
    const dy = player.y - b.y;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;

    b.dx = b.dx * 0.94 + dx / distance * b.speed * 0.06;
    b.dy = b.dy * 0.94 + dy / distance * b.speed * 0.06;

    b.x += b.dx;
    b.y += b.dy;

    if(
        damageCooldown <= 0 &&
        Math.abs(b.x-player.x)<22 &&
        Math.abs(b.y-player.y)<22
    ){
        if(barrierCount > 0){

    triggerPlayerDamageFlash(true);

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

            triggerPlayerDamageFlash(false);

    lives--;

        }

        damageCooldown = 60;

        b.x = -9999;
        b.y = -9999;
    }

});

team3Bullets = team3Bullets.filter(b =>

    b.x > -80 &&
    b.x < canvas.width + 80 &&
    b.y > -80 &&
    b.y < canvas.height + 80

);

team4Bullets.forEach(b=>{

    b.x += b.dx;
    b.y += b.dy;

    if(
        damageCooldown <= 0 &&
        Math.abs(b.x-player.x)<22 &&
        Math.abs(b.y-player.y)<22
    ){
        if(barrierCount > 0){

    triggerPlayerDamageFlash(true);

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

            triggerPlayerDamageFlash(false);

    lives--;

        }

        damageCooldown = 60;

        b.x = -9999;
        b.y = -9999;
    }

});

team4Bullets = team4Bullets.filter(b =>

    b.x > -80 &&
    b.x < canvas.width + 80 &&
    b.y > -80 &&
    b.y < canvas.height + 80

);

heartItems.forEach(h=>{

    if(
        Math.abs(h.x-player.x)<28 &&
        Math.abs(h.y-player.y)<28
    ){

        lives = Math.min(3,lives + 1);
        h.collected = true;

    }

});

heartItems = heartItems.filter(h=>!h.collected);

item1Drops.forEach(item=>{

    if(
        Math.abs(item.x-player.x)<34 &&
        Math.abs(item.y-player.y)<34
    ){

        tripleShotEnabled = true;
        item.collected = true;

    }

});

item1Drops = item1Drops.filter(item=>!item.collected);

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
// 謠冗判
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

        drawCoverImage(backgroundImage);

    }

    if(clearFlag){

        clearBgOverlay.style.display = "block";

    }else{

        clearBgOverlay.style.display = "none";

    }

    // 繝懊せ窶ｦ

    // 繝懊せ
if(!clearFlag){

    if(bossImage.complete && bossImage.naturalWidth > 0){

    ctx.drawImage(

        bossImage,

        boss.x - boss.size,
        boss.y - boss.size,

        boss.size*2,
        boss.size*2

    );

}

}

if(
    currentStage === 2 &&
    !clearFlag &&
    teamImage.complete &&
    teamImage.naturalWidth > 0
){

    ctx.drawImage(
        teamImage,
        team.x - team.size,
        team.y - team.size,
        team.size * 2,
        team.size * 2
    );

}

if(
    currentStage === 3 &&
    !clearFlag &&
    team3Image.complete &&
    team3Image.naturalWidth > 0
){

    ctx.drawImage(
        team3Image,
        team3.x - team3.size,
        team3.y - team3.size,
        team3.size * 2,
        team3.size * 2
    );

}

if(
    currentStage === 4 &&
    !clearFlag &&
    team4Image.complete &&
    team4Image.naturalWidth > 0
){

    ctx.drawImage(
        team4Image,
        team4.x - team4.size,
        team4.y - team4.size,
        team4.size * 2,
        team4.size * 2
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

    // 謨ｵ
    // 謨ｵ
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

    // 繝励Ξ繧､繝､繝ｼ
heartItems.forEach(h=>{

    ctx.save();
    ctx.translate(h.x,h.y);
    ctx.scale(1.1,1.1);

    ctx.shadowColor = "gold";
    ctx.shadowBlur = 26;
    ctx.fillStyle = "rgba(255,215,0,0.45)";

    ctx.save();
    ctx.scale(1.35,1.35);
    ctx.beginPath();
    ctx.moveTo(0,10);
    ctx.bezierCurveTo(-24,-8,-12,-24,0,-12);
    ctx.bezierCurveTo(12,-24,24,-8,0,10);
    ctx.fill();
    ctx.restore();

    ctx.shadowColor = "gold";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "red";
    ctx.strokeStyle = "gold";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(0,10);
    ctx.bezierCurveTo(-24,-8,-12,-24,0,-12);
    ctx.bezierCurveTo(12,-24,24,-8,0,10);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

});

item1Drops.forEach(item=>{

    if(!item1Image.complete || item1Image.naturalWidth === 0)return;

    ctx.save();
    ctx.shadowColor = "#6edcff";
    ctx.shadowBlur = 18;

    ctx.drawImage(
        item1Image,
        item.x - 29,
        item.y - 29,
        58,
        58
    );

    ctx.restore();

});

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

// 繝励Ξ繧､繝､繝ｼ縺ｮ蜻ｨ繧翫↓繝舌Μ繧｢陦ｨ遉ｺ
// 繧ｨ繝阪Ν繧ｮ繝ｼ繝峨・繝
if(barrierCount > 0){

    // 逋ｺ蜈・
    ctx.shadowColor = "#66ccff";
    ctx.shadowBlur = 20;

    // 繝峨・繝蜀・Κ
    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        42,
        0,
        Math.PI * 2
    );

    ctx.fillStyle = "rgba(80,170,255,0.15)";
    ctx.fill();

    // 螟門・縺ｮ霈ｪ
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#99ddff";
    ctx.stroke();

    ctx.shadowBlur = 0;

}


    // 蠑ｾ
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

ctx.fillStyle = "magenta";

teamBullets.forEach(b=>{

    ctx.beginPath();
    ctx.arc(b.x,b.y,6,0,Math.PI*2);
    ctx.fill();

});

ctx.fillStyle = "#a855ff";

team3Bullets.forEach(b=>{

    ctx.beginPath();
    ctx.arc(b.x,b.y,7,0,Math.PI*2);
    ctx.fill();

});

ctx.fillStyle="orange";

team4Bullets.forEach(b=>{

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

// BOSS縺ｮHP縺縺代が繝ｬ繝ｳ繧ｸ濶ｲ
ctx.fillStyle = "orange";
ctx.fillText(boss.hp,100,60);

ctx.fillStyle = "red";
ctx.font = "32px monospace";
ctx.textAlign = "right";

ctx.fillText(
    "笙･".repeat(Math.max(0, lives)),
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



} 

/////////////////////////////////////////////////

function loop(){

    if(currentStage !== 5){
        update();
        draw();
    }

    requestAnimationFrame(loop);

}

loop();



document.addEventListener("keydown", function(e){

    if(currentStage === 5)return;

    if(document.activeElement === stage4CommentInput){
        return;
    }

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

    firePlayerBullets();

}

}

});

document.addEventListener("keyup", function(e){

    if(currentStage === 5)return;

    if(e.key === "ArrowLeft") moveLeft = false;
    if(e.key === "ArrowRight") moveRight = false;
    if(e.key === "ArrowUp") moveUp = false;
    if(e.key === "ArrowDown") moveDown = false;

});

function saveObtainedCardToCase(){

    if(!obtainedCard || obtainedCardSaved)return false;

    const saved = saveOwnedCard(obtainedCard);

    if(saved){
        obtainedCardSaved = true;
        showCardCaseSavedMessage();
    }

    return saved;

}

saveBtn.onclick = function(){

    if(!obtainedCard)return;

    saveObtainedCardToCase();

    const link = document.createElement("a");

    link.href = obtainedCard.image;

    link.download = obtainedCard.name + ".png";

    link.click();

};

function handleCardCaseSaveTap(){

    if(!obtainedCard)return;

    saveObtainedCardToCase();

}

cardImage.onclick = function(){

    handleCardCaseSaveTap();

};

const saveMessageElement =
document.getElementById("saveMessage");

if(saveMessageElement){

    saveMessageElement.onclick = function(){

        handleCardCaseSaveTap();

    };

}

let activeCardCaseStage = 1;

function getSavedCardStage(card){

    if(card.stage)return Number(card.stage);

    const id = card.id || card.image || "";
    const match = id.match(/^st([2-5])card/i);

    if(match)return Number(match[1]);

    return 1;

}
function openCardDetail(card){

    if(!cardDetailView)return;

    cardDetailImage.src = card.image;
    cardDetailImage.alt = "CARD";
    cardDetailStage.textContent = "STAGE " + getSavedCardStage(card);

    cardDetailView.style.display = "flex";

}

function closeCardDetail(){

    if(!cardDetailView)return;

    cardDetailView.style.display = "none";

}

function formatOwnedCardCount(count){

    const cardCount = Math.max(1,Math.floor(Number(count) || 1));

    if(cardCount <= 20){
        return String.fromCodePoint(0x245f + cardCount);
    }

    return "x" + cardCount;

}

function renderCardCase(){

    if(!cardCaseGrid)return;

    const ownedCards = getOwnedCards()
    .filter(card=>getSavedCardStage(card) === activeCardCaseStage);

    cardCaseGrid.innerHTML = "";

    if(ownedCards.length === 0){

        const empty = document.createElement("div");
        empty.className = "cardCaseEmpty";
        empty.textContent = "NO STAGE " + activeCardCaseStage + " CARDS";
        cardCaseGrid.appendChild(empty);
        return;

    }

    ownedCards.forEach(card=>{

        const cardBox = document.createElement("button");
        cardBox.className = "cardCaseCard";
        cardBox.type = "button";

        const img = document.createElement("img");
        img.src = card.image;
        img.alt = "CARD";
cardBox.appendChild(img);

        if(card.count > 1){

            const countBadge = document.createElement("span");
            countBadge.className = "cardCaseCardCount";
            countBadge.textContent = formatOwnedCardCount(card.count);
            cardBox.appendChild(countBadge);

        }
        cardBox.onclick = function(){

            openCardDetail(card);

        };

        cardCaseGrid.appendChild(cardBox);

    });

}

function openCardCase(){

    if(!cardCaseScreen)return;

    renderCardCase();
    cardCaseScreen.style.display = "block";

}

function closeCardCase(){

    if(!cardCaseScreen)return;

    cardCaseScreen.style.display = "none";
    closeCardDetail();

}

cardCaseTabs.forEach(tab=>{

    tab.onclick = function(){

        activeCardCaseStage = Number(tab.dataset.stage);

        cardCaseTabs.forEach(t=>t.classList.remove("active"));
        tab.classList.add("active");

        renderCardCase();

    };

});

if(cardDetailClose){

    cardDetailClose.onclick = closeCardDetail;

}

if(cardDetailView){

    cardDetailView.onclick = function(e){

        if(e.target === cardDetailView){

            closeCardDetail();

        }

    };

}

if(cardCaseBtn){

    cardCaseBtn.onclick = function(e){

        if(e)e.preventDefault();
        openCardCase();

    };

    cardCaseBtn.addEventListener("touchend", function(e){

        e.preventDefault();
        openCardCase();

    });

}

if(cardCaseClose){

    cardCaseClose.onclick = closeCardCase;

}

updateCardCaseCount();

const stage1Btn =
document.getElementById("stage1Btn");

const stage2Btn =
document.getElementById("stage2Btn");

const stage3Btn =
document.getElementById("stage3Btn");

const stage4Btn =
document.getElementById("stage4Btn");

const stage5Btn =
document.getElementById("stage5Btn");

const stageBackBtn =
document.getElementById("stageBackBtn");

const stageSelectScreen =
document.getElementById("stageSelectScreen");

stage1Btn.onclick = function(){

    applyStage(1);
    startGame();

};

stage2Btn.onclick = function(){

    applyStage(2);
    startGame();

};

stage3Btn.onclick = function(){

    applyStage(3);
    startGame();

};

stage4Btn.onclick = function(){

    applyStage(4);
    startGame();

};

stage5Btn.onclick = function(){

    applyStage(5);
    startGame();

};

stageBackBtn.onclick = function(){

    stageSelectScreen.style.display = "none";
    titleScreen.style.display = "flex";
    setStage4CommentVisible(false);

    if(Number(localStorage.getItem("barrier")) > 0){

        startBtn.classList.add("purchased");

    }

};

function startGame(){

    stageSelectScreen.style.display = "none";

    setStage4CommentVisible(currentStage === 4);

    playerStartY = canvas.height - 100;
    player.x = canvas.width / 2;
    player.y = canvas.height + 90;
    targetX = player.x;
    targetY = playerStartY;
    playerEntering = true;

    gameStarted = true;

    barrierCount =
    Number(
        localStorage.getItem("barrier")
    ) || 0;
    if(currentStage === 5){

        canvas.style.display = "none";
        playerEntering = false;

        const launchStage5 = function(){
            window.stage5Game.start();
        };

        if(window.stage5Game){
            launchStage5();
        }else{
            window.addEventListener("stage5-ready",launchStage5,{once:true});
        }

    }else{
        canvas.style.display = "block";
    }

}

startBtn.onclick = function(){

    startBtn.classList.remove("purchased");

    titleScreen.style.display = "none";

    stageSelectScreen.style.display = "flex";

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


const clearRestartStageKey = "imageInvadersRestartStage";

if(clearRestartBtn){

    clearRestartBtn.onclick = function(){

        if(!clearFlag)return;

        sessionStorage.setItem(
            clearRestartStageKey,
            String(currentStage)
        );

        location.reload();

    };

}

if(clearTitleBtn){

    clearTitleBtn.onclick = function(){

        sessionStorage.removeItem(clearRestartStageKey);
        location.href = "./index.html";

    };

}

const clearRestartStage =
Number(sessionStorage.getItem(clearRestartStageKey));

if(clearRestartStage >= 1 && clearRestartStage <= 5){

    sessionStorage.removeItem(clearRestartStageKey);

    titleScreen.style.display = "none";
    stageSelectScreen.style.display = "none";

    applyStage(clearRestartStage);
    startGame();

}