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
const onlineBattleBtn = document.getElementById("onlineBattleBtn");
const onlineLobby = document.getElementById("onlineLobby");
const onlineStatus = document.getElementById("onlineStatus");
const roomCodeDisplay = document.getElementById("roomCodeDisplay");
const roomCodeText = document.getElementById("roomCodeText");
const roomCodeInput = document.getElementById("roomCodeInput");
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
let battleMode = "cpu";
let onlinePeer = null;
let onlineConnection = null;
let onlineIsHost = false;
let localDeckSent = false;
let remoteDeckIds = null;
let pendingLocalCard = null;
let pendingRemotePick = null;
let onlineDisconnected = false;
let onlineBattleStarted = false;

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
  [deckScreen,onlineLobby,gameScreen,resultScreen].forEach(item => item.hidden = item !== screen);
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
  window.GameAudio?.sfx("select");
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
  onlineBattleBtn.disabled = selectedDeck.length !== DECK_SIZE;
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
  battleMode = "cpu";
  window.GameAudio?.setScene("cardBattle");
  window.GameAudio?.sfx("select");
  const cpuDeck = shuffled(catalog).slice(0,DECK_SIZE);
  initializeBattle(cpuDeck);
}

function initializeBattle(opponentDeck){
  playerDeck = selectedDeck.map((card,index) => ({...card,instance:`p-${index}`}));
  enemyDeck = opponentDeck.map((card,index) => ({...card,instance:`e-${index}`}));
  playerUsed = [];
  enemyUsed = [];
  playerHp = MAX_HP;
  enemyHp = MAX_HP;
  round = 0;
  roundLocked = false;
  pendingLocalCard = null;
  pendingRemotePick = null;
  onlineDisconnected = false;
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
  if(battleMode === "online"){
    pendingLocalCard = playerCard;
    sendOnlineMessage({type:"pick",round:round+1,cardId:playerCard.id});
    roundMessage.textContent = "相手のカード選択を待っています";
    tryResolveOnlineRound();
    return;
  }
  const remainingEnemy = enemyDeck.filter(card => !enemyUsed.some(used => used.instance === card.instance));
  const enemyCard = remainingEnemy[Math.floor(Math.random()*remainingEnemy.length)];
  resolveRound(playerCard,enemyCard);
}

function resolveRound(playerCard,enemyCard){
  window.GameAudio?.sfx("reveal");
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
    showRoundCardEffect(playerSlot,enemySlot,"player");
    roundMessage.textContent = `YOU ${playerCard.total} - ${enemyCard.total} RIVAL / RIVAL -${difference} HP`;
  }else if(enemyCard.total > playerCard.total){
    playerHp = Math.max(0,playerHp-difference);
    showRoundCardEffect(enemySlot,playerSlot,"rival");
    roundMessage.textContent = `YOU ${playerCard.total} - ${enemyCard.total} RIVAL / YOU -${difference} HP`;
  }else{
    playerSlot.classList.add("roundDraw");
    enemySlot.classList.add("roundDraw");
    roundMessage.textContent = `TOTAL ${playerCard.total} / DRAW`;
  }
  updateHud();
  renderHand();
  const finished = playerHp <= 0 || enemyHp <= 0 || round >= DECK_SIZE;
  nextRoundBtn.textContent = finished ? "RESULT" : "NEXT TURN";
  nextRoundBtn.hidden = false;
}

function clearSlots(){
  playerSlot.classList.remove("reveal","roundWinner","roundLoser","playerRoundWinner","rivalRoundWinner","roundDraw");
  enemySlot.classList.remove("reveal","roundWinner","roundLoser","playerRoundWinner","rivalRoundWinner","roundDraw");
  playerSlot.innerHTML = "<span>YOU</span>";
  enemySlot.innerHTML = "<span>RIVAL</span>";
}

function showRoundCardEffect(winnerSlot,loserSlot,winner){
  winnerSlot.classList.add("roundWinner",winner === "player" ? "playerRoundWinner" : "rivalRoundWinner");
  loserSlot.classList.add("roundLoser");
  const burst = document.createElement("div");
  burst.className = "roundWinBurst";
  for(let index=0;index<18;index++){
    const spark = document.createElement("i");
    const angle = Math.PI*2*index/18;
    const distance = 80+Math.random()*95;
    spark.style.setProperty("--dx",`${Math.cos(angle)*distance}px`);
    spark.style.setProperty("--dy",`${Math.sin(angle)*distance}px`);
    spark.style.setProperty("--delay",`${Math.random()*.16}s`);
    burst.appendChild(spark);
  }
  winnerSlot.appendChild(burst);
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

function setOnlineStatus(message,state=""){
  onlineStatus.textContent = message;
  onlineStatus.className = `onlineStatus ${state}`.trim();
}

function generateRoomCode(){
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for(let index=0;index<8;index++) code += characters[Math.floor(Math.random()*characters.length)];
  return code;
}

function roomPeerId(code){
  return `imageinvaders-${code.toLowerCase()}`;
}

function normalizeRoomCode(value){
  return String(value || "")
    .normalize("NFKC")
    .toUpperCase()
    .replace(/[^A-Z2-9]/g,"")
    .slice(0,8);
}

function openOnlineLobby(){
  if(selectedDeck.length !== DECK_SIZE)return;
  cleanupOnlineConnection();
  roomCodeDisplay.hidden = true;
  roomCodeInput.value = "";
  setOnlineStatus("ルームを作成するか、コードを入力してください");
  showScreen(onlineLobby);
}

function createOnlineRoom(){
  if(!window.Peer){
    setOnlineStatus("通信ライブラリを読み込めませんでした","error");
    return;
  }
  cleanupOnlineConnection();
  onlineIsHost = true;
  const code = generateRoomCode();
  roomCodeText.textContent = code;
  roomCodeDisplay.hidden = false;
  setOnlineStatus("相手の参加を待っています");
  onlinePeer = new Peer(roomPeerId(code),{debug:1});
  onlinePeer.on("connection",connection=>{
    if(onlineConnection){
      connection.close();
      return;
    }
    setupOnlineConnection(connection);
  });
  onlinePeer.on("error",error=>handleOnlineError(error));
}

function joinOnlineRoom(){
  if(!window.Peer){
    setOnlineStatus("通信ライブラリを読み込めませんでした","error");
    return;
  }
  const code = normalizeRoomCode(roomCodeInput.value);
  roomCodeInput.value = code;
  if(code.length !== 8){
    setOnlineStatus("8文字のルームコードを入力してください","error");
    return;
  }
  cleanupOnlineConnection();
  onlineIsHost = false;
  roomCodeText.textContent = code;
  roomCodeDisplay.hidden = false;
  setOnlineStatus("ルームへ接続しています");
  onlinePeer = new Peer(undefined,{debug:1});
  onlinePeer.on("open",()=>{
    setupOnlineConnection(onlinePeer.connect(roomPeerId(code),{reliable:true,serialization:"json"}));
  });
  onlinePeer.on("error",error=>handleOnlineError(error));
}

function setupOnlineConnection(connection){
  onlineConnection = connection;
  connection.on("open",()=>{
    setOnlineStatus("接続しました。デッキを確認しています","connected");
    localDeckSent = true;
    sendOnlineMessage({type:"deck",cards:selectedDeck.map(card=>card.id)});
    tryStartOnlineBattle();
  });
  connection.on("data",handleOnlineMessage);
  connection.on("close",()=>{
    if(!connection.__intentionalClose)handleOnlineDisconnect();
  });
  connection.on("error",()=>setOnlineStatus("対戦相手との通信でエラーが発生しました","error"));
}

function sendOnlineMessage(message){
  if(!onlineConnection || !onlineConnection.open)return false;
  onlineConnection.send(message);
  return true;
}

function handleOnlineMessage(message){
  if(!message || typeof message !== "object")return;
  if(message.type === "deck"){
    if(!isValidOnlineDeck(message.cards)){
      setOnlineStatus("相手のデッキ情報が正しくありません","error");
      return;
    }
    remoteDeckIds = [...message.cards];
    tryStartOnlineBattle();
    return;
  }
  if(message.type === "pick" && onlineBattleStarted){
    const expectedRound = round+1;
    const cardIsAvailable = enemyDeck.some(card=>
      card.id === message.cardId && !enemyUsed.some(used=>used.instance === card.instance)
    );
    if(message.round !== expectedRound || !cardIsAvailable)return;
    pendingRemotePick = {round:message.round,cardId:message.cardId};
    tryResolveOnlineRound();
  }
}

function isValidOnlineDeck(cardIds){
  return Array.isArray(cardIds) &&
    cardIds.length === DECK_SIZE &&
    new Set(cardIds).size === DECK_SIZE &&
    cardIds.every(id=>catalogById.has(id));
}

function tryStartOnlineBattle(){
  if(onlineBattleStarted || !localDeckSent || !remoteDeckIds)return;
  onlineBattleStarted = true;
  battleMode = "online";
  window.GameAudio?.setScene("cardBattle");
  window.GameAudio?.sfx("select");
  initializeBattle(remoteDeckIds.map(id=>catalogById.get(id)));
  roundMessage.textContent = onlineIsHost
    ? "オンライン対戦開始。カードを1枚選んでください"
    : "オンライン対戦開始。カードを1枚選んでください";
}

function tryResolveOnlineRound(){
  if(!pendingLocalCard || !pendingRemotePick)return;
  if(pendingRemotePick.round !== round+1)return;
  const enemyCard = enemyDeck.find(card=>
    card.id === pendingRemotePick.cardId && !enemyUsed.some(used=>used.instance === card.instance)
  );
  if(!enemyCard)return;
  const localCard = pendingLocalCard;
  pendingLocalCard = null;
  pendingRemotePick = null;
  resolveRound(localCard,enemyCard);
}

function handleOnlineDisconnect(){
  onlineDisconnected = true;
  if(onlineBattleStarted && !gameScreen.hidden){
    const finished = playerHp <= 0 || enemyHp <= 0 || round >= DECK_SIZE;
    if(finished){
      nextRoundBtn.textContent = "RESULT";
      nextRoundBtn.hidden = false;
      roundMessage.textContent = "接続は終了しました。対戦結果を確認できます";
    }else{
      roundLocked = true;
      nextRoundBtn.hidden = true;
      roundMessage.textContent = "対戦相手との接続が切れました";
    }
  }else{
    setOnlineStatus("対戦相手との接続が切れました","error");
  }
}

function handleOnlineError(error){
  const message = error && error.type === "peer-unavailable"
    ? "ルームが見つかりません。コードを確認してください"
    : "通信を開始できませんでした。もう一度お試しください";
  setOnlineStatus(message,"error");
}

function cleanupOnlineConnection(){
  const connection = onlineConnection;
  const peer = onlinePeer;
  onlineConnection = null;
  onlinePeer = null;
  localDeckSent = false;
  remoteDeckIds = null;
  pendingLocalCard = null;
  pendingRemotePick = null;
  onlineDisconnected = false;
  onlineBattleStarted = false;
  if(connection){
    connection.__intentionalClose = true;
    connection.close();
  }
  if(peer && !peer.destroyed) peer.destroy();
}

function finishBattle(){
  const title = document.getElementById("resultTitle");
  const detail = document.getElementById("resultDetail");
  rewardChoices.innerHTML = "";
  resultActions.hidden = true;
  clearVictoryEffect();
  if(playerHp > enemyHp){
    showVictoryEffect("player");
    window.GameAudio?.sfx("win");
    title.textContent = "YOU WIN";
    if(battleMode === "online"){
      detail.textContent = "ONLINE BATTLE WIN / カードの移動はありません";
      resultActions.hidden = false;
    }else{
      detail.textContent = "相手が使ったカードから1枚獲得できます";
      enemyUsed.forEach(card => {
        const button = document.createElement("button");
        button.className = "rewardCard";
        button.innerHTML = `<img src="${card.image}" alt="獲得候補 STAGE ${card.stage}">`;
        button.addEventListener("click",() => claimReward(card));
        rewardChoices.appendChild(button);
      });
    }
  }else if(enemyHp > playerHp){
    showVictoryEffect("rival");
    window.GameAudio?.sfx("lose");
    title.textContent = "YOU LOSE";
    if(battleMode === "online"){
      detail.textContent = "ONLINE BATTLE LOSE / カードの移動はありません";
    }else{
      const lost = playerUsed[Math.floor(Math.random()*playerUsed.length)];
      removeOneCard(lost.id);
      detail.textContent = "相手にカードを1枚奪われました";
      rewardChoices.innerHTML = `<div class="rewardCard"><img src="${lost.image}" alt="失った STAGE ${lost.stage} card"></div>`;
    }
    resultActions.hidden = false;
  }else{
    window.GameAudio?.sfx("select");
    title.textContent = "DRAW";
    detail.textContent = "引き分けのためカードの移動はありません";
    resultActions.hidden = false;
  }
  showScreen(resultScreen);
}

function clearVictoryEffect(){
  resultScreen.classList.remove("playerVictory","rivalVictory");
  document.getElementById("victoryEffects").innerHTML = "";
  document.getElementById("winnerBadge").hidden = true;
}

function showVictoryEffect(winner){
  const effects = document.getElementById("victoryEffects");
  const badge = document.getElementById("winnerBadge");
  resultScreen.classList.add(winner === "player" ? "playerVictory" : "rivalVictory");
  badge.textContent = winner === "player" ? "YOU WINNER" : "RIVAL WINNER";
  badge.hidden = false;
  for(let index=0;index<34;index++){
    const particle = document.createElement("span");
    particle.style.left = `${3+Math.random()*94}%`;
    particle.style.animationDelay = `${Math.random()*.65}s`;
    particle.style.animationDuration = `${1.35+Math.random()*.85}s`;
    effects.appendChild(particle);
  }
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
document.getElementById("titleBtn").addEventListener("click",() => {cleanupOnlineConnection();location.href="./index.html#cardbattle";});
document.getElementById("rematchBtn").addEventListener("click",() => {cleanupOnlineConnection();inventory=loadInventory();renderDeck();showScreen(deckScreen);window.GameAudio?.setScene("cardSelect");});
document.getElementById("onlineLobbyClose").addEventListener("click",()=>{cleanupOnlineConnection();showScreen(deckScreen);});
document.getElementById("createRoomBtn").addEventListener("click",createOnlineRoom);
document.getElementById("joinRoomBtn").addEventListener("click",joinOnlineRoom);
let roomCodeComposing = false;
roomCodeInput.addEventListener("compositionstart",()=>{roomCodeComposing=true;});
roomCodeInput.addEventListener("compositionend",()=>{roomCodeComposing=false;roomCodeInput.value=normalizeRoomCode(roomCodeInput.value);});
roomCodeInput.addEventListener("input",()=>{if(!roomCodeComposing)roomCodeInput.value=normalizeRoomCode(roomCodeInput.value);});
roomCodeInput.addEventListener("blur",()=>{roomCodeInput.value=normalizeRoomCode(roomCodeInput.value);});
roomCodeInput.addEventListener("keydown",event=>{if(event.key === "Enter")joinOnlineRoom();});
roomCodeDisplay.addEventListener("click",async()=>{
  const code = roomCodeText.textContent;
  if(!code)return;
  try{
    await navigator.clipboard.writeText(code);
    setOnlineStatus("ルームコードをコピーしました","connected");
  }catch(error){
    setOnlineStatus("コードを長押ししてコピーしてください","error");
  }
});
battleStartBtn.addEventListener("click",startBattle);
onlineBattleBtn.addEventListener("click",openOnlineLobby);
nextRoundBtn.addEventListener("click",advanceRound);
window.addEventListener("beforeunload",cleanupOnlineConnection);

renderDeck();
