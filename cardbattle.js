"use strict";

const INVENTORY_KEY = "imageInvadersOwnedCards";
const MAX_HP = 1000;
const DECK_SIZE = 5;

const statRows = [
  [[310,420,540,320],[400,350,500,550],[250,200,450,430],[280,350,390,510],[300,310,400,480],[250,190,300,390],[350,300,520,300],[450,300,400,500],[270,380,410,500],[250,400,430,300],[250,430,460,280],[280,450,470,300],[380,460,400,320],[390,430,370,350],[500,280,300,500]],
  [[250,340,380,450],[480,400,380,470],[310,280,300,330],[510,420,400,480],[350,300,400,470],[280,200,310,380],[310,320,410,490],[410,360,510,560],[270,350,420,350],[360,330,390,360],[360,310,380,400],[350,300,370,410],[330,290,330,410],[340,350,370,380],[370,360,390,370]],
  [[490,430,420,460],[420,350,450,570],[430,410,430,580],[310,370,420,480],[350,310,390,450],[320,330,420,430],[350,330,400,450],[310,370,430,420],[310,350,430,400],[300,290,340,490],[290,310,390,400],[300,310,390,440],[350,340,400,450],[330,290,380,450],[270,280,350,490]],
  [[390,450,400,400],[500,390,400,520],[520,380,390,530],[350,360,410,420],[300,400,410,430],[330,340,320,550],[300,280,360,350],[310,350,360,350],[260,320,370,390],[280,290,310,390],[330,290,310,390],[320,270,290,370],[310,270,370,320],[340,250,290,350],[320,300,370,360]],
  [[490,470,400,500],[510,460,450,560],[490,500,470,480],[340,380,420,400],[360,410,400,350],[360,330,370,400],[300,330,370,380],[280,340,350,290],[280,350,330,270],[320,270,290,330],[290,300,310,360],[350,300,310,260],[320,300,310,270],[280,300,280,350],[410,200,190,450]]
];

const catalog = [];
statRows.forEach((rows, stageIndex) => {
  const stage = stageIndex + 1;
  rows.forEach((stats, index) => {
    const number = index + 1;
    const id = stage === 1 ? `card${number}` : `st${stage}card${number}`;
    catalog.push({id, image:`${id}.png`, stage, stats, total:stats.reduce((sum, value) => sum + value, 0)});
  });
});
const catalogById = new Map(catalog.map(card => [card.id, card]));

const deckScreen = document.getElementById("deckScreen");
const gameScreen = document.getElementById("gameScreen");
const resultScreen = document.getElementById("resultScreen");
const deckGrid = document.getElementById("deckGrid");
const selectedCount = document.getElementById("selectedCount");
const battleStartBtn = document.getElementById("battleStartBtn");
const playerHand = document.getElementById("playerHand");
const playerSlot = document.getElementById("playerSlot");
const enemySlot = document.getElementById("enemySlot");
const roundMessage = document.getElementById("roundMessage");
const nextRoundBtn = document.getElementById("nextRoundBtn");
const rewardChoices = document.getElementById("rewardChoices");
const resultActions = document.getElementById("resultActions");

let inventory = loadInventory();
let selectedDeck = [];
let playerDeck = [];
let enemyDeck = [];
let playerUsed = [];
let enemyUsed = [];
let playerHp = MAX_HP;
let enemyHp = MAX_HP;
let round = 0;
let roundLocked = false;

function normalizeId(item){
  const source = `${item.id || ""} ${item.image || ""}`;
  const match = source.match(/(st[2-5]card\d+|card\d+)/i);
  return match ? match[1].toLowerCase() : "";
}

function loadInventory(){
  try{
    const raw = JSON.parse(localStorage.getItem(INVENTORY_KEY) || "[]");
    return Array.isArray(raw) ? raw.map(item => ({...item,id:normalizeId(item),count:Math.max(1,Number(item.count)||1)})).filter(item => catalogById.has(item.id)) : [];
  }catch(error){
    return [];
  }
}

function saveInventory(){
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
}

function showScreen(screen){
  [deckScreen,gameScreen,resultScreen].forEach(item => item.hidden = item !== screen);
  window.scrollTo(0,0);
}

function renderDeck(){
  selectedDeck = [];
  deckGrid.innerHTML = "";
  const ownedTotal = inventory.length;
  const emptyDeck = document.getElementById("emptyDeck");
  emptyDeck.hidden = ownedTotal >= DECK_SIZE;
  emptyDeck.textContent = ownedTotal === 0
    ? "カードケースにカードがありません。IMAGE INVADERSでカードを獲得してください。"
    : `対戦には異なるカードが5種類必要です。現在は${ownedTotal}種類です。`;
  inventory.sort((a,b) => (a.stage||9)-(b.stage||9) || a.id.localeCompare(b.id,undefined,{numeric:true}));
  inventory.forEach(item => {
    const card = catalogById.get(item.id);
    const button = document.createElement("button");
    button.className = "deckCard";
    button.dataset.id = card.id;
    button.innerHTML = `<img src="${card.image}" alt="STAGE ${card.stage} card"><span class="copyBadge">x${item.count}</span><span class="pickBadge" hidden>0</span>`;
    button.addEventListener("click",() => toggleDeckCard(card,button));
    deckGrid.appendChild(button);
  });
  updateDeckCounter();
}

function toggleDeckCard(card,button){
  const chosen = selectedDeck.filter(item => item.id === card.id).length;
  if(chosen > 0){
    const lastIndex = selectedDeck.map(item => item.id).lastIndexOf(card.id);
    selectedDeck.splice(lastIndex,1);
  }else if(selectedDeck.length < DECK_SIZE){
    selectedDeck.push({...card,instance:`${card.id}-${Date.now()}`});
  }
  const count = selectedDeck.filter(item => item.id === card.id).length;
  button.classList.toggle("selected",count > 0);
  const badge = button.querySelector(".pickBadge");
  badge.hidden = count === 0;
  badge.textContent = count;
  updateDeckCounter();
}

function updateDeckCounter(){
  selectedCount.textContent = `${selectedDeck.length} / ${DECK_SIZE}`;
  battleStartBtn.disabled = selectedDeck.length !== DECK_SIZE;
}

function shuffled(items){
  const copy = [...items];
  for(let i=copy.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]] = [copy[j],copy[i]];
  }
  return copy;
}

function startBattle(){
  if(selectedDeck.length !== DECK_SIZE)return;
  playerDeck = selectedDeck.map((card,index) => ({...card,instance:`p-${index}`}));
  enemyDeck = shuffled(catalog).slice(0,DECK_SIZE).map((card,index) => ({...card,instance:`e-${index}`}));
  playerUsed = [];
  enemyUsed = [];
  playerHp = MAX_HP;
  enemyHp = MAX_HP;
  round = 0;
  roundLocked = false;
  clearSlots();
  renderHand();
  updateHud();
  roundMessage.textContent = "カードを1枚選んでください";
  nextRoundBtn.hidden = true;
  showScreen(gameScreen);
}

function renderHand(){
  playerHand.innerHTML = "";
  playerDeck.forEach(card => {
    if(playerUsed.some(used => used.instance === card.instance))return;
    const button = document.createElement("button");
    button.className = "handCard";
    button.innerHTML = `<img src="${card.image}" alt="STAGE ${card.stage} card">`;
    button.addEventListener("click",() => playRound(card));
    playerHand.appendChild(button);
  });
}

function cardMarkup(card){
  return `<div class="revealedCard"><img src="${card.image}" alt="STAGE ${card.stage} card"><div class="cardTotal">TOTAL ${card.total}</div></div>`;
}

function playRound(playerCard){
  if(roundLocked || playerUsed.some(card => card.instance === playerCard.instance))return;
  roundLocked = true;
  const remainingEnemy = enemyDeck.filter(card => !enemyUsed.some(used => used.instance === card.instance));
  const enemyCard = remainingEnemy[Math.floor(Math.random()*remainingEnemy.length)];
  playerUsed.push(playerCard);
  enemyUsed.push(enemyCard);
  round++;
  playerSlot.innerHTML = cardMarkup(playerCard);
  enemySlot.innerHTML = cardMarkup(enemyCard);
  playerSlot.classList.add("reveal");
  enemySlot.classList.add("reveal");

  const difference = Math.abs(playerCard.total-enemyCard.total);
  if(playerCard.total > enemyCard.total){
    enemyHp = Math.max(0,enemyHp-difference);
    roundMessage.textContent = `YOU ${playerCard.total} - ${enemyCard.total} RIVAL / RIVAL -${difference} HP`;
  }else if(enemyCard.total > playerCard.total){
    playerHp = Math.max(0,playerHp-difference);
    roundMessage.textContent = `YOU ${playerCard.total} - ${enemyCard.total} RIVAL / YOU -${difference} HP`;
  }else{
    roundMessage.textContent = `TOTAL ${playerCard.total} / DRAW`;
  }
  updateHud();
  renderHand();
  const finished = playerHp <= 0 || enemyHp <= 0 || round >= DECK_SIZE;
  nextRoundBtn.textContent = finished ? "RESULT" : "NEXT TURN";
  nextRoundBtn.hidden = false;
}

function clearSlots(){
  playerSlot.classList.remove("reveal");
  enemySlot.classList.remove("reveal");
  playerSlot.innerHTML = "<span>YOU</span>";
  enemySlot.innerHTML = "<span>RIVAL</span>";
}

function updateHud(){
  document.getElementById("playerHpText").textContent = `${playerHp} / ${MAX_HP}`;
  document.getElementById("enemyHpText").textContent = `${enemyHp} / ${MAX_HP}`;
  document.getElementById("playerHpBar").style.width = `${playerHp/MAX_HP*100}%`;
  document.getElementById("enemyHpBar").style.width = `${enemyHp/MAX_HP*100}%`;
  const visibleRound = roundLocked ? round : round + 1;
  document.getElementById("roundText").textContent = `${Math.min(visibleRound,DECK_SIZE)} / ${DECK_SIZE}`;
}

function advanceRound(){
  nextRoundBtn.hidden = true;
  if(playerHp <= 0 || enemyHp <= 0 || round >= DECK_SIZE){
    finishBattle();
    return;
  }
  clearSlots();
  roundLocked = false;
  roundMessage.textContent = "次のカードを1枚選んでください";
  updateHud();
}

function finishBattle(){
  const title = document.getElementById("resultTitle");
  const detail = document.getElementById("resultDetail");
  rewardChoices.innerHTML = "";
  resultActions.hidden = true;
  if(playerHp > enemyHp){
    title.textContent = "YOU WIN";
    detail.textContent = "相手が使ったカードから1枚獲得できます";
    enemyUsed.forEach(card => {
      const button = document.createElement("button");
      button.className = "rewardCard";
      button.innerHTML = `<img src="${card.image}" alt="獲得候補 STAGE ${card.stage}">`;
      button.addEventListener("click",() => claimReward(card));
      rewardChoices.appendChild(button);
    });
  }else if(enemyHp > playerHp){
    const lost = playerUsed[Math.floor(Math.random()*playerUsed.length)];
    removeOneCard(lost.id);
    title.textContent = "YOU LOSE";
    detail.textContent = "相手にカードを1枚奪われました";
    rewardChoices.innerHTML = `<div class="rewardCard"><img src="${lost.image}" alt="失った STAGE ${lost.stage} card"></div>`;
    resultActions.hidden = false;
  }else{
    title.textContent = "DRAW";
    detail.textContent = "引き分けのためカードの移動はありません";
    resultActions.hidden = false;
  }
  showScreen(resultScreen);
}

function claimReward(card){
  const existing = inventory.find(item => item.id === card.id);
  if(existing){
    existing.count = (Number(existing.count)||1)+1;
    existing.lastObtainedAt = new Date().toISOString();
  }else{
    inventory.push({id:card.id,name:card.id,image:card.image,stage:card.stage,count:1,obtainedAt:new Date().toISOString()});
  }
  saveInventory();
  rewardChoices.innerHTML = `<div class="rewardCard"><img src="${card.image}" alt="獲得した STAGE ${card.stage} card"><span class="pickBadge">GET</span></div>`;
  document.getElementById("resultDetail").textContent = "カードケースに保存しました";
  resultActions.hidden = false;
}

function removeOneCard(id){
  const index = inventory.findIndex(item => item.id === id);
  if(index < 0)return;
  if((Number(inventory[index].count)||1) > 1) inventory[index].count--;
  else inventory.splice(index,1);
  saveInventory();
}

document.getElementById("deckBackBtn").addEventListener("click",() => location.href="./index.html#cardbattle");
document.getElementById("titleBtn").addEventListener("click",() => location.href="./index.html#cardbattle");
document.getElementById("rematchBtn").addEventListener("click",() => {inventory=loadInventory();renderDeck();showScreen(deckScreen);});
battleStartBtn.addEventListener("click",startBattle);
nextRoundBtn.addEventListener("click",advanceRound);

renderDeck();
