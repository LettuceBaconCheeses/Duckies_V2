import {
  onDucksChanged, addDuckToDatabase, validateUniqueness,
  recordWinner, onWinnersChanged,
  broadcastPosition, onPositionsChanged,
  broadcastStats, onStatsChanged,
  broadcastInteraction, onInteractionsChanged,
  setFightState, updateBorderPct, onFightStateChanged,
  castVote, clearVotes, onVotesChanged,
  addToTotals, onTotalsChanged,
  registerPresence, updateHeartbeat, onPresenceChanged,
  broadcastFightStat, clearFightStats, onFightStatsChanged,
} from "./firebase.js";
import { VALID_TEAMS, TEAM_COLORS } from "./teams.js";

// ─────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────
const DUCK_SKINS       = [
  { id:"default", src:"Duck-Skins/image.png", label:"Default" }
];


const DUCK_ACCESSORIES = [
  { id: "top hat", src: "Duck-Accessories/tophat.png", label: "Top Hat", x: 0, y: -10, width: 28, height: 20 }
];


const FIGHT_START_PW   = "08412";
const FIGHT_STOP_PW    = "05821";
const TREE_SRC         = "trees-and-pond/tree.png";


const BANNED_NAMES = [
  "2g1c", "2 girls 1 cup", "acrotomophilia", "alabama hot pocket",
  "alaskan pipeline", "anal", "anilingus", "anus", "apeshit", "arsehole",
  "ass", "asshole", "assmunch", "auto erotic", "autoerotic",
  "babeland", "baby batter", "baby juice", "ball gag", "ball gravy",
  "ball kicking", "ball licking", "ball sack", "ball sucking", "bangbros",
  "bangbus", "bareback", "barely legal", "barenaked", "bastard",
  "bastardo", "bastinado", "bbw", "bdsm", "beaner",
  "beaners", "beaver cleaver", "beaver lips", "beastiality", "bestiality",
  "big black", "big breasts", "big knockers", "big tits", "bimbos",
  "birdlock", "bitch", "bitches", "black cock", "blonde action",
  "blonde on blonde action", "blowjob", "blow job", "blow your load", "blue waffle",
  "blumpkin", "bollocks", "bondage", "boner", "boob",
  "boobs", "booty call", "brown showers", "brunette action", "bukkake",
  "bulldyke", "bullet vibe", "bullshit", "bung hole", "bunghole",
  "busty", "butt", "buttcheeks", "butthole", "camel toe",
  "camgirl", "camslut", "camwhore", "carpet muncher", "carpetmuncher",
  "chocolate rosebuds", "cialis", "circlejerk", "cleveland steamer", "clit",
  "clitoris", "clover clamps", "clusterfuck", "cock", "cocks",
  "coprolagnia", "coprophilia", "cornhole", "coon", "coons",
  "creampie", "cum", "cumming", "cumshot", "cumshots",
  "cunnilingus", "cunt", "darkie", "date rape", "daterape",
  "deep throat", "deepthroat", "dendrophilia", "dick", "dildo",
  "dingleberry", "dingleberries", "dirty pillows", "dirty sanchez", "doggie style",
  "doggiestyle", "doggy style", "doggystyle", "dog style", "dolcett",
  "domination", "dominatrix", "dommes", "donkey punch", "double dong",
  "double penetration", "dp action", "dry hump", "dvda", "eat my ass",
  "ecchi", "ejaculation", "erotic", "erotism", "escort",
  "eunuch", "fag", "faggot", "fecal", "felch",
  "fellatio", "feltch", "female squirting", "femdom", "figging",
  "fingerbang", "fingering", "fisting", "foot fetish", "footjob",
  "frotting", "fuck", "fuck buttons", "fuckin", "fucking",
  "fucktards", "fudge packer", "fudgepacker", "futanari", "gangbang",
  "gang bang", "gay sex", "genitals", "giant cock", "girl on",
  "girl on top", "girls gone wild", "goatcx", "goatse", "god damn",
  "gokkun", "golden shower", "goodpoop", "goo girl", "goregasm",
  "grope", "group sex", "g-spot", "guro", "hand job",
  "handjob", "hard core", "hardcore", "hentai", "homoerotic",
  "honkey", "hooker", "horny", "hot carl", "hot chick",
  "how to kill", "how to murder", "huge fat", "humping", "incest",
  "intercourse", "jack off", "jail bait", "jailbait", "jelly donut",
  "jerk off", "jigaboo", "jiggaboo", "jiggerboo", "jizz",
  "juggs", "kike", "kinbaku", "kinkster", "kinky",
  "knobbing", "leather restraint", "leather straight jacket", "lemon party", "livesex",
  "lolita", "lovemaking", "make me come", "male squirting", "masturbate",
  "masturbating", "masturbation", "menage a trois", "milf", "missionary position",
  "mong", "motherfucker", "mound of venus", "mr hands", "muff diver",
  "muffdiving", "nambla", "nawashi", "negro", "neonazi",
  "nigga", "nigger", "nig nog", "nimphomania", "nipple",
  "nipples", "nsfw", "nsfw images", "nude", "nudity",
  "nutten", "nympho", "nymphomania", "octopussy", "omorashi",
  "one cup two girls", "one guy one jar", "orgasm", "orgy", "paedophile",
  "paki", "panties", "panty", "pedobear", "pedophile",
  "pegging", "penis", "phone sex", "piece of shit", "pikey",
  "pissing", "piss pig", "pisspig", "playboy", "pleasure chest",
  "pole smoker", "ponyplay", "poof", "poon", "poontang",
  "punany", "poop chute", "poopchute", "porn", "porno",
  "pornography", "prince albert piercing", "pthc", "pubes", "pussy",
  "queaf", "queef", "quim", "raghead", "raging boner",
  "rape", "raping", "rapist", "rectum", "reverse cowgirl",
  "rimjob", "rimming", "rosy palm", "rosy palm and her 5 sisters", "rusty trombone",
  "sadism", "santorum", "scat", "schlong", "scissoring",
  "semen", "sex", "sexcam", "sexo", "sexy",
  "sexual", "sexually", "sexuality", "shaved beaver", "shaved pussy",
  "shemale", "shibari", "shit", "shitblimp", "shitty",
  "shota", "shrimping", "skeet", "slanteye", "slut",
  "s&m", "smut", "snatch", "snowballing", "sodomize",
  "sodomy", "spastic", "spic", "splooge", "splooge moose",
  "spooge", "spread legs", "spunk", "strap on", "strapon",
  "strappado", "strip club", "style doggy", "suck", "sucks",
  "suicide girls", "sultry women", "swastika", "swinger", "tainted love",
  "taste my", "tea bagging", "threesome", "throating", "thumbzilla",
  "tied up", "tight white", "tit", "tits", "titties",
  "titty", "tongue in a", "topless", "tosser", "towelhead",
  "tranny", "tribadism", "tub girl", "tubgirl", "tushy",
  "twat", "twink", "twinkie", "two girls one cup", "undressing",
  "upskirt", "urethra play", "urophilia", "vagina", "venus mound",
  "viagra", "vibrator", "violet wand", "vorarephilia", "voyeur",
  "voyeurweb", "voyuer", "vulva", "wank", "wetback",
  "wet dream", "white power", "whore", "worldsex", "wrapping men",
  "wrinkled starfish", "xx", "xxx", "yaoi", "yellow showers",
  "yiffy", "zoophilia", "🖕"
];

const GAIN           = { xp:5, damage:0.04, defense:0.007};
const XP_PER_LEVEL   = 60;
const MAX_LEVEL      = 100;
const MAX_DEFENSE    = 10;
const BASE_HP        = 100;
const HP_PER_LEVEL   = 15;
const WANDER_TRANS   = 3.0;
const WANDER_WAIT    = 2500;
const FIGHT_COOLDOWN = 1200;
const BORDER_MIN     = 40;   // minimum arena border %
const BORDER_STEP_BASE = 0.16; // base shrink per tick (scales with fewer ducks)
const LUNGE_PROB     = 0.07;  // chance per wander tick to lunge at another duck
const HEARTBEAT_MS   = 4000;
const HOST_TIMEOUT   = 10000;

const INTERACTIONS = [
  { type:"greet", emote:"👋", prob:0.35 },
  { type:"chase", emote:"🏃", prob:0.20 },
  { type:"dance", emote:"💃", prob:0.20 },
  { type:"sleep", emote:"💤", prob:0.15 },
  { type:"heart", emote:"❤️",  prob:0.10 },
];

// ─────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────
const TAB_ID = `tab_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
 
let liveDucks        = [];
let myTeam           = null;
let allPositions     = {};
let allStats         = {};
let globalTotals     = {};
let fightModeActive  = false;
let fightCheckInterval = null;
let borderInterval     = null;
let currentBorderPct   = 0;
let voteTeams          = [];
let myVotedTeam        = null;
const wanderTimers     = {};
const lastFightTime    = {};
// Track duck movement as { fromX, fromY, toX, toY, startedAt, duration }
// so we can interpolate the true current position during transitions
const duckMotion       = {};
let   globalFightStats = {}; // synced from Firebase — source of truth for leaderboard
const seenInteractions = new Set();
let   winnerDeclared   = false; // prevents duplicate winner popups per fight
 
// Host election state
let amHost           = false;   // true if this tab is currently the host
let presenceTabs     = [];      // sorted list of alive tabs
let heartbeatInterval = null;
 
let selectedSkin        = DUCK_SKINS[0]?.id ?? null;
let selectedAccessory   = null;
let pendingProfileImage = null;
 
// ─────────────────────────────────────────────────────────
// SIZING
// ─────────────────────────────────────────────────────────
function getDuckSize(n) {
  if (n<=2) return 52; if (n<=4) return 44;
  if (n<=8) return 36; if (n<=14) return 28; return 22;
}
function applyDuckSizes() {
  const sz = getDuckSize(liveDucks.length);
  document.querySelectorAll(".duck-sprite").forEach(el => {
    const w=el.querySelector(".duck-wrapper"); if(w){w.style.width=sz+"px";w.style.height=sz+"px";}
    const img=el.querySelector(".duck-body img"); if(img){img.style.width=sz+"px";img.style.height=sz+"px";}
    const bar=el.querySelector(".duck-stats-bar"); if(bar) bar.style.width=sz+"px";
  });
}
 
// ─────────────────────────────────────────────────────────
// TREES
// ─────────────────────────────────────────────────────────
function buildTrees() {
  const c=document.getElementById("tree-border"); c.innerHTML="";
  const W=window.innerWidth, H=window.innerHeight, sz=48, gap=sz*0.72;
  const positions=[];
  // Top row — flush at top
  for(let x=0;x<W;x+=gap) positions.push({left:x, top:-6});
  // Bottom row — pushed down so trunks are off-screen
  for(let x=0;x<W;x+=gap) positions.push({left:x, top:H-sz+14});
  // Left and right columns
  for(let y=gap;y<H-gap;y+=gap){
    positions.push({left:-6, top:y});
    positions.push({left:W-sz+6, top:y});
  }
  positions.forEach(({left,top})=>{
    const el=document.createElement("div"); el.className="tree";
    el.style.left=left+"px"; el.style.top=top+"px";
    const s=(1.1+Math.random()*2.2).toFixed(2);
    el.style.transform=`scale(${s})`; el.style.transformOrigin="bottom center";
    el.innerHTML=`<img src="${TREE_SRC}" alt=""/>`;
    c.appendChild(el);
  });
}
 
// ─────────────────────────────────────────────────────────
// FIREFLIES
// ─────────────────────────────────────────────────────────
function buildFireflies() {
  const existing = document.getElementById("firefly-layer");
  if(existing) existing.remove();
  const layer = document.createElement("div");
  layer.id = "firefly-layer";
  document.getElementById("field-screen").appendChild(layer);
 
  const COUNT = 38;
  for(let i = 0; i < COUNT; i++) {
    const f = document.createElement("div");
    f.className = "firefly";
    // Random starting position
    const x = 5 + Math.random()*90;
    const y = 8 + Math.random()*80;
    // Randomise every timing so they all feel independent
    const driftDur  = (6 + Math.random()*10).toFixed(2);
    const glowDur   = (1.4 + Math.random()*2.2).toFixed(2);
    const glowDelay = (Math.random()*4).toFixed(2);
    const driftDx   = ((Math.random()-0.5)*18).toFixed(1);
    const driftDy   = ((Math.random()-0.5)*14).toFixed(1);
    const size      = (2.5 + Math.random()*2).toFixed(1);
    f.style.cssText = `
      left:${x}%;top:${y}%;
      width:${size}px;height:${size}px;
      --dx:${driftDx}px;--dy:${driftDy}px;
      animation:
        fireflyDrift ${driftDur}s ease-in-out ${(Math.random()*6).toFixed(2)}s infinite alternate,
        fireflyGlow  ${glowDur}s ease-in-out  ${glowDelay}s infinite;
    `;
    layer.appendChild(f);
  }
}
function defaultStats() {
  return { level:1, xp:0, maxHealth:BASE_HP, health:BASE_HP, damage:10, defense:0, ko:false };
}
function getStats(team) { return allStats[team] || defaultStats(); }
 
function updateStatsDisplay(team) {
  const el=document.getElementById(`duck-${team}`); if(!el) return;
  const s=getStats(team);
  const fill=el.querySelector(".hp-bar-fill");
  const lvl=el.querySelector(".duck-level");
  if(fill){ const p=Math.max(0,(s.health/s.maxHealth)*100); fill.style.width=p+"%"; fill.style.background=p>50?"#4cde6a":p>25?"#f0c040":"#e84040"; }
  if(lvl) lvl.textContent=`Lv${s.level}`;
}
 
function showLevelUp(team) {
  const el=document.getElementById(`duck-${team}`); if(!el) return;
  const b=document.createElement("div"); b.className="levelup-badge"; b.textContent="✨ LEVEL UP!";
  el.appendChild(b); setTimeout(()=>b.remove(),1800);
}
 
// tickStats is only called by the host, for any duck
async function tickStats(team) {
  const s={...getStats(team)};
  if(s.ko || s.level>=MAX_LEVEL) return;
  s.xp+=GAIN.xp; s.damage+=GAIN.damage; s.defense=Math.min(MAX_DEFENSE,s.defense+GAIN.defense);
  if(s.xp >= s.level*XP_PER_LEVEL && s.level<MAX_LEVEL){
    s.xp -= s.level*XP_PER_LEVEL; s.level=Math.min(MAX_LEVEL,s.level+1);
    s.maxHealth+=HP_PER_LEVEL; s.health=s.maxHealth; showLevelUp(team);
  }
  await broadcastStats(team, s);
}
 
async function applyInteractionXP(team) {
  const s={...getStats(team)};
  if(s.ko||s.level>=MAX_LEVEL) return;
  s.xp+=15;
  if(s.xp>=s.level*XP_PER_LEVEL && s.level<MAX_LEVEL){
    s.xp-=s.level*XP_PER_LEVEL; s.level=Math.min(MAX_LEVEL,s.level+1);
    s.maxHealth+=HP_PER_LEVEL; s.health=s.maxHealth; showLevelUp(team);
  }
  await broadcastStats(team, s);
}
 
// ─────────────────────────────────────────────────────────
// HOST ELECTION
// ─────────────────────────────────────────────────────────
// The oldest tab (lowest joinedAt) that is still alive is the host.
// It drives ALL duck movement and stat ticking.
// If it disconnects, Firebase removes its presence entry, the next tab
// sees the updated presence list and becomes host automatically.
 
function electHost(tabs) {
  presenceTabs = tabs;
  const wasHost = amHost;
 
  // Filter out stale tabs (lastSeen too old — safety net beyond onDisconnect)
  const now = Date.now();
  const alive = tabs.filter(t => now - (t.lastSeen || t.joinedAt) < HOST_TIMEOUT);
 
  if (!alive.length) { amHost = false; return; }
 
  const hostTabId = alive[0].tabId;
  amHost = (hostTabId === TAB_ID);
 
  if (amHost && !wasHost) {
    // Just became host — start driving all ducks
    console.log("[host] This tab is now the host");
    startHostLoop();
  } else if (!amHost && wasHost) {
    // Lost host status — stop driving
    console.log("[host] Lost host status");
    stopHostLoop();
  }
}
 
function startHostLoop() {
  // Clear any existing timers
  Object.keys(wanderTimers).forEach(team => { clearTimeout(wanderTimers[team]); delete wanderTimers[team]; });
  // Start wander for all known ducks immediately
  liveDucks.forEach(duck => {
    if (!wanderTimers[duck.team]) startWander(duck.team);
  });
}
 
function stopHostLoop() {
  Object.keys(wanderTimers).forEach(team => { clearTimeout(wanderTimers[team]); delete wanderTimers[team]; });
}
 
// ─────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  buildSkinPicker(); buildAccessoryPicker();
 
  document.getElementById("submit-btn").addEventListener("click", handleSubmit);
  document.getElementById("profile-upload").addEventListener("change", handleImageUpload);
  document.getElementById("popup-close-btn").addEventListener("click", closePopupDirect);
  document.getElementById("duck-popup").addEventListener("click", e=>{ if(e.target===e.currentTarget) closePopupDirect(); });
  document.getElementById("fight-btn").addEventListener("click", handleFightStop);
  document.getElementById("fight-start-btn").addEventListener("click", handleFightStart);
  document.getElementById("vote-btn").addEventListener("click", ()=>openModal("vote-modal"));
  document.getElementById("lb-btn").addEventListener("click", openLbModal);
  document.getElementById("vote-modal-close").addEventListener("click", ()=>closeModal("vote-modal"));
  document.getElementById("lb-modal-close").addEventListener("click", ()=>closeModal("lb-modal"));
  document.getElementById("vote-submit-btn").addEventListener("click", handleVote);
  document.getElementById("vote-modal").addEventListener("click", e=>{ if(e.target===e.currentTarget) closeModal("vote-modal"); });
  document.getElementById("lb-modal").addEventListener("click", e=>{ if(e.target===e.currentTarget) closeModal("lb-modal"); });
 
  window.addEventListener("resize", ()=>{ if(document.getElementById("field-screen").style.display==="block"){ buildTrees(); buildFireflies(); } });
 
  // Register this tab's presence and start heartbeat
  registerPresence(TAB_ID);
  heartbeatInterval = setInterval(() => updateHeartbeat(TAB_ID), HEARTBEAT_MS);
 
  // Firebase listeners
  onDucksChanged(ducks => {
    const onField = document.getElementById("field-screen").style.display==="block";
    liveDucks = ducks;
    if (onField) syncField();
    // If we're host, start wander for any new ducks
    if (amHost) ducks.forEach(d => { if (!wanderTimers[d.team]) startWander(d.team); });
  });
 
  onPositionsChanged(positions => {
    allPositions = positions;
    applyPositions();
  });
 
  onStatsChanged(stats => {
    const prevStats = { ...allStats };
    allStats = stats;
    Object.keys(stats).forEach(team => {
      updateStatsDisplay(team);
      const s=stats[team], prev=prevStats[team]||{};
 
      // Visual effects for ALL tabs — diff against previous known stats
      if(!amHost) {
        if(prev.health !== undefined && s.health < prev.health) {
          const dmg = Math.round(prev.health - s.health);
          showHit(team, dmg);
          pulseVignette();
        }
        if(s.level > (prev.level||1)) showLevelUp(team);
        // KO just happened
        if(s.ko && !prev.ko) {
          showKOBurst(team);
          // find who likely killed them — highest kills in globalFightStats among alive ducks
          const killer = liveDucks
            .filter(d=>d.team!==team && !(allStats[d.team]||{}).ko)
            .sort((a,b)=>(globalFightStats[b.team]||{kills:0}).kills-(globalFightStats[a.team]||{kills:0}).kills)[0];
          if(killer) pushKillFeed(killer.team, team);
        }
      }
 
      const el=document.getElementById(`duck-${team}`);
      if(el){
        if(s.ko && !el.classList.contains("knocked-out")){
          el.classList.add("knocked-out");
          const wrapper=el.querySelector(".duck-wrapper");
          const body=el.querySelector(".duck-body");
          const acc=el.querySelector(".duck-accessory");
          if(wrapper){ wrapper.style.animation="none"; wrapper.style.transform="scaleX(1)"; }
          if(body){ body.style.animation="none"; }
          if(acc){ acc.style.animation="none"; }
          if(!el.querySelector(".ko-badge")){const b=document.createElement("div");b.className="ko-badge";b.textContent="KO";el.appendChild(b);}
          if(amHost){ clearTimeout(wanderTimers[team]); delete wanderTimers[team]; }
        } else if(!s.ko && el.classList.contains("knocked-out")){
          el.classList.remove("knocked-out");
          el.querySelector(".ko-badge")?.remove();
          const wrapper=el.querySelector(".duck-wrapper");
          const body=el.querySelector(".duck-body");
          const acc=el.querySelector(".duck-accessory");
          if(wrapper){ wrapper.style.animation=""; }
          if(body){ body.style.animation=""; }
          if(acc){ acc.style.animation=""; }
          if(amHost && !wanderTimers[team]) startWander(team);
        }
      }
    });
    updateRankStrip();
    if(fightModeActive) { checkForFightWinner(); maybeShowShowdown(); }
  });
 
  onFightStatsChanged(fs => {
    globalFightStats = fs;
    updateRankStrip();
  });
 
  onFightStateChanged(state => {
    if(state.active && !fightModeActive)      startFightLocally(state.borderPct??0);
    else if(!state.active && fightModeActive) stopFightLocally();
    else if(state.active && fightModeActive && Math.abs(state.borderPct-currentBorderPct)>1){
      currentBorderPct=state.borderPct; applyFightBorder(currentBorderPct); updateFireBorder();
    }
  });
 
  onPresenceChanged(tabs => electHost(tabs));
  onVotesChanged(teams => { voteTeams=teams; updateVoteUI(); });
  onWinnersChanged(w => renderWinners(w));
  onTotalsChanged(t => { globalTotals=t; });
  onInteractionsChanged(events => {
    events.forEach(ev => {
      if(!ev||seenInteractions.has(ev.ts)) return;
      seenInteractions.add(ev.ts);
      showInteractionEmote(ev);
    });
  });
});
 
// ─────────────────────────────────────────────────────────
// MODALS
// ─────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).style.display="flex"; }
function closeModal(id) { document.getElementById(id).style.display="none"; }
 
// ─────────────────────────────────────────────────────────
// WINNERS
// ─────────────────────────────────────────────────────────
function renderWinners(winners) {
  const wrap=document.getElementById("winners-wrap"), list=document.getElementById("winners-list");
  if(!winners.length){wrap.style.display="none";return;}
  wrap.style.display="block";
  list.innerHTML=[...winners].sort((a,b)=>(b.timestamp||0)-(a.timestamp||0)).slice(0,10)
    .map(w=>`<div class="winner-row"><span>🏆 ${w.name}</span><span class="winner-team">${w.team}</span></div>`).join("");
}
 
// ─────────────────────────────────────────────────────────
// PICKERS
// ─────────────────────────────────────────────────────────
function buildSkinPicker() {
  const c=document.getElementById("skin-picker"); c.innerHTML="";
  if(!DUCK_SKINS.length){c.innerHTML=`<span style="font-size:12px;color:#555;">No skins yet</span>`;return;}
  DUCK_SKINS.forEach(skin=>{
    const el=document.createElement("div");
    el.className="picker-option"+(skin.id===selectedSkin?" selected":"");
    el.title=skin.label; el.innerHTML=`<img src="${skin.src}" alt="${skin.label}"/>`;
    el.onclick=()=>{selectedSkin=skin.id;c.querySelectorAll(".picker-option").forEach(o=>o.classList.remove("selected"));el.classList.add("selected");};
    c.appendChild(el);
  });
}
function buildAccessoryPicker() {
  const c=document.getElementById("accessory-picker"); c.innerHTML="";
  const none=document.createElement("div");
  none.className="picker-option"+(selectedAccessory===null?" selected":"");
  none.title="None"; none.textContent="✕";
  none.onclick=()=>{selectedAccessory=null;c.querySelectorAll(".picker-option").forEach(o=>o.classList.remove("selected"));none.classList.add("selected");};
  c.appendChild(none);
  if(!DUCK_ACCESSORIES.length){const n=document.createElement("span");n.style.cssText="font-size:12px;color:#555;line-height:46px;margin-left:8px;";n.textContent="No accessories yet";c.appendChild(n);return;}
  DUCK_ACCESSORIES.forEach(acc=>{
    const el=document.createElement("div");
    el.className="picker-option"+(acc.id===selectedAccessory?" selected":"");
    el.title=acc.label; el.innerHTML=`<img src="${acc.src}" alt="${acc.label}"/>`;
    el.onclick=()=>{selectedAccessory=acc.id;c.querySelectorAll(".picker-option").forEach(o=>o.classList.remove("selected"));el.classList.add("selected");};
    c.appendChild(el);
  });
}
 
// ─────────────────────────────────────────────────────────
// UPLOAD
// ─────────────────────────────────────────────────────────
function handleImageUpload(e) {
  const file=e.target.files[0]; if(!file) return;
  const r=new FileReader();
  r.onload=ev=>{
    pendingProfileImage=ev.target.result;
    document.getElementById("upload-preview").src=pendingProfileImage;
    document.getElementById("upload-preview").style.display="block";
    document.getElementById("upload-text").style.display="none";
  };
  r.readAsDataURL(file);
}
 
// ─────────────────────────────────────────────────────────
// REGISTRATION
// ─────────────────────────────────────────────────────────
function validateLocalTeam(t){
  if(!t) return "Please enter a team number.";
  if(!VALID_TEAMS.includes(t)) return `"${t}" isn't a recognised team number.`;
  return null;
}
function validateLocalName(n){
  if(!n) return "Please give your duck a name.";
  if(BANNED_NAMES.find(w=>n.toLowerCase().includes(w.toLowerCase()))) return "That name isn't allowed.";
  return null;
}
 
async function handleSubmit() {
  const teamRaw=document.getElementById("team-input").value.trim().toUpperCase();
  const name=document.getElementById("name-input").value.trim();
  document.getElementById("team-error").textContent="";
  document.getElementById("name-error").textContent="";
  const te=validateLocalTeam(teamRaw), ne=validateLocalName(name);
  if(te){document.getElementById("team-error").textContent=te;return;}
  if(ne){document.getElementById("name-error").textContent=ne;return;}
  const btn=document.getElementById("submit-btn"); btn.textContent="Checking…"; btn.disabled=true;
 
  if(liveDucks.find(d=>d.team===teamRaw)){
    myTeam=teamRaw; btn.textContent="Add duck to field →"; btn.disabled=false; showField(); return;
  }
  const {teamError,nameError}=await validateUniqueness(teamRaw,name);
  btn.textContent="Add duck to field →"; btn.disabled=false;
  if(teamError){document.getElementById("team-error").textContent=teamError;return;}
  if(nameError){document.getElementById("name-error").textContent=nameError;return;}
 
  await addDuckToDatabase({name, team:teamRaw, skin:selectedSkin, accessory:selectedAccessory,
    profileImageDataUrl:pendingProfileImage, startX:10+Math.random()*70, startY:10+Math.random()*70});
  await broadcastStats(teamRaw, defaultStats());
 
  myTeam=teamRaw;
  pendingProfileImage=null; selectedSkin=DUCK_SKINS[0]?.id??null; selectedAccessory=null;
  document.getElementById("team-input").value=""; document.getElementById("name-input").value="";
  document.getElementById("upload-preview").style.display="none";
  document.getElementById("upload-text").style.display="inline";
  showField();
}
 
// ─────────────────────────────────────────────────────────
// FIELD
// ─────────────────────────────────────────────────────────
function showField() {
  document.getElementById("registration-screen").style.display="none";
  document.getElementById("field-screen").style.display="block";
  buildTrees(); buildFireflies(); syncField();
}
 
function syncField() {
  const field=document.getElementById("field-screen");
  document.getElementById("field-title").textContent=`The duck field · ${liveDucks.length} duck${liveDucks.length!==1?"s":""}`;
 
  liveDucks.forEach(duck=>{
    if(!document.getElementById(`duck-${duck.team}`)){
      const el=makeDuckElement(duck);
      const pos=allPositions[duck.team]||{x:duck.startX??20,y:duck.startY??20};
      el.style.transition="none"; el.style.left=pos.x+"%"; el.style.top=pos.y+"%";
      field.appendChild(el);
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        el.style.transition="";
        // Host starts wander for newly rendered duck
        if(amHost && !wanderTimers[duck.team]) setTimeout(()=>startWander(duck.team),200+Math.random()*400);
      }));
    }
  });
 
  field.querySelectorAll(".duck-sprite").forEach(el=>{
    const team=el.id.replace("duck-","");
    if(!liveDucks.find(d=>d.team===team)){
      el.remove(); clearTimeout(wanderTimers[team]); delete wanderTimers[team];
    }
  });
 
  applyDuckSizes();
}
 
function applyPositions() {
  Object.entries(allPositions).forEach(([team,pos])=>{
    if(amHost) return;
    const el=document.getElementById(`duck-${team}`); if(!el) return;
    // Use the transition time broadcast by host (fast for lunges, normal for wanders)
    const t = pos.trans ?? (WANDER_TRANS + Math.random()*0.5);
    el.style.transition=`left ${t}s linear, top ${t}s linear`;
    el.style.left=pos.x+"%"; el.style.top=pos.y+"%";
    const curX=parseFloat(el.dataset.lastX||pos.x);
    const wrapper=el.querySelector(".duck-wrapper");
    const body=el.querySelector(".duck-body");
    const acc=el.querySelector(".duck-accessory");
    const img=el.querySelector(".duck-body img");
    if(wrapper){
      if(pos.x>curX){
        wrapper.style.transform="scaleX(-1)"; wrapper.style.animation="";
        if(body){ body.style.animation="waddle 0.55s ease-in-out infinite"; }
        if(acc){ acc.style.animation="waddle 0.55s ease-in-out infinite"; }
        if(img){ img.style.transform=""; img.style.animation=""; }
      } else {
        wrapper.style.transform="scaleX(1)"; wrapper.style.animation="";
        if(body){ body.style.animation="waddle 0.55s ease-in-out infinite"; }
        if(acc){ acc.style.animation="waddle 0.55s ease-in-out infinite"; }
        if(img){ img.style.transform=""; img.style.animation=""; }
      }
    }
    el.dataset.lastX=pos.x;
  });
}
 
// ─────────────────────────────────────────────────────────
// DUCK ELEMENT
// ─────────────────────────────────────────────────────────
function getSkinSrc(id){ return DUCK_SKINS.find(s=>s.id===id)?.src??DUCK_SKINS[0]?.src??"duck.png"; }
 
function makeDuckElement(duck) {
  const color=TEAM_COLORS[duck.team]||"#f5c842";
  const sz=getDuckSize(liveDucks.length);
  const src=getSkinSrc(duck.skin);
  let accHTML="";
  if(duck.accessory){const acc=DUCK_ACCESSORIES.find(a=>a.id===duck.accessory);if(acc)accHTML=`<div class="duck-accessory"><img src="${acc.src}" style="left:${acc.x}px;top:${acc.y}px;width:${acc.width}px;height:${acc.height}px;"/></div>`;}
  const el=document.createElement("div"); el.className="duck-sprite"; el.id=`duck-${duck.team}`;
  el.innerHTML=`
    <div class="duck-wrapper" style="width:${sz}px;height:${sz}px;">
      <div class="duck-shadow"></div>
      <div class="duck-body"><img src="${src}" alt="${duck.name}" style="width:${sz}px;height:${sz}px;"/></div>
      ${accHTML}
    </div>
    <div class="duck-stats-bar" style="width:${sz}px;">
      <span class="duck-level">Lv1</span>
      <div class="hp-bar"><div class="hp-bar-fill"></div></div>
    </div>
    <div class="duck-label" style="border-left:3px solid ${color};">${duck.name}</div>
    <div class="duck-tag">${duck.team}</div>`;
  el.addEventListener("click", ()=>openPopup(duck.team));
  return el;
}
 
// ─────────────────────────────────────────────────────────
// WANDER — only called by the host, moves ALL ducks
// ─────────────────────────────────────────────────────────
function startWander(team) {
  clearTimeout(wanderTimers[team]);
  let currentX = allPositions[team]?.x ?? 30;
 
  async function move() {
    if(!amHost){ delete wanderTimers[team]; return; }
    const s=getStats(team);
    if(s.ko && fightModeActive){ wanderTimers[team]=setTimeout(move,600); return; }
    if(s.ko){ wanderTimers[team]=setTimeout(move,1000); return; }
 
    const margin = fightModeActive ? currentBorderPct+1 : 7;
 
    // Lunge: during fights, occasionally charge straight at another duck
    let nextX, nextY, transTime;
    const aliveFoes = fightModeActive
      ? liveDucks.filter(d => d.team !== team && !(getStats(d.team)||{}).ko)
      : [];
    if(fightModeActive && aliveFoes.length && Math.random() < LUNGE_PROB) {
      const target = aliveFoes[Math.floor(Math.random()*aliveFoes.length)];
      // Aim at target's current interpolated position
      const tPos = getDuckCurrentPos(target.team);
      const cPos = getDuckCurrentPos(team);
      const dx = tPos.x - cPos.x, dy = tPos.y - cPos.y;
      nextX = Math.max(margin, Math.min(100-margin, tPos.x + dx*0.15));
      nextY = Math.max(margin+4, Math.min(100-margin-4, tPos.y + dy*0.15));
      transTime = 0.8 + Math.random()*0.4;
    } else {
      nextX = margin + Math.random()*(100-margin*2);
      nextY = margin+4 + Math.random()*(100-margin*2-4);
      transTime = WANDER_TRANS + Math.random()*1.0;
    }
 
    // Record motion for interpolated collision detection
    const prevPos = duckMotion[team];
    const fromX = prevPos ? prevPos.toX : (allPositions[team]?.x ?? nextX);
    const fromY = prevPos ? prevPos.toY : (allPositions[team]?.y ?? nextY);
    duckMotion[team] = { fromX, fromY, toX: nextX, toY: nextY, startedAt: Date.now(), duration: transTime * 1000 };
 
    const el=document.getElementById(`duck-${team}`);
    if(el){
      const wrapper=el.querySelector(".duck-wrapper");
      const body=el.querySelector(".duck-body");
      const acc=el.querySelector(".duck-accessory");
      const img=el.querySelector(".duck-body img");
      if(wrapper){
        if(nextX>currentX){
          wrapper.style.transform="scaleX(-1)";
          if(body){ body.style.animation="waddle 0.55s ease-in-out infinite"; }
          if(acc){ acc.style.animation="waddle 0.55s ease-in-out infinite"; }
        } else {
          wrapper.style.transform="scaleX(1)";
          if(body){ body.style.animation="waddle 0.55s ease-in-out infinite"; }
          if(acc){ acc.style.animation="waddle 0.55s ease-in-out infinite"; }
        }
        wrapper.style.animation="";
        if(img){ img.style.transform=""; img.style.animation=""; }
      }
      el.style.transition=`left ${transTime}s linear, top ${transTime}s linear`;
      el.style.left=nextX+"%"; el.style.top=nextY+"%";
    }
 
    currentX=nextX;
    await broadcastPosition(team, nextX, nextY, transTime);
    await tickStats(team);
    if(!fightModeActive) checkFieldInteractions(team, nextX, nextY);
 
    // During a lunge, schedule next move sooner so it feels snappy
    const wait = (fightModeActive && transTime < 1.5)
      ? transTime*1000 + 200
      : WANDER_WAIT + Math.random()*1500;
    wanderTimers[team]=setTimeout(move, wait);
  }
  move();
}
 
// ─────────────────────────────────────────────────────────
// INTERACTIONS
// ─────────────────────────────────────────────────────────
function checkFieldInteractions(teamA, ax, ay) {
  liveDucks.forEach(duck=>{
    if(duck.team===teamA) return;
    const pos=allPositions[duck.team]; if(!pos) return;
    if(Math.hypot(ax-pos.x, ay-pos.y) < 12){
      const rand=Math.random(); let cumul=0;
      for(const inter of INTERACTIONS){
        cumul+=inter.prob;
        if(rand<cumul){
          broadcastInteraction({type:inter.type,emote:inter.emote,teamA,teamB:duck.team,ts:Date.now()});
          break;
        }
      }
    }
  });
}
 
function showInteractionEmote(ev) {
  [ev.teamA,ev.teamB].forEach(team=>{
    const el=document.getElementById(`duck-${team}`); if(!el) return;
    const e=document.createElement("div"); e.className="duck-emote"; e.textContent=ev.emote;
    el.appendChild(e); setTimeout(()=>e.remove(),1400);
  });
  // Host applies XP bonus to both ducks in interaction
  if(amHost){
    [ev.teamA,ev.teamB].forEach(team=>applyInteractionXP(team));
  }
}
 
// ─────────────────────────────────────────────────────────
// FIGHT MODE
// ─────────────────────────────────────────────────────────
async function handleFightStart() {
  const pw=prompt("Enter fight password:"); if(!pw) return;
  if(pw!==FIGHT_START_PW){alert("Incorrect password.");return;}
  await clearVotes();
  await setFightState(true,0);
}
 
async function handleFightStop() {
  const pw=prompt("Enter stop code:"); if(!pw) return;
  if(pw!==FIGHT_STOP_PW){alert("Incorrect code.");return;}
  await setFightState(false,0);
}
 
function startFightLocally(startBorder=0) {
  fightModeActive=true; currentBorderPct=startBorder; winnerDeclared=false; showdownShown=false;
  document.getElementById("winner-popup-overlay")?.remove();
  document.getElementById("kill-feed")?.remove();
  if(amHost) clearFightStats();
  document.getElementById("fight-btn").style.display="inline-block";
  document.getElementById("fight-start-btn").style.display="none";
  document.getElementById("vote-btn").style.display="none";
  document.getElementById("field-screen").classList.add("fight-mode");
  document.getElementById("rank-strip").style.display="flex";
  applyFightBorder(currentBorderPct);
  fightCheckInterval=setInterval(checkCollisions,50);
  if(amHost) borderInterval=setInterval(shrinkAndBroadcastBorder,800);
  myVotedTeam=null; updateVoteUI(); updateRankStrip();
  showFightIntroBanner();
  setTimeout(checkForFightWinner, 500);
}
 
function stopFightLocally() {
  fightModeActive=false;
  document.getElementById("fight-btn").style.display="none";
  document.getElementById("fight-start-btn").style.display="inline-block";
  document.getElementById("vote-btn").style.display="inline-block";
  document.getElementById("field-screen").classList.remove("fight-mode");
  document.getElementById("rank-strip").style.display="none";
  clearInterval(fightCheckInterval); clearInterval(borderInterval);
  fightCheckInterval=null; borderInterval=null;
  currentBorderPct=0; applyFightBorder(0);
  document.getElementById("field-screen").classList.remove("fire-border");
  document.getElementById("kill-feed")?.remove();
 
  // Persist totals from synced fight stats
  Object.entries(globalFightStats).forEach(async ([team, fs])=>{
    if(fs.kills>0||fs.damage>0) await addToTotals(team,fs.kills,fs.damage);
  });
  if(amHost) clearFightStats();
  Object.keys(lastFightTime).forEach(k=>delete lastFightTime[k]);
 
  // Reset health/KO in Firebase
  if(amHost){
    liveDucks.forEach(async duck=>{
      const s=getStats(duck.team);
      await broadcastStats(duck.team,{...s,health:s.maxHealth,ko:false});
    });
    // Restart wander for all ducks
    setTimeout(()=>{
      liveDucks.forEach(duck=>{
        clearTimeout(wanderTimers[duck.team]); delete wanderTimers[duck.team];
        startWander(duck.team);
      });
    }, 500);
  }
 
  myVotedTeam=null; updateVoteUI();
}
 
// ─────────────────────────────────────────────────────────
// FIGHT BORDER
// ─────────────────────────────────────────────────────────
function shrinkAndBroadcastBorder() {
  if(currentBorderPct>=BORDER_MIN) return;
  // Shrink faster as fewer ducks remain alive
  const aliveCount = Math.max(1, liveDucks.filter(d => !(getStats(d.team)||{}).ko).length);
  const totalCount = Math.max(1, liveDucks.length);
  // Speed multiplier: 1x at full count, up to 4x when only 1 duck remains
  const speedMult = 1 + 3 * (1 - aliveCount / totalCount);
  const step = BORDER_STEP_BASE * speedMult;
  currentBorderPct = Math.min(BORDER_MIN, currentBorderPct + step);
  applyFightBorder(currentBorderPct);
  updateFireBorder();
  if(currentBorderPct % 1 < step * 2) updateBorderPct(parseFloat(currentBorderPct.toFixed(2)));
}
function applyFightBorder(pct) {
  const el=document.getElementById("fight-border"); if(!el) return;
  el.style.top=pct+"%"; el.style.left=pct+"%";
  el.style.right=pct+"%"; el.style.bottom=pct+"%";
  el.style.opacity=pct>0?"1":"0";
}
 
// ─────────────────────────────────────────────────────────
// COLLISIONS — host only, uses interpolated current positions
// ─────────────────────────────────────────────────────────
 
// Returns where a duck actually IS right now (mid-transition)
function getDuckCurrentPos(team) {
  const m = duckMotion[team];
  if(!m) return allPositions[team] || { x:50, y:50 };
  const elapsed = Date.now() - m.startedAt;
  const t = Math.min(1, elapsed / m.duration); // 0→1 progress
  return {
    x: m.fromX + (m.toX - m.fromX) * t,
    y: m.fromY + (m.toY - m.fromY) * t,
  };
}
 
function checkCollisions() {
  if(!amHost) return;
  const now = Date.now();
  const aliveDucks = liveDucks.filter(d => { const s=getStats(d.team); return s && !s.ko; });
  for(let i=0;i<aliveDucks.length;i++){
    for(let j=i+1;j<aliveDucks.length;j++){
      const tA=aliveDucks[i].team, tB=aliveDucks[j].team;
      const pairKey=[tA,tB].sort().join("-");
      if(lastFightTime[pairKey] && now-lastFightTime[pairKey]<FIGHT_COOLDOWN) continue;
      const pA = getDuckCurrentPos(tA);
      const pB = getDuckCurrentPos(tB);
      // 3.5% of field width — roughly one duck-body width
      if(Math.hypot(pA.x-pB.x, pA.y-pB.y) < 3.5){
        lastFightTime[pairKey]=now;
        resolveFight(tA,tB);
      }
    }
  }
}
 
async function resolveFight(tA,tB) {
  const sA=getStats(tA),sB=getStats(tB);
  if(!sA||!sB||sA.ko||sB.ko) return;
  const [atkStats,defStats,defTeam]=Math.random()<0.5?[sA,sB,tB]:[sB,sA,tA];
  const atkTeam=defTeam===tB?tA:tB;
  const rawDmg=atkStats.damage, absorbed=Math.min(defStats.defense,rawDmg-1);
  const finalDmg=Math.max(1,Math.round(rawDmg-absorbed));
  const newDef={...defStats,health:Math.max(0,defStats.health-finalDmg)};
  await broadcastStats(defTeam,newDef);
  showHit(defTeam,finalDmg);
  pulseVignette();
 
  const cur=globalFightStats[atkTeam]||{kills:0,damage:0};
  const newKills=cur.kills+(newDef.health<=0?1:0);
  const newDamage=cur.damage+finalDmg;
  await broadcastFightStat(atkTeam, newKills, newDamage);
 
  if(newDef.health<=0){
    await broadcastStats(defTeam,{...newDef,ko:true});
    showKOBurst(defTeam);
    pushKillFeed(atkTeam, defTeam);
  }
  updateRankStrip();
  maybeShowShowdown();
}
 
function showHit(team,dmg) {
  const el=document.getElementById(`duck-${team}`); if(!el) return;
  const hit=document.createElement("div"); hit.className="hit-effect"; hit.textContent=`-${dmg}`;
  el.appendChild(hit); setTimeout(()=>hit.remove(),900);
  const w=el.querySelector(".duck-wrapper");
  if(w){w.classList.add("hit-flash");setTimeout(()=>w.classList.remove("hit-flash"),350);}
  document.getElementById("field-screen").classList.add("hit-shake");
  setTimeout(()=>document.getElementById("field-screen").classList.remove("hit-shake"),250);
}
 
// ─────────────────────────────────────────────────────────
// WINNER DETECTION
// ─────────────────────────────────────────────────────────
function checkForFightWinner() {
  if(!fightModeActive || winnerDeclared) return;
  const alive = liveDucks.filter(d => {
    const s = allStats[d.team]; // use allStats directly — missing entry = not KO'd yet
    return !s || !s.ko;
  });
  // Win condition: 1 duck alive (works for solo duck too), or 0 (everyone KO'd — pick highest HP)
  if(liveDucks.length >= 1 && alive.length <= 1) {
    winnerDeclared = true;
    const winner = alive.length === 1
      ? alive[0]
      : liveDucks.reduce((best, d) => { // all KO'd — pick the one with most HP
          const hp = (allStats[d.team]||{}).health || 0;
          return hp > ((allStats[best.team]||{}).health || 0) ? d : best;
        }, liveDucks[0]);
    if(!winner) return;
    if(amHost) {
      recordWinner({ name: winner.name, team: winner.team, timestamp: Date.now() });
      setTimeout(async () => { await setFightState(false, 0); }, 3000);
    }
    showWinnerPopup(winner);
  }
}
 
function showWinnerPopup(winner) {
  // Remove any existing winner popup
  document.getElementById("winner-popup-overlay")?.remove();
 
  const overlay = document.createElement("div");
  overlay.id = "winner-popup-overlay";
  overlay.style.cssText = `
    position:fixed;inset:0;background:rgba(0,0,0,.78);
    display:flex;align-items:center;justify-content:center;
    z-index:300;padding:1rem;animation:fadeInWinner .4s ease;
  `;
 
  const duck = liveDucks.find(d => d.team === winner.team);
  const color = TEAM_COLORS[winner.team] || "#f5c842";
  const skin = duck ? getSkinSrc(duck.skin) : "";
 
  let countdown = 10;
  overlay.innerHTML = `
    <style>
      @keyframes fadeInWinner{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
      @keyframes crownBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.1)}}
      #winner-popup-overlay .win-card{
        background:#1c1c1e;border:0.5px solid rgba(255,255,255,.12);border-radius:18px;
        padding:2rem 2rem 1.5rem;width:100%;max-width:300px;text-align:center;
        box-shadow:0 0 40px rgba(${hexToRgb(color)},0.35);
      }
      #winner-popup-overlay .win-crown{font-size:40px;animation:crownBounce 1s ease-in-out infinite;display:inline-block;margin-bottom:.3rem;}
      #winner-popup-overlay .win-title{font-size:13px;color:#888;letter-spacing:.08em;text-transform:uppercase;margin-bottom:.6rem;}
      #winner-popup-overlay .win-duck-img{width:80px;height:80px;object-fit:contain;margin:.4rem auto;}
      #winner-popup-overlay .win-name{font-size:22px;font-weight:600;color:#f0f0f0;margin:.5rem 0 .2rem;}
      #winner-popup-overlay .win-team{font-size:13px;color:${color};margin-bottom:1.2rem;font-weight:500;}
      #winner-popup-overlay .win-bar{height:3px;background:rgba(255,255,255,.08);border-radius:2px;overflow:hidden;margin-bottom:.8rem;}
      #winner-popup-overlay .win-bar-fill{height:100%;width:100%;background:${color};border-radius:2px;transition:width 1s linear;}
      #winner-popup-overlay .win-countdown{font-size:12px;color:#555;}
    </style>
    <div class="win-card">
      <div class="win-crown">👑</div>
      <p class="win-title">🏆 Winner!</p>
      ${skin ? `<img class="win-duck-img" src="${skin}" alt="${winner.name}"/>` : `<div style="font-size:60px;line-height:1;">🦆</div>`}
      <p class="win-name">${winner.name}</p>
      <p class="win-team">Team ${winner.team}</p>
      <div class="win-bar"><div class="win-bar-fill" id="win-bar-fill"></div></div>
      <p class="win-countdown">Returning to field in <span id="win-countdown-num">10</span>s…</p>
    </div>
  `;
  document.body.appendChild(overlay);
 
  // Animate countdown bar
  requestAnimationFrame(() => {
    const fill = document.getElementById("win-bar-fill");
    if(fill) { fill.style.transition="width 10s linear"; fill.style.width="0%"; }
  });
 
  const tick = setInterval(() => {
    countdown--;
    const el = document.getElementById("win-countdown-num");
    if(el) el.textContent = countdown;
    if(countdown <= 0) {
      clearInterval(tick);
      overlay.remove();
    }
  }, 1000);
}
 
function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : "245,200,66";
}
 
// ─────────────────────────────────────────────────────────
// VISUAL SPECTACLE
// ─────────────────────────────────────────────────────────
 
function showFightIntroBanner() {
  document.getElementById("fight-intro-banner")?.remove();
  const el = document.createElement("div"); el.id="fight-intro-banner";
  el.innerHTML=`<span>⚔️</span><span class="fight-intro-text">FIGHT!</span><span>⚔️</span>`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(), 1800);
}
 
let showdownShown = false;
function maybeShowShowdown() {
  if(!fightModeActive||showdownShown) return;
  const alive = liveDucks.filter(d=>!(allStats[d.team]||{}).ko);
  if(alive.length===2){
    showdownShown=true;
    const [a,b]=alive;
    const el=document.createElement("div"); el.id="showdown-banner";
    el.innerHTML=`
      <div class="showdown-inner">
        <span class="showdown-name" style="color:${TEAM_COLORS[a.team]||'#fff'}">${a.name}</span>
        <span class="showdown-vs">VS</span>
        <span class="showdown-name" style="color:${TEAM_COLORS[b.team]||'#fff'}">${b.name}</span>
      </div>
      <div class="showdown-sub">🔥 FINAL SHOWDOWN 🔥</div>`;
    document.body.appendChild(el);
    setTimeout(()=>el.classList.add("showdown-out"),2800);
    setTimeout(()=>el.remove(),3400);
  }
}
 
function pushKillFeed(killerTeam, victimTeam) {
  const killer=liveDucks.find(d=>d.team===killerTeam), victim=liveDucks.find(d=>d.team===victimTeam);
  if(!killer||!victim) return;
  let feed=document.getElementById("kill-feed");
  if(!feed){feed=document.createElement("div");feed.id="kill-feed";document.getElementById("field-screen").appendChild(feed);}
  const row=document.createElement("div"); row.className="kf-row";
  row.innerHTML=`<span style="color:${TEAM_COLORS[killerTeam]||'#fff'}">${killer.name}</span><span class="kf-skull">💀</span><span style="color:${TEAM_COLORS[victimTeam]||'#aaa'};opacity:.7">${victim.name}</span>`;
  feed.prepend(row);
  setTimeout(()=>row.classList.add("kf-fade"),3200);
  setTimeout(()=>row.remove(),3700);
  while(feed.children.length>5) feed.lastChild.remove();
}
 
function showKOBurst(team) {
  const el=document.getElementById(`duck-${team}`); if(!el) return;
  const rect=el.getBoundingClientRect();
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
  const particles=["💥","⭐","✨","🌟","💫","🔥"];
  for(let i=0;i<14;i++){
    const p=document.createElement("div"); p.className="ko-particle";
    const angle=(i/14)*360, dist=28+Math.random()*45, dur=0.45+Math.random()*0.45;
    const tx=Math.cos(angle*Math.PI/180)*dist, ty=Math.sin(angle*Math.PI/180)*dist;
    p.style.cssText=`left:${cx}px;top:${cy}px;--tx:${tx}px;--ty:${ty}px;animation-duration:${dur}s`;
    p.textContent=particles[Math.floor(Math.random()*particles.length)];
    document.body.appendChild(p); setTimeout(()=>p.remove(),dur*1000+100);
  }
}
 
function pulseVignette() {
  let v=document.getElementById("hit-vignette");
  if(!v){v=document.createElement("div");v.id="hit-vignette";document.getElementById("field-screen").appendChild(v);}
  v.classList.remove("vignette-pulse"); void v.offsetWidth;
  v.classList.add("vignette-pulse");
}
 
function updateFireBorder() {
  const field=document.getElementById("field-screen");
  if(fightModeActive && currentBorderPct>=BORDER_MIN-0.5) field.classList.add("fire-border");
  else field.classList.remove("fire-border");
}
 
async function handleVote() {
  const raw=document.getElementById("vote-team-input").value.trim().toUpperCase();
  document.getElementById("vote-error").textContent="";
  if(!VALID_TEAMS.includes(raw)){document.getElementById("vote-error").textContent=`"${raw}" isn't valid.`;return;}
  if(!liveDucks.find(d=>d.team===raw)){document.getElementById("vote-error").textContent="That team doesn't have a duck yet.";return;}
  if(voteTeams.includes(raw)){document.getElementById("vote-error").textContent="That team already voted.";return;}
  if(myVotedTeam){document.getElementById("vote-error").textContent="You already voted this round.";return;}
  myVotedTeam=raw; await castVote(raw);
  document.getElementById("vote-team-input").value="";
  document.getElementById("vote-btn").classList.add("voted");
}
function updateVoteUI() {
  document.getElementById("vote-count").textContent=`(${voteTeams.length})`;
  const wrap=document.getElementById("vote-list-wrap");
  wrap.innerHTML=voteTeams.length
    ?`<p class="vote-list-title">Voted:</p>`+voteTeams.map(t=>`<span class="vote-chip">${t}</span>`).join("")
    :"";
  if(myVotedTeam) document.getElementById("vote-btn").classList.add("voted");
  else document.getElementById("vote-btn").classList.remove("voted");
}
 
// ─────────────────────────────────────────────────────────
// RANK STRIP
// ─────────────────────────────────────────────────────────
function updateRankStrip() {
  const strip=document.getElementById("rank-strip");
  if(!strip||!fightModeActive) return;
  const rows=liveDucks.map(duck=>{
    const s=getStats(duck.team)||defaultStats();
    const fs=globalFightStats[duck.team]||{kills:0,damage:0};
    return {name:duck.name,team:duck.team,kills:fs.kills,damage:Math.round(fs.damage),health:Math.round(s.health),level:s.level};
  });
  if(!rows.length) return;
  const norm=(arr,key)=>{const mx=Math.max(...arr.map(r=>r[key]),1);return arr.map(r=>({...r,[key+"_n"]:r[key]/mx}));};
  let r=norm(rows,"kills");r=norm(r,"damage");r=norm(r,"health");r=norm(r,"level");
  r.forEach(row=>{row.score=row.kills_n*0.4+row.damage_n*0.35+row.health_n*0.15+row.level_n*0.1;});
  r.sort((a,b)=>b.score-a.score);
  const medals=["🥇","🥈","🥉"];
  strip.innerHTML=r.map((row,i)=>
    `<div class="rank-chip"><span class="rank-medal">${medals[i]||(i+1)}</span><span class="rank-name">${row.name}</span><span class="rank-score">${Math.round(row.score*100)}pts</span></div>`
  ).join("");
}
 
// ─────────────────────────────────────────────────────────
// LEADERBOARD MODAL
// ─────────────────────────────────────────────────────────
function openLbModal() {
  const title=document.getElementById("lb-modal-title"), body=document.getElementById("lb-modal-body");
  if(fightModeActive){title.textContent="⚔️ Fight rankings";body.innerHTML=buildFightLeaderboard();}
  else{title.textContent="📊 All-time leaderboard";body.innerHTML=buildFieldLeaderboard();}
  openModal("lb-modal");
}
 
function buildFightLeaderboard() {
  const rows=liveDucks.map(duck=>{
    const s=getStats(duck.team)||defaultStats(), fs=globalFightStats[duck.team]||{kills:0,damage:0};
    return {name:duck.name,team:duck.team,kills:fs.kills,damage:Math.round(fs.damage),health:Math.round(s.health),level:s.level};
  });
  if(!rows.length) return `<p style="font-size:12px;color:#666;text-align:center;">No ducks yet</p>`;
  const norm=(arr,key)=>{const mx=Math.max(...arr.map(r=>r[key]),1);return arr.map(r=>({...r,[key+"_n"]:r[key]/mx}));};
  let r=norm(rows,"kills");r=norm(r,"damage");r=norm(r,"health");r=norm(r,"level");
  r.forEach(row=>{row.score=row.kills_n*0.4+row.damage_n*0.35+row.health_n*0.15+row.level_n*0.1;});
  r.sort((a,b)=>b.score-a.score);
  const overallHTML=r.map((row,i)=>{
    const rl=i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`, rc=i===0?"":i===1?"silver":i===2?"bronze":"";
    return `<div class="lb-overall-row"><span class="lb-overall-rank ${rc}">${rl}</span><span class="lb-name">${row.name}</span><span class="lb-team-tag">${row.team}</span><div class="lb-overall-bar"><div class="lb-overall-fill" style="width:${Math.round(row.score*100)}%"></div></div></div>`;
  }).join("");
  const sects=[
    {title:"💀 Kills",key:"kills",fmt:r=>`${r.kills} KO`},
    {title:"💥 Damage",key:"damage",fmt:r=>`${r.damage}`},
    {title:"❤️ Most health",key:"health",fmt:r=>`${r.health} HP`},
    {title:"💔 Least health",key:"health",sort:"asc",fmt:r=>`${r.health} HP`},
    {title:"⭐ Level",key:"level",fmt:r=>`Lv${r.level}`},
  ];
  const sectHTML=sects.map(sec=>{
    const sorted=[...rows].sort((a,b)=>sec.sort==="asc"?a[sec.key]-b[sec.key]:b[sec.key]-a[sec.key]);
    return `<div class="lb-section"><p class="lb-section-title">${sec.title}</p>${sorted.slice(0,5).map((row,i)=>`<div class="lb-row"><span class="lb-rank">${i+1}</span><span class="lb-name">${row.name}</span><span class="lb-team-tag">${row.team}</span><span class="lb-val">${sec.fmt(row)}</span></div>`).join("")}</div>`;
  }).join("");
  return `<div class="lb-section"><p class="lb-section-title">🏆 Overall rank</p>${overallHTML}</div>${sectHTML}`;
}
 
function buildFieldLeaderboard() {
  const rows=liveDucks.map(duck=>{
    const s=getStats(duck.team)||defaultStats(), gt=globalTotals[duck.team]||{kills:0,damage:0};
    return {name:duck.name,team:duck.team,level:s.level,totalKills:gt.kills,totalDamage:gt.damage};
  });
  if(!rows.length) return `<p style="font-size:12px;color:#666;text-align:center;">No ducks yet</p>`;
  const sects=[
    {title:"⭐ Level",key:"level",fmt:r=>`Lv${r.level}`},
    {title:"💀 Total kills",key:"totalKills",fmt:r=>`${r.totalKills} KO`},
    {title:"💥 Total damage",key:"totalDamage",fmt:r=>`${r.totalDamage}`},
  ];
  return sects.map(sec=>{
    const sorted=[...rows].sort((a,b)=>b[sec.key]-a[sec.key]);
    return `<div class="lb-section"><p class="lb-section-title">${sec.title}</p>${sorted.slice(0,10).map((row,i)=>`<div class="lb-row"><span class="lb-rank">${i+1}</span><span class="lb-name">${row.name}</span><span class="lb-team-tag">${row.team}</span><span class="lb-val">${sec.fmt(row)}</span></div>`).join("")}</div>`;
  }).join("");
}
 
// ─────────────────────────────────────────────────────────
// DUCK POPUP
// ─────────────────────────────────────────────────────────
function openPopup(team) {
  const duck=liveDucks.find(d=>d.team===team); if(!duck) return;
  const s=getStats(team)||defaultStats();
  document.getElementById("popup-name").textContent   =duck.name;
  document.getElementById("popup-team").textContent   =`Team ${duck.team}`;
  document.getElementById("popup-level").textContent  =s.level;
  document.getElementById("popup-health").textContent =`${Math.round(s.health)} / ${s.maxHealth}`;
  document.getElementById("popup-damage").textContent =s.damage.toFixed(1);
  document.getElementById("popup-defense").textContent=`${s.defense.toFixed(1)} / ${MAX_DEFENSE}`;
  const img=document.getElementById("popup-profile-img"), nop=document.getElementById("popup-no-photo");
  if(duck.profileImageDataUrl){img.src=duck.profileImageDataUrl;img.style.display="block";nop.style.display="none";}
  else{img.style.display="none";nop.style.display="flex";}
  document.getElementById("duck-popup").style.display="flex";
}
function closePopupDirect(){document.getElementById("duck-popup").style.display="none";}