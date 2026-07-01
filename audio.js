(function(){
  "use strict";

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if(!AudioContextClass)return;

  const STORAGE_KEY = "imageInvadersSoundEnabled";
  const tracks = {
    title:{tempo:84,wave:"triangle",lead:[60,null,67,null,65,null,67,null,60,null,63,null,58,null,55,null],bass:[36,36,43,43,41,41,43,43]},
    cardSelect:{tempo:92,wave:"sine",lead:[67,70,74,null,72,70,67,null,65,67,70,null,62,65,67,null],bass:[43,43,46,46,41,41,38,38]},
    stageSelect:{tempo:110,wave:"square",lead:[64,67,71,67,66,69,73,69,64,67,74,71,62,66,69,66],bass:[40,40,42,42,36,36,38,38]},
    shop:{tempo:96,wave:"triangle",lead:[64,67,71,null,69,67,64,null,62,66,69,null,67,66,62,null],bass:[40,40,43,43,38,38,35,35]},
    stage1:{tempo:126,wave:"square",lead:[64,67,71,76,74,71,67,71,62,66,69,74,71,69,66,69],bass:[40,40,35,35,38,38,33,33]},
    stage2:{tempo:136,wave:"sawtooth",lead:[62,65,69,74,72,69,65,69,60,64,67,72,69,67,64,67],bass:[38,38,34,34,36,36,31,31]},
    stage3:{tempo:142,wave:"square",lead:[69,72,76,81,79,76,72,76,67,71,74,79,76,74,71,74],bass:[45,45,41,41,43,43,38,38]},
    stage4:{tempo:150,wave:"sawtooth",lead:[64,68,71,76,75,71,68,71,63,66,70,75,73,70,66,70],bass:[40,40,39,39,36,36,35,35]},
    stage5:{tempo:156,wave:"square",lead:[72,76,79,84,83,79,76,79,71,74,78,83,81,78,74,78],bass:[36,36,38,38,40,40,35,35]},
    cardBattle:{tempo:128,wave:"triangle",lead:[69,72,76,72,67,71,74,71,65,69,72,69,64,67,71,67],bass:[45,45,43,43,41,41,40,40]},
    clear:{tempo:104,wave:"triangle",lead:[60,64,67,72,67,72,76,79,72,76,79,84,79,76,72,null],bass:[36,36,41,41,43,43,48,48]},
    gameover:{tempo:70,wave:"sawtooth",lead:[60,null,58,null,55,null,51,null,48,null,null,null,null,null,null,null],bass:[36,36,34,34,31,31,24,24]}
  };

  let context = null;
  let master = null;
  let musicGain = null;
  let sfxGain = null;
  let timer = null;
  let step = 0;
  let scene = location.pathname.endsWith("cardbattle.html") ? "cardSelect" : "title";
  const isBattlePage = location.pathname.endsWith("cardbattle.html");
  let unlocked = false;
  let enabled = localStorage.getItem(STORAGE_KEY) !== "false";
  let toggleManuallyHidden = false;

  function ensureAudio(){
    if(context)return;
    context = new AudioContextClass();
    master = context.createGain();
    musicGain = context.createGain();
    sfxGain = context.createGain();
    master.gain.value = enabled ? 0.72 : 0;
    musicGain.gain.value = 0.18;
    sfxGain.gain.value = 0.32;
    musicGain.connect(master);
    sfxGain.connect(master);
    master.connect(context.destination);
  }

  function midi(note){
    return 440*Math.pow(2,(note-69)/12);
  }

  function tone(note,duration,volume,wave,output,delay){
    if(!context || !enabled || note == null)return;
    const start = context.currentTime+(delay||0);
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = wave || "square";
    oscillator.frequency.setValueAtTime(typeof note === "number" && note < 120 ? midi(note) : note,start);
    gain.gain.setValueAtTime(0.0001,start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002,volume),start+0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001,start+duration);
    oscillator.connect(gain);
    gain.connect(output || sfxGain);
    oscillator.start(start);
    oscillator.stop(start+duration+0.03);
  }

  function musicStep(){
    const track = tracks[scene] || tracks.title;
    const duration = Math.max(0.08,60/track.tempo*0.38);
    const lead = track.lead[step%track.lead.length];
    tone(lead,duration,0.2,track.wave,musicGain);
    if(step%2===0){
      const bass = track.bass[Math.floor(step/2)%track.bass.length];
      tone(bass,duration*1.7,0.15,"triangle",musicGain);
    }
    if(step%4===0) tone(55,0.025,0.035,"square",musicGain);
    step++;
  }

  function startMusic(){
    clearInterval(timer);
    timer = null;
    if(!unlocked || !enabled)return;
    const track = tracks[scene] || tracks.title;
    step = 0;
    musicStep();
    timer = setInterval(musicStep,60000/track.tempo/2);
  }

  async function unlock(){
    ensureAudio();
    if(context.state !== "running")await context.resume();
    unlocked = true;
    startMusic();
  }

  function setScene(nextScene){
    if(!tracks[nextScene])return;
    if(scene === nextScene && timer)return;
    scene = nextScene;
    updateToggleVisibility();
    startMusic();
  }

  function updateToggleVisibility(){
    const button = document.getElementById("soundToggle");
    if(!button)return;
    button.hidden = toggleManuallyHidden || isBattlePage || (scene !== "title" && scene !== "cardSelect");
  }

  function setToggleVisible(visible){
    toggleManuallyHidden = !visible;
    updateToggleVisibility();
  }

  function sfx(name){
    if(!unlocked || !enabled)return;
    if(name === "shoot"){
      tone(86,0.07,0.14,"square",sfxGain);
      tone(74,0.08,0.09,"square",sfxGain,0.035);
    }else if(name === "damage"){
      tone(45,0.18,0.25,"sawtooth",sfxGain);
      tone(38,0.22,0.18,"square",sfxGain,0.04);
    }else if(name === "barrier"){
      tone(83,0.16,0.2,"sine",sfxGain);
      tone(90,0.2,0.14,"sine",sfxGain,0.05);
    }else if(name === "select"){
      tone(72,0.08,0.12,"triangle",sfxGain);
      tone(79,0.11,0.11,"triangle",sfxGain,0.06);
    }else if(name === "reveal"){
      tone(67,0.1,0.14,"square",sfxGain);
      tone(74,0.13,0.13,"triangle",sfxGain,0.08);
    }else if(name === "clear" || name === "win"){
      [72,76,79,84].forEach((note,index)=>tone(note,0.22,0.18,"triangle",sfxGain,index*0.09));
    }else if(name === "gameover" || name === "lose"){
      [60,56,52,48].forEach((note,index)=>tone(note,0.25,0.17,"sawtooth",sfxGain,index*0.1));
    }
  }

  function updateButton(){
    const button = document.getElementById("soundToggle");
    if(!button)return;
    button.textContent = enabled ? "\u266b" : "\u00d7";
    button.title = enabled ? "SOUND OFF" : "SOUND ON";
    button.setAttribute("aria-label",button.title);
    button.classList.toggle("sound-off",!enabled);
  }

  function toggle(){
    enabled = !enabled;
    localStorage.setItem(STORAGE_KEY,String(enabled));
    ensureAudio();
    master.gain.setTargetAtTime(enabled ? 0.72 : 0,context.currentTime,0.03);
    updateButton();
    if(enabled) unlock();
    else startMusic();
  }

  function addButton(){
    if(document.getElementById("soundToggle"))return;
    const button = document.createElement("button");
    button.id = "soundToggle";
    button.type = "button";
    button.addEventListener("click",function(event){
      event.stopPropagation();
      toggle();
    });
    document.body.appendChild(button);
    updateButton();
    updateToggleVisibility();
  }

  document.addEventListener("pointerdown",unlock,{once:true});
  document.addEventListener("keydown",unlock,{once:true});
  document.addEventListener("visibilitychange",function(){
    if(!context)return;
    if(document.hidden) context.suspend();
    else if(unlocked && enabled) context.resume();
  });
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",addButton);
  else addButton();

  window.GameAudio = {unlock,setScene,sfx,toggle,setToggleVisible};
})();
