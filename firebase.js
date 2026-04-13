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

const ducksRef       = ref(db, "ducks");
const statsRef       = ref(db, "stats");
const posRef         = ref(db, "positions");
const fightRef       = ref(db, "fightState");
const votesRef       = ref(db, "fightVotes");
const winnersRef     = ref(db, "winners");
const totalsRef      = ref(db, "totals");
const interactRef    = ref(db, "interactions");
const presenceRef    = ref(db, "presence");   // { [tabId]: { joinedAt, alive } }
const fightStatsRef  = ref(db, "fightStats"); // { [team]: { kills, damage } }

// ── Ducks ────────────────────────────────────────────────
export function onDucksChanged(cb) {
  onValue(ducksRef, s => cb(s.val() ? Object.values(s.val()) : []));
}
export async function addDuckToDatabase(duck) {
  return await push(ducksRef, duck);
}
export async function validateUniqueness(team, name) {
  const s = await get(ducksRef);
  const existing = s.val() ? Object.values(s.val()) : [];
  const teamTaken = existing.find(d => d.team === team);
  if (teamTaken) return { teamError:`Team ${team} already has a duck (${teamTaken.name}) — one duck per team!`, nameError:null };
  const nameTaken = existing.find(d => d.name.toLowerCase() === name.toLowerCase());
  if (nameTaken) return { teamError:null, nameError:`A duck named "${nameTaken.name}" already exists!` };
  return { teamError:null, nameError:null };
}

// ── Positions ─────────────────────────────────────────────
export async function broadcastPosition(team, x, y, trans) {
  await set(ref(db, `positions/${team}`), { x, y, t: Date.now(), trans: trans ?? null });
}
export function onPositionsChanged(cb) {
  onValue(posRef, s => cb(s.val() || {}));
}

// ── Stats ─────────────────────────────────────────────────
export async function broadcastStats(team, stats) {
  await set(ref(db, `stats/${team}`), stats);
}
export function onStatsChanged(cb) {
  onValue(statsRef, s => cb(s.val() || {}));
}

// ── Interactions ──────────────────────────────────────────
export async function broadcastInteraction(event) {
  const r = await push(interactRef, event);
  setTimeout(() => remove(r), 3000);
}
export function onInteractionsChanged(cb) {
  onValue(interactRef, s => cb(s.val() ? Object.values(s.val()) : []));
}

// ── Fight state ───────────────────────────────────────────
export async function setFightState(active, borderPct = 0) {
  await set(fightRef, { active, borderPct, updatedAt: Date.now() });
}
export async function updateBorderPct(pct) {
  await update(fightRef, { borderPct: pct });
}
export function onFightStateChanged(cb) {
  onValue(fightRef, s => cb(s.val() || { active:false, borderPct:0 }));
}

// ── Votes ─────────────────────────────────────────────────
export async function castVote(team) { await set(ref(db, `fightVotes/${team}`), true); }
export async function clearVotes()   { await remove(votesRef); }
export function onVotesChanged(cb) {
  onValue(votesRef, s => cb(Object.keys(s.val() || {})));
}

// ── Winners ───────────────────────────────────────────────
export async function recordWinner(w) { await push(winnersRef, w); }
export function onWinnersChanged(cb) {
  onValue(winnersRef, s => cb(s.val() ? Object.values(s.val()) : []));
}

// ── Totals ────────────────────────────────────────────────
export async function addToTotals(team, kills, damage) {
  const snap = await get(ref(db, `totals/${team}`));
  const cur = snap.val() || { kills:0, damage:0 };
  await set(ref(db, `totals/${team}`), { kills: cur.kills+kills, damage: Math.round(cur.damage+damage) });
}
export function onTotalsChanged(cb) {
  onValue(totalsRef, s => cb(s.val() || {}));
}

// ── Fight stats (per-fight kills & damage, synced across tabs) ────────────────
export async function broadcastFightStat(team, kills, damage) {
  await set(ref(db, `fightStats/${team}`), { kills, damage: Math.round(damage) });
}
export async function clearFightStats() { await remove(fightStatsRef); }
export function onFightStatsChanged(cb) {
  onValue(fightStatsRef, s => cb(s.val() || {}));
}

// ── Presence / host election ──────────────────────────────
// Each tab registers itself with a unique ID and a joinedAt timestamp.
// The tab with the LOWEST joinedAt that is still alive is the host.
// On disconnect, Firebase automatically removes the tab's presence entry.

export function registerPresence(tabId) {
  const myRef = ref(db, `presence/${tabId}`);
  const entry = { joinedAt: Date.now(), alive: true };
  set(myRef, entry);
  // Auto-remove on disconnect
  onDisconnect(myRef).remove();
  return myRef;
}

export async function updateHeartbeat(tabId) {
  const myRef = ref(db, `presence/${tabId}`);
  await update(myRef, { alive: true, lastSeen: Date.now() });
}

export function onPresenceChanged(cb) {
  onValue(presenceRef, s => {
    const data = s.val() || {};
    // Return array of { tabId, joinedAt } sorted oldest first
    const tabs = Object.entries(data)
      .map(([tabId, v]) => ({ tabId, joinedAt: v.joinedAt || 0, lastSeen: v.lastSeen || v.joinedAt || 0 }))
      .sort((a, b) => a.joinedAt - b.joinedAt);
    cb(tabs);
  });
}