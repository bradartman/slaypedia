// ── State ─────────────────────────────────────────────────────────────────
let currentTab = 'generator';
let generatorFilter = 'all';
let sentenceStyle = 'hype';
let history = [];

// ── Sentence templates ────────────────────────────────────────────────────
// Signature: (noun, verbBase, verbPast, adjective, exclamation)
const SENTENCE_TEMPLATES = {
  hype: [
    (n, v, vp, a, e) => `${e}! The ${n} just ${vp} and it's ${a}, no cap fr fr.`,
    (n, v, vp, a, e) => `${e} — she ${vp} with ${a} ${n} energy and absolutely ate.`,
    (n, v, vp, a, e) => `Not the ${n} being this ${a}. ${e}! She understood the assignment.`,
    (n, v, vp, a, e) => `The ${a} ${n} said "${e}" and then ${vp} — no crumbs left.`,
    (n, v, vp, a, e) => `${e}! Bestie, you ${vp} that ${n} with ${a} energy and left no crumbs.`,
  ],
  savage: [
    (n, v, vp, a, e) => `The ${n} is mid at best. ${e}? More like a red flag, fr.`,
    (n, v, vp, a, e) => `Imagine having zero ${n} and still trying to ${v}. ${e}.`,
    (n, v, vp, a, e) => `That ${a} ${n} thought they could ${v} but got ratioed instantly. ${e}.`,
    (n, v, vp, a, e) => `${e} — the ${n} really said "I ${v}" and thought that was ${a}. Big yikes.`,
    (n, v, vp, a, e) => `We're not the same. You think that ${n} is ${a}? Touch grass.`,
  ],
  wholesome: [
    (n, v, vp, a, e) => `The ${n} ${vp} today and it was so ${a}. ${e} — green flag behavior.`,
    (n, v, vp, a, e) => `${e}! A ${a} ${n} who ${v}s? That's bestie material, no cap.`,
    (n, v, vp, a, e) => `She ${vp} with ${a} ${n} energy and I'm sending you this as a love language. ${e}.`,
    (n, v, vp, a, e) => `The way the ${n} was so ${a} when he ${vp}. ${e} — valid behavior fr.`,
    (n, v, vp, a, e) => `${e}! Your ${n} era is ${a} and everyone can see you understood the assignment.`,
  ],
  confused: [
    (n, v, vp, a, e) => `Wait — the ${n} ${vp}? And it was ${a}?? ${e}. I'm shook.`,
    (n, v, vp, a, e) => `${e} — did the ${a} ${n} just ${v}? I need a vibe check immediately.`,
    (n, v, vp, a, e) => `Bruh. The ${n} is ${a} and it ${vp}?? ${e} — and I oop.`,
    (n, v, vp, a, e) => `The ${a} ${n} tried to ${v} and I'm lowkey confused. ${e}??`,
    (n, v, vp, a, e) => `${e}? No shot the ${n} ${vp} and came out ${a}. That's my Roman Empire now.`,
  ],
  dramatic: [
    (n, v, vp, a, e) => `The ${n} ${vp} and I will never recover. ${e} — living rent free forever.`,
    (n, v, vp, a, e) => `${e}! The ${a} ${n} ${vp} and I'm fully in my villain era now.`,
    (n, v, vp, a, e) => `I watched the ${n} ${v} in ${a} glory and honestly? I'm unwell. ${e}.`,
    (n, v, vp, a, e) => `The ${a} ${n} ${vp} and it hit different. ${e}. I am not okay.`,
    (n, v, vp, a, e) => `${e} — the ${n} was so ${a} when it ${vp}. Main character moment, full stop.`,
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────
function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getByType(type) {
  const pool = type === 'all' ? SLANG_DATA : SLANG_DATA.filter(w => w.type === type);
  return pool.length ? pool : SLANG_DATA;
}

function typeBadge(type) {
  const colors = {
    noun: 'badge-noun',
    verb: 'badge-verb',
    adjective: 'badge-adj',
    exclamation: 'badge-exc',
    phrase: 'badge-phrase',
  };
  return `<span class="badge ${colors[type] || 'badge-noun'}">${type}</span>`;
}

function addToHistory(entry) {
  history.unshift(entry);
  if (history.length > 6) history.pop();
  renderHistory();
}

function renderHistory() {
  const el = document.getElementById('history-list');
  if (!history.length) { el.innerHTML = '<p class="empty-state">Your generated words will appear here ✨</p>'; return; }
  el.innerHTML = history.map(e => `
    <div class="history-item" onclick="showHistoryDetail('${e.word.replace(/'/g, "\\'")}')">
      <span class="history-word">${e.word}</span>
      ${typeBadge(e.type)}
    </div>
  `).join('');
}

function showHistoryDetail(word) {
  const entry = SLANG_DATA.find(d => d.word === word);
  if (entry) displayResult(entry);
}

// ── Generator Tab ─────────────────────────────────────────────────────────
function generate() {
  const pool = getByType(generatorFilter);
  const entry = getRandom(pool);
  displayResult(entry);
  addToHistory(entry);
}

function displayResult(entry) {
  const card = document.getElementById('result-card');
  card.innerHTML = `
    <div class="result-word">${entry.word}</div>
    <div class="result-meta">
      ${typeBadge(entry.type)}
      ${entry.phonetic ? `<span class="phonetic">${entry.phonetic}</span>` : ''}
    </div>
    <div class="result-def">${entry.definition}</div>
    <div class="result-example">
      <span class="example-label">Usage ✦</span>
      <em>"${entry.example}"</em>
    </div>
  `;
  card.classList.remove('pop');
  void card.offsetWidth;
  card.classList.add('pop');
}

// ── Dictionary Tab ────────────────────────────────────────────────────────
function runSearch() {
  const query = document.getElementById('search-input').value.trim().toLowerCase();
  const container = document.getElementById('search-results');
  if (!query) { container.innerHTML = '<p class="empty-state">Start typing to search the dictionary 📖</p>'; return; }

  const directHits = new Set();
  const reverseHits = [];

  SLANG_DATA.forEach(e => {
    const inWord = e.word.toLowerCase().includes(query);
    const inDef  = e.definition.toLowerCase().includes(query);
    const inType = e.type.includes(query);
    if (inWord || inDef || inType) {
      directHits.add(e);
    } else {
      const matchedSynonym = (e.synonyms || []).find(s => s.toLowerCase().includes(query));
      if (matchedSynonym) reverseHits.push({ entry: e, matched: matchedSynonym });
    }
  });

  if (!directHits.size && !reverseHits.length) {
    container.innerHTML = `<p class="empty-state">No results for "<strong>${query}</strong>" — maybe that's a new one? 🤔</p>`;
    return;
  }

  const directHTML = [...directHits].map(e => `
    <div class="dict-entry">
      <div class="dict-header">
        <span class="dict-word">${e.word}</span>
        ${typeBadge(e.type)}
        ${e.phonetic ? `<span class="phonetic">${e.phonetic}</span>` : ''}
      </div>
      <p class="dict-def">${e.definition}</p>
      <p class="dict-example"><em>"${e.example}"</em></p>
    </div>
  `).join('');

  const reverseHTML = reverseHits.length ? `
    <div class="reverse-section">
      <p class="reverse-label">✦ GenZ ways to say "<strong>${query}</strong>"</p>
      ${reverseHits.map(({ entry: e, matched }) => `
        <div class="dict-entry reverse-entry">
          <div class="dict-header">
            <span class="dict-word">${e.word}</span>
            ${typeBadge(e.type)}
            ${e.phonetic ? `<span class="phonetic">${e.phonetic}</span>` : ''}
            <span class="reverse-match">≈ ${matched}</span>
          </div>
          <p class="dict-def">${e.definition}</p>
          <p class="dict-example"><em>"${e.example}"</em></p>
        </div>
      `).join('')}
    </div>
  ` : '';

  container.innerHTML = directHTML + reverseHTML;
}

// ── Sentence Builder Tab ──────────────────────────────────────────────────
function buildSentence() {
  // exclude multi-word nouns and acronyms so they don't land awkwardly as sentence subjects
  const nouns = SLANG_DATA.filter(e => e.type === 'noun' && !e.word.includes(' ') && e.word === e.word.toLowerCase());
  const verbs = SLANG_DATA.filter(e => e.type === 'verb');
  const adjs = SLANG_DATA.filter(e => e.type === 'adjective');
  const excs = SLANG_DATA.filter(e => e.type === 'exclamation');

  const n = getRandom(nouns);
  const v = getRandom(verbs);
  const a = getRandom(adjs);
  const e = getRandom(excs);

  const templates = SENTENCE_TEMPLATES[sentenceStyle] || SENTENCE_TEMPLATES.hype;
  const template = getRandom(templates);
  const sentence = template(n.word, v.word, v.past || v.word, a.word, e.word);

  const sentenceEl = document.getElementById('sentence-output');
  sentenceEl.textContent = sentence;
  sentenceEl.classList.remove('pop');
  void sentenceEl.offsetWidth;
  sentenceEl.classList.add('pop');

  document.getElementById('sentence-breakdown').innerHTML = `
    <p class="breakdown-label">Words used in this sentence:</p>
    <div class="breakdown-grid">
      <div class="breakdown-item">
        <span class="breakdown-word">${n.word}</span>${typeBadge(n.type)}
        <small>${n.definition}</small>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-word">${v.word}</span>${typeBadge(v.type)}
        <small>${v.definition}</small>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-word">${a.word}</span>${typeBadge(a.type)}
        <small>${a.definition}</small>
      </div>
      <div class="breakdown-item">
        <span class="breakdown-word">${e.word}</span>${typeBadge(e.type)}
        <small>${e.definition}</small>
      </div>
    </div>
  `;
}

// ── Navigation ────────────────────────────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
}

// ── Filter pills ──────────────────────────────────────────────────────────
function setFilter(type) {
  generatorFilter = type;
  document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.type === type));
}

function setSentenceStyle(style) {
  sentenceStyle = style;
  document.querySelectorAll('.style-pill').forEach(p => p.classList.toggle('active', p.dataset.style === style));
}

// ── Copy to clipboard ─────────────────────────────────────────────────────
function copyResult() {
  const word = document.querySelector('.result-word');
  const def = document.querySelector('.result-def');
  if (!word) return;
  navigator.clipboard.writeText(`${word.textContent}: ${def?.textContent || ''}`).then(() => {
    const btn = document.getElementById('copy-btn');
    btn.textContent = 'Copied! ✓';
    setTimeout(() => { btn.textContent = 'Copy 📋'; }, 1500);
  });
}

function copySentence() {
  const el = document.getElementById('sentence-output');
  if (!el.textContent || el.textContent.includes('hit')) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    const btn = document.getElementById('copy-sentence-btn');
    btn.textContent = 'Copied! ✓';
    setTimeout(() => { btn.textContent = 'Copy 📋'; }, 1500);
  });
}

// ── Count display ─────────────────────────────────────────────────────────
function updateCounts() {
  const types = ['noun', 'verb', 'adjective', 'exclamation', 'phrase'];
  types.forEach(t => {
    const el = document.getElementById(`count-${t}`);
    if (el) el.textContent = SLANG_DATA.filter(e => e.type === t).length;
  });
  const total = document.getElementById('count-total');
  if (total) total.textContent = SLANG_DATA.length;

  const updated = document.getElementById('last-updated');
  if (updated) {
    const d = new Date('2026-05-29');
    updated.textContent = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

// ── Init ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCounts();
  renderHistory();

  document.getElementById('search-input').addEventListener('input', runSearch);
  document.getElementById('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') runSearch();
  });
});
