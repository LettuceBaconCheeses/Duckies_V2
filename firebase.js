import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase, ref, push, set, onValue, get, update, remove, onDisconnect,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDS_5Bmq_KWziPgMF-K-51xm6VGtXZiY6g",
  authDomain: "duckies-7933d.firebaseapp.com",
  databaseURL: "https://duckies-7933d-default-rtdb.firebaseio.com",
  projectId: "duckies-7933d",
  storageBucket: "duckies-7933d.firebasestorage.app",
  messagingSenderId: "837423917888",
  appId: "1:837423917888:web:11675319dd978bb7b0e8a5",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── Division namespacing ─────────────────────────────────
// All refs are scoped under the chosen division key so
// elementary and middle school are completely separate.
let _div = "elementary"; // default; set by initDivision()

export function initDivision(division) {
  _div = division; // "elementary" or "middle"
}

function d(path) { return ref(db, `${_div}/${path}`); }

// ── Ducks ────────────────────────────────────────────────
export function onDucksChanged(cb) {
  onValue(d("ducks"), s => cb(s.val() ? Object.values(s.val()) : []));
}
export async function addDuckToDatabase(duck) {
  return await push(d("ducks"), duck);
}
export async function validateUniqueness(team, name) {
  const s = await get(d("ducks"));
  const existing = s.val() ? Object.values(s.val()) : [];
  const teamTaken = existing.find(d => d.team === team);
  if (teamTaken) return { teamError:`Team ${team} already has a duck (${teamTaken.name}) — one duck per team!`, nameError:null };
  const nameTaken = existing.find(d => d.name.toLowerCase() === name.toLowerCase());
  if (nameTaken) return { teamError:null, nameError:`A duck named "${nameTaken.name}" already exists!` };
  return { teamError:null, nameError:null };
}

// ── Positions ─────────────────────────────────────────────
export async function broadcastPosition(team, x, y, trans) {
  await set(ref(db, `${_div}/positions/${team}`), { x, y, t: Date.now(), trans: trans ?? null });
}
export function onPositionsChanged(cb) {
  onValue(d("positions"), s => cb(s.val() || {}));
}

// ── Stats ─────────────────────────────────────────────────
export async function broadcastStats(team, stats) {
  await set(ref(db, `${_div}/stats/${team}`), stats);
}
export function onStatsChanged(cb) {
  onValue(d("stats"), s => cb(s.val() || {}));
}

// ── Interactions ──────────────────────────────────────────
export async function broadcastInteraction(event) {
  const r = await push(d("interactions"), event);
  setTimeout(() => remove(r), 3000);
}
export function onInteractionsChanged(cb) {
  onValue(d("interactions"), s => cb(s.val() ? Object.values(s.val()) : []));
}

// ── Fight state ───────────────────────────────────────────
export async function setFightState(active, borderPct = 0) {
  await set(d("fightState"), { active, borderPct, updatedAt: Date.now() });
}
export async function updateBorderPct(pct) {
  await update(d("fightState"), { borderPct: pct });
}
export function onFightStateChanged(cb) {
  onValue(d("fightState"), s => cb(s.val() || { active:false, borderPct:0 }));
}

// ── Votes ─────────────────────────────────────────────────
export async function castVote(team) { await set(ref(db, `${_div}/fightVotes/${team}`), true); }
export async function clearVotes()   { await remove(d("fightVotes")); }
export function onVotesChanged(cb) {
  onValue(d("fightVotes"), s => cb(Object.keys(s.val() || {})));
}

// ── Winners ───────────────────────────────────────────────
export async function recordWinner(w) { await push(d("winners"), w); }
export function onWinnersChanged(cb) {
  onValue(d("winners"), s => cb(s.val() ? Object.values(s.val()) : []));
}

// ── Totals ────────────────────────────────────────────────
export async function addToTotals(team, kills, damage) {
  const snap = await get(ref(db, `${_div}/totals/${team}`));
  const cur = snap.val() || { kills:0, damage:0 };
  await set(ref(db, `${_div}/totals/${team}`), { kills: cur.kills+kills, damage: Math.round(cur.damage+damage) });
}
export function onTotalsChanged(cb) {
  onValue(d("totals"), s => cb(s.val() || {}));
}

// ── Fight stats ───────────────────────────────────────────
export async function broadcastFightStat(team, kills, damage) {
  await set(ref(db, `${_div}/fightStats/${team}`), { kills, damage: Math.round(damage) });
}
export async function clearFightStats() { await remove(d("fightStats")); }
export function onFightStatsChanged(cb) {
  onValue(d("fightStats"), s => cb(s.val() || {}));
}

// ── Presence / host election ──────────────────────────────
export function registerPresence(tabId) {
  const myRef = ref(db, `${_div}/presence/${tabId}`);
  const entry = { joinedAt: Date.now(), alive: true };
  set(myRef, entry);
  onDisconnect(myRef).remove();
  return myRef;
}

export async function updateHeartbeat(tabId) {
  const myRef = ref(db, `${_div}/presence/${tabId}`);
  await update(myRef, { alive: true, lastSeen: Date.now() });
}

export function onPresenceChanged(cb) {
  onValue(d("presence"), s => {
    const data = s.val() || {};
    const tabs = Object.entries(data)
      .map(([tabId, v]) => ({ tabId, joinedAt: v.joinedAt || 0, lastSeen: v.lastSeen || v.joinedAt || 0 }))
      .sort((a, b) => a.joinedAt - b.joinedAt);
    cb(tabs);
  });
}