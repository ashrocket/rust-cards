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
  if (!deck.length || current >= deck.length) return;
  flipped = !flipped;
  cardWrap.classList.toggle('flipped', flipped);
}

function advance(dir) {
  if (!deck.length || current >= deck.length) return;
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
  deck = buildDeck();
  current = 0;
  showCard();
}

// Events
cardWrap.addEventListener('click', flipCard);

btnAgain.addEventListener('click',  () => advance('again'));
btnGotIt.addEventListener('click',  () => advance('got-it'));

document.getElementById('btn-shuffle').addEventListener('click', () => {
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
