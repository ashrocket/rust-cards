// ─── Haptic engine ─────────────────────────────────────────────────────────
const Haptic = {
  _v: (p) => { try { navigator.vibrate?.(p); } catch (_) {} },
  tap:     function() { this._v(8); },
  soft:    function() { this._v(5); },
  medium:  function() { this._v(16); },
  heavy:   function() { this._v(30); },
  select:  function() { this._v(6); },
  success: function() { this._v([10, 50, 15]); },
  error:   function() { this._v([35, 25, 35]); },
};

// ─── Motion / tilt engine ───────────────────────────────────────────────────
const Motion = (() => {
  const cbs = [];
  let _g = 0, _b = 0, _active = false;
  const handle = (e) => { _g = e.gamma || 0; _b = e.beta || 0; cbs.forEach(f => f(_g, _b)); };
  const start = async () => {
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      if (await DeviceOrientationEvent.requestPermission() !== 'granted') return false;
    }
    window.addEventListener('deviceorientation', handle, { passive: true });
    _active = true;
    return true;
  };
  return {
    onTilt: (fn) => cbs.push(fn),
    start,
    get gamma() { return _g; },
    get beta() { return _b; },
    get active() { return _active; },
    needsPermission: () => typeof DeviceOrientationEvent?.requestPermission === 'function',
    isMobile: () => 'ontouchstart' in window,
  };
})();

'use strict';

const LS_KEY = 'rustcards_got_it';

let deck = [];
let current = 0;
let flipped = false;
let touchStartX = 0;
let touchStartY = 0;
let filter = 'all';

const cardWrap    = document.getElementById('card-wrap');
const frontBody   = document.getElementById('front-body');
const backBody    = document.getElementById('back-body');
const categoryLbl = document.getElementById('category-label');
const counter     = document.getElementById('counter');
const progressBar = document.getElementById('progress-bar');
const btnAgain    = document.getElementById('btn-again');
const btnGotIt    = document.getElementById('btn-got-it');
const emptyState  = document.getElementById('empty-state');
const cardArea    = document.getElementById('card-area');
const toast       = document.getElementById('toast');

function gotItSet() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_KEY) || '[]')); }
  catch { return new Set(); }
}
function saveGotIt(set) {
  localStorage.setItem(LS_KEY, JSON.stringify([...set]));
}

function buildDeck() {
  const got = gotItSet();
  let source = CARDS;
  if (filter === 'learning') source = CARDS.filter(c => !got.has(c.id));
  if (filter === 'got-it')   source = CARDS.filter(c => got.has(c.id));
  return shuffle([...source]);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function showCard() {
  if (!deck.length || current >= deck.length) {
    emptyState.classList.add('visible');
    cardArea.style.display = 'none';
    document.getElementById('actions').style.visibility = 'hidden';
    updateCounter();
    return;
  }
  emptyState.classList.remove('visible');
  cardArea.style.display = '';
  document.getElementById('actions').style.visibility = '';

  const card = deck[current];
  const got = gotItSet();

  frontBody.textContent = card.front;
  backBody.textContent  = card.back;
  categoryLbl.textContent = card.category;

  cardWrap.classList.remove('flipped', 'swipe-left', 'swipe-right');
  flipped = false;

  btnAgain.disabled  = false;
  btnGotIt.disabled  = false;
  updateCounter();
}

function updateCounter() {
  const got = gotItSet();
  const total = CARDS.length;
  const done  = got.size;
  counter.textContent = `${deck.length ? current + 1 : deck.length} / ${deck.length} shown  •  ${done}/${total} mastered`;
  progressBar.style.width = `${(done / total) * 100}%`;
}

function flipCard() {
  Haptic.tap();
  if (!deck.length || current >= deck.length) return;
  flipped = !flipped;
  cardWrap.classList.toggle('flipped', flipped);
}

function advance(dir) {
  if (!deck.length || current >= deck.length) return;
  if (dir === 'got-it') { Haptic.success(); } else { Haptic.soft(); }
  btnAgain.disabled = btnGotIt.disabled = true;

  const got = gotItSet();
  if (dir === 'got-it') {
    got.add(deck[current].id);
    saveGotIt(got);
    showToast('Marked as got it!');
  } else {
    got.delete(deck[current].id);
    saveGotIt(got);
    showToast('Keep practicing');
  }

  cardWrap.classList.add(dir === 'got-it' ? 'swipe-right' : 'swipe-left');
  setTimeout(() => {
    current++;
    showCard();
    updateCounter();
  }, 380);
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
}

function setFilter(f) {
  filter = f;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.filter === f);
  });
  deck = buildDeck();
  current = 0;
  showCard();
}

function restart() {
  Haptic.medium();
  deck = buildDeck();
  current = 0;
  showCard();
}

// Events
cardWrap.addEventListener('click', flipCard);

btnAgain.addEventListener('click',  () => advance('again'));
btnGotIt.addEventListener('click',  () => advance('got-it'));

document.getElementById('btn-shuffle').addEventListener('click', () => {
  Haptic.select();
  deck = buildDeck();
  current = 0;
  showCard();
  showToast('Shuffled!');
});

document.getElementById('btn-reset').addEventListener('click', () => {
  if (!confirm('Reset all progress?')) return;
  localStorage.removeItem(LS_KEY);
  deck = buildDeck();
  current = 0;
  showCard();
  showToast('Progress reset');
});

document.querySelectorAll('.filter-btn').forEach(b => {
  b.addEventListener('click', () => setFilter(b.dataset.filter));
});

// Touch swipe
cardWrap.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

cardWrap.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx) * 1.5) return;
  if (!flipped) { flipCard(); return; }
  advance(dx > 0 ? 'got-it' : 'again');
}, { passive: true });

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// PWA install prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  document.getElementById('install-banner').classList.add('visible');
});
document.getElementById('btn-install').addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  document.getElementById('install-banner').classList.remove('visible');
});

// Boot
deck = buildDeck();
showCard();

// ─── Tilt-to-peek ──────────────────────────────────────────────────────────
// Lean phone top away from you (beta increases from upright ~90° baseline)
// to temporarily reveal the card answer without marking it.
let _betaBase = null;
let _peeking = false;

Motion.onTilt((_gamma, beta) => {
  if (_betaBase === null) { _betaBase = beta; return; }
  const dBeta = beta - _betaBase;
  // Tilt top forward ~18° = peek
  if (!flipped && dBeta > 18 && !_peeking) {
    _peeking = true;
    cardWrap.classList.add('flipped');
    Haptic.soft();
  } else if (dBeta <= 12 && _peeking) {
    _peeking = false;
    if (!flipped) cardWrap.classList.remove('flipped');
  }
});

// Motion permission button (iOS 13+ only)
function _addMotionBtn() {
  const btn = document.createElement('button');
  btn.textContent = '↺ tilt';
  btn.setAttribute('aria-label', 'Enable tilt controls');
  btn.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:9999;background:rgba(0,0,0,0.8);color:rgba(255,255,255,0.85);border:1px solid rgba(255,255,255,0.25);border-radius:20px;padding:7px 14px;font-size:11px;font-family:monospace;letter-spacing:.05em;cursor:pointer;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);';
  document.body.appendChild(btn);
  btn.addEventListener('click', async () => {
    if (await Motion.start()) btn.remove();
  });
}

if (Motion.isMobile()) {
  if (Motion.needsPermission()) {
    _addMotionBtn();
  } else {
    Motion.start();
  }
}
