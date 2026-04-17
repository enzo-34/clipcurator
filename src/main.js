// ClipCurator - main.js

const { invoke } = window.__TAURI__.tauri;
const { listen } = window.__TAURI__.event;

let serverPort = null;
(async () => { serverPort = await invoke('get_server_port'); })();

// ============================================================
// Tabler Icons
// ============================================================

const SVG_ATTR = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';

const ICONS = {
  scissors:       `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 7a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M3 17a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M8.6 8.6l10.4 10.4"/><path d="M8.6 15.4l10.4 -10.4"/></svg>`,
  folderOpen:     `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 19l2.757 -7.351a1 1 0 0 1 .936 -.649h12.307a1 1 0 0 1 .986 1.164l-.996 5.211a2 2 0 0 1 -1.964 1.625h-14.026a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2h4l3 3h7a2 2 0 0 1 2 2v2"/></svg>`,
  playerPlay:     `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M7 4v16l13 -8l-13 -8"/></svg>`,
  playerPause:    `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -12"/><path d="M14 6a1 1 0 0 1 1 -1h2a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1l0 -12"/></svg>`,
  playerSkipBack: `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 5v14l-12 -7l12 -7"/><path d="M4 5l0 14"/></svg>`,
  playerSkipFwd:  `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 5v14l12 -7l-12 -7"/><path d="M20 5l0 14"/></svg>`,
  rewindBack5:    `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 18a6 6 0 1 0 0 -12h-11"/><path d="M7 9l-3 -3l3 -3"/><path d="M8 20h2a1 1 0 0 0 1 -1v-1a1 1 0 0 0 -1 -1h-2v-3h3"/></svg>`,
  rewindFwd5:     `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 18a6 6 0 1 1 0 -12h11"/><path d="M13 20h2a1 1 0 0 0 1 -1v-1a1 1 0 0 0 -1 -1h-2v-3h3"/><path d="M17 9l3 -3l-3 -3"/></svg>`,
  settings:       `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"/></svg>`,
  x:              `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg>`,
  refresh:        `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>`,
  sidebarCollapse:`<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12"/><path d="M9 4v16"/><path d="M15 10l-2 2l2 2"/></svg>`,
  sidebarExpand:  `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12"/><path d="M9 4v16"/><path d="M14 10l2 2l-2 2"/></svg>`,
  arrowBarRight:  `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 12l-10 0"/><path d="M14 12l-4 4"/><path d="M14 12l-4 -4"/><path d="M20 4l0 16"/></svg>`,
  arrowBarLeft:   `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12l10 0"/><path d="M10 12l4 4"/><path d="M10 12l4 -4"/><path d="M4 4l0 16"/></svg>`,
  circlePlus:     `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"/><path d="M9 12h6"/><path d="M12 9v6"/></svg>`,
  check:          `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l5 5l10 -10"/></svg>`,
  chevronRight:   `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6"/></svg>`,
  // Sun icon (light mode)
  sun:            `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/><path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-5.657 -12.757l.707 .707m9.9 -.707l-.707 .707m0 9.9l.707 .707m-9.9 -.707l-.707 .707"/></svg>`,
  // Moon icon (dark mode)
  moon:           `<svg ${SVG_ATTR}><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"/></svg>`,
};

function setIcon(id, key) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = ICONS[key] || '';
}

function initIcons() {
  setIcon('logo-icon',           'scissors');
  setIcon('gear-icon',           'settings');
  setIcon('sidebar-toggle-icon', 'sidebarCollapse');
  setIcon('hint-in-icon',        'arrowBarRight');
  setIcon('hint-out-icon',       'arrowBarLeft');
  setIcon('icon-prev',           'playerSkipBack');
  setIcon('icon-rew',            'rewindBack5');
  setIcon('icon-play',           'playerPlay');
  setIcon('icon-fwd',            'rewindFwd5');
  setIcon('icon-next',           'playerSkipFwd');
  setIcon('icon-in',             'arrowBarRight');
  setIcon('icon-out',            'arrowBarLeft');
  setIcon('icon-add',            'circlePlus');
  setIcon('icon-folder',         'folderOpen');
  setIcon('icon-cancel',         'x');
  setIcon('icon-process',        'playerPlay');
  setIcon('settings-title-icon', 'settings');
  setIcon('icon-settings-close', 'x');
  setIcon('icon-reset',          'refresh');
  setIcon('icon-adv-arrow',      'chevronRight');
  setIcon('icon-sun',            'sun');
  setIcon('icon-moon',           'moon');
}

initIcons();

// ============================================================
// Keybindings
// ============================================================

const DEFAULT_KEYS = {
  togglePlay: ' ', setIn: 'i', setOut: 'o',
  seekBack: 'ArrowLeft', seekFwd: 'ArrowRight',
  seekBack1: 'a', seekFwd1: 'd',
  addToQueue: 'Enter', nextClip: 'n', prevClip: 'p',
};

function keyDisplayName(k) {
  const map = {
    ' ': 'Space', 'ArrowLeft': '← Left', 'ArrowRight': '→ Right',
    'ArrowUp': '↑ Up', 'ArrowDown': '↓ Down', 'Enter': 'Enter',
    'Escape': 'Escape', 'Tab': 'Tab', 'Backspace': 'Backspace', 'Delete': 'Delete',
  };
  return map[k] || (k.length === 1 ? k.toUpperCase() : k);
}

function loadKeys() {
  try { const s = localStorage.getItem('cc_keys'); return s ? {...DEFAULT_KEYS,...JSON.parse(s)} : {...DEFAULT_KEYS}; }
  catch { return {...DEFAULT_KEYS}; }
}
function saveKeys(k) { localStorage.setItem('cc_keys', JSON.stringify(k)); }
let keybinds = loadKeys();

// ============================================================
// Color themes
// ============================================================

const DARK_COLORS = {
  '--bg': '#070709', '--surface': '#131416', '--surface-hi': '#1c1d20',
  '--accent': '#6b54d3', '--accent-hi': '#8a70f0',
  '--text': '#e6e6ea', '--muted': '#77778a',
};

const LIGHT_COLORS = {
  '--bg': '#f0f0f4', '--surface': '#ffffff', '--surface-hi': '#e8e8ee',
  '--accent': '#6b54d3', '--accent-hi': '#5240b0',
  '--text': '#18181c', '--muted': '#7070888',
};
// Correct muted for light — hex was typo above
LIGHT_COLORS['--muted'] = '#707088';

const DEFAULT_COLORS = DARK_COLORS;

function loadColors() {
  try { const s = localStorage.getItem('cc_colors'); return s ? {...DEFAULT_COLORS,...JSON.parse(s)} : {...DEFAULT_COLORS}; }
  catch { return {...DEFAULT_COLORS}; }
}
function saveColors(c) { localStorage.setItem('cc_colors', JSON.stringify(c)); }

function applyColors(colors) {
  const root = document.documentElement;
  for (const [v, val] of Object.entries(colors)) {
    root.style.setProperty(v, val);
    if (v === '--accent') {
      const r = parseInt(val.slice(1,3),16), g = parseInt(val.slice(3,5),16), b = parseInt(val.slice(5,7),16);
      root.style.setProperty('--accent-dim', `rgba(${r},${g},${b},0.18)`);
    }
  }
}

let currentColors = loadColors();
applyColors(currentColors);

// Detect if current colors look like light theme (bg is light)
function isLightTheme(colors) {
  const bg = colors['--bg'] || '#070709';
  const r = parseInt(bg.slice(1,3),16);
  return r > 128;
}

// ============================================================
// App state
// ============================================================

let clips        = [];
let currentIdx   = -1;
let inPoint      = null;
let outPoint     = null;
let isProcessing = false;
let queue        = { clipsFolder: '', outputFolder: '', jobs: [] };

// Folders set + per-folder labels map
const usedFolders = new Set();
// Map<folderName, Set<labelName>>
const folderLabels = new Map();

function addFolderLabel(folder, label) {
  usedFolders.add(folder);
  if (!folderLabels.has(folder)) folderLabels.set(folder, new Set());
  folderLabels.get(folder).add(label);
}

function getLabelsForFolder(folder) {
  return folder ? [...(folderLabels.get(folder) || [])].sort() : [];
}

// ============================================================
// DOM refs
// ============================================================

const video          = document.getElementById('video');
const videoArea      = document.getElementById('video-area');
const noClip         = document.getElementById('no-clip');
const seekIndicator  = document.getElementById('seek-indicator');
const clipList       = document.getElementById('clip-list');
const clipCount      = document.getElementById('clip-count');
const playBtn        = document.getElementById('play-btn');
const playIcon       = document.getElementById('icon-play');
const playLabel      = document.getElementById('play-label');
const timeCurrent    = document.getElementById('time-current');
const timeTotal      = document.getElementById('time-total');
const tlCursor       = document.getElementById('tl-cursor');
const tlRange        = document.getElementById('tl-range');
const timeline       = document.getElementById('timeline');
const tlInHandle     = document.getElementById('tl-in-handle');
const tlOutHandle    = document.getElementById('tl-out-handle');
const inVal          = document.getElementById('in-val');
const outVal         = document.getElementById('out-val');
const selDur         = document.getElementById('sel-dur');
const folderInput    = document.getElementById('folder-input');
const labelInput     = document.getElementById('label-input');
const queueBadge     = document.getElementById('queue-badge');
const folderInfo     = document.getElementById('folder-info');
const processBtn     = document.getElementById('process-btn');
const cancelBtn      = document.getElementById('cancel-btn');
const processInfo    = document.getElementById('process-info');
const progressWrap   = document.getElementById('progress-wrap');
const progressFill   = document.getElementById('progress-fill');
const speedToggle    = document.getElementById('speed-toggle');
const compressToggle = document.getElementById('compress-toggle');
const audioToggle    = document.getElementById('audio-toggle');
const sidebar        = document.getElementById('sidebar');
const sidebarToggle  = document.getElementById('sidebar-toggle');

// ============================================================
// Utilities
// ============================================================

function fmt(t) {
  if (t === null || t === undefined || isNaN(t)) return '--:--.--';
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1).padStart(4, '0');
  return `${m}:${s}`;
}
function basename(p) { return p.replace(/\\/g, '/').split('/').pop(); }
function shortId()   { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function videoUrl(p) { return `http://127.0.0.1:${serverPort}/file?path=${encodeURIComponent(p)}`; }

// ============================================================
// Sidebar collapse
// ============================================================

const sidebarToggleIcon = document.getElementById('sidebar-toggle-icon');
sidebarToggle.addEventListener('click', () => {
  const collapsed = sidebar.classList.toggle('collapsed');
  sidebarToggleIcon.innerHTML = ICONS[collapsed ? 'sidebarExpand' : 'sidebarCollapse'];
  sidebarToggle.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
});

// ============================================================
// Toggle controls
// ============================================================

speedToggle.addEventListener('change', () => {
  video.playbackRate = speedToggle.checked ? 2 : 1;
  document.getElementById('speed-toggle-row').classList.toggle('active', speedToggle.checked);
});

audioToggle.addEventListener('change', () => {
  compressToggle.disabled = audioToggle.checked;
  if (audioToggle.checked) compressToggle.checked = false;
  document.getElementById('audio-row').classList.toggle('active', audioToggle.checked);
  document.getElementById('compress-row').classList.toggle('active', compressToggle.checked);
});
compressToggle.addEventListener('change', () => {
  document.getElementById('compress-row').classList.toggle('active', compressToggle.checked);
});

// ============================================================
// Badge
// ============================================================

function updateBadge() {
  const pending = queue.jobs.filter(j => !j.done).length;
  if (pending > 0) {
    queueBadge.style.display = '';
    queueBadge.textContent   = `${pending} queued`;
    if (!isProcessing) processBtn.style.display = '';
  } else {
    queueBadge.style.display = 'none';
    processBtn.style.display = 'none';
  }
}

// ============================================================
// Custom dropdowns
//
// Behaviour:
//   - Focus: show ALL options immediately (regardless of current text),
//     select-all so typing replaces without manual erase.
//   - Input event: filter to what's typed.
//   - Value persists between clips; the field is NOT cleared on loadClip.
// ============================================================

function makeDropdown(inputEl, dropdownEl, getOptions) {
  let activeIndex = -1;
  let filterMode  = false; // true once user has typed something this focus session

  function render(filter) {
    const opts = getOptions();
    const lower = filter.toLowerCase();
    const filtered = (filterMode && filter) ? opts.filter(o => o.toLowerCase().includes(lower)) : opts;
    dropdownEl.innerHTML = '';

    if (filtered.length === 0) {
      if (filter) {
        const d = document.createElement('div');
        d.className   = 'dropdown-empty';
        d.textContent = `New: "${filter}"`;
        dropdownEl.appendChild(d);
      }
      activeIndex = -1;
      return;
    }

    filtered.forEach((opt, i) => {
      const item = document.createElement('div');
      item.className = 'dropdown-item' + (i === activeIndex ? ' selected' : '');
      item.textContent = opt;
      item.addEventListener('mousedown', e => { e.preventDefault(); inputEl.value = opt; close(); });
      dropdownEl.appendChild(item);
    });
    activeIndex = -1;
  }

  function open() {
    filterMode = false;       // show all on initial open
    render(inputEl.value);
    dropdownEl.classList.add('open');
    // Select all text so typing immediately replaces the current value
    requestAnimationFrame(() => inputEl.select());
  }

  function close() { dropdownEl.classList.remove('open'); activeIndex = -1; filterMode = false; }

  inputEl.addEventListener('focus', () => open());

  inputEl.addEventListener('input', () => {
    filterMode = true;        // switch to filter mode once they start typing
    render(inputEl.value);
  });

  inputEl.addEventListener('blur', () => setTimeout(close, 120));

  inputEl.addEventListener('keydown', e => {
    const items = dropdownEl.querySelectorAll('.dropdown-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      items.forEach((el, i) => el.classList.toggle('selected', i === activeIndex));
      items[activeIndex]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
      items.forEach((el, i) => el.classList.toggle('selected', i === activeIndex));
    } else if (e.key === 'Escape') {
      close();
    } else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) {
      e.stopPropagation();
      inputEl.value = items[activeIndex].textContent;
      close();
    }
  });
}

// Label dropdown options depend on the currently selected folder
makeDropdown(folderInput, document.getElementById('folder-dropdown'), () => [...usedFolders].sort());
makeDropdown(labelInput,  document.getElementById('label-dropdown'),  () => getLabelsForFolder(folderInput.value.trim()));

// ============================================================
// Clip list
// ============================================================

function renderClipList() {
  if (clips.length === 0) {
    clipList.innerHTML = '<div class="list-empty">No video files found</div>';
    clipCount.textContent = '';
    return;
  }
  clipCount.textContent = `(${clips.length})`;
  clipList.innerHTML = '';
  clips.forEach((path, i) => {
    const pendingJob = queue.jobs.find(j => j.source === path && !j.done);
    const doneJob    = !pendingJob && queue.jobs.find(j => j.source === path && j.done);
    const el         = document.createElement('div');
    el.className = 'clip-item' +
      (i === currentIdx ? ' active'    : '') +
      (pendingJob       ? ' queued'    : '') +
      (doneJob          ? ' done-item' : '');

    const name = document.createElement('div');
    name.className = 'clip-name'; name.textContent = basename(path);

    const status = document.createElement('div');
    status.className = 'clip-status icon icon-sm'; status.innerHTML = ICONS.check;

    el.appendChild(name); el.appendChild(status);
    el.addEventListener('click', () => loadClip(i));
    clipList.appendChild(el);
  });
  clipList.querySelector('.clip-item.active')?.scrollIntoView({ block: 'nearest' });
}

// ============================================================
// Video loading
// NOTE: We intentionally do NOT clear folderInput / labelInput here —
// the user wants to keep their current tags between clips and just
// pick from the full list when they click in.
// ============================================================

function loadClip(idx) {
  if (idx < 0 || idx >= clips.length) return;
  currentIdx = idx;
  inPoint = null; outPoint = null;
  updateTrimDisplay();
  noClip.style.display = 'none';
  video.src = videoUrl(clips[idx]);
  video.load();
  video.playbackRate = speedToggle.checked ? 2 : 1;
  video.play().catch(() => {});
  renderClipList();
}

// ============================================================
// Video events
// ============================================================

video.addEventListener('loadedmetadata', () => {
  timeTotal.textContent = fmt(video.duration);
  inPoint  = 0; outPoint = video.duration;
  updateTrimDisplay();
});

video.addEventListener('timeupdate', () => {
  const t = video.currentTime, d = video.duration || 0;
  timeCurrent.textContent = fmt(t);
  tlCursor.style.left = (d > 0 ? t/d*100 : 0) + '%';
  updateTimelineRange();
});

video.addEventListener('play',  () => { playIcon.innerHTML = ICONS.playerPause; playLabel.textContent = 'Pause'; });
video.addEventListener('pause', () => { playIcon.innerHTML = ICONS.playerPlay;  playLabel.textContent = 'Play'; });
video.addEventListener('ended', () => { playIcon.innerHTML = ICONS.playerPlay;  playLabel.textContent = 'Play'; });
video.addEventListener('error', e => console.warn('Video error', e));

// ============================================================
// Video click / double-click
// ============================================================

let clickTimer = null;

videoArea.addEventListener('click', () => {
  if (clickTimer !== null) return;
  clickTimer = setTimeout(() => { clickTimer = null; togglePlay(); }, 220);
});

videoArea.addEventListener('dblclick', e => {
  clearTimeout(clickTimer); clickTimer = null;
  const rect = videoArea.getBoundingClientRect();
  const isLeft = (e.clientX - rect.left) < rect.width / 2;
  if (isLeft) { seekBack(); flashSeek('left',  '-5s'); }
  else         { seekFwd();  flashSeek('right', '+5s'); }
});

let seekFlashTimer = null;
function flashSeek(side, label) {
  clearTimeout(seekFlashTimer);
  seekIndicator.innerHTML = side === 'left'
    ? `<span style="display:flex;align-items:center;gap:5px;">${ICONS.rewindBack5} ${label}</span>`
    : `<span style="display:flex;align-items:center;gap:5px;">${label} ${ICONS.rewindFwd5}</span>`;
  seekIndicator.style.left  = side === 'left'  ? '15%' : 'auto';
  seekIndicator.style.right = side === 'right' ? '15%' : 'auto';
  videoArea.classList.remove('flash-left', 'flash-right');
  void videoArea.offsetWidth;
  videoArea.classList.add(side === 'left' ? 'flash-left' : 'flash-right');
  seekIndicator.classList.add('visible');
  seekFlashTimer = setTimeout(() => {
    videoArea.classList.remove('flash-left', 'flash-right');
    seekIndicator.classList.remove('visible');
  }, 600);
}

// ============================================================
// Timeline — scrubbing + draggable trim handles
// ============================================================

function pctFromEvent(e) {
  const r = timeline.getBoundingClientRect();
  return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
}

function updateTimelineRange() {
  const d = video.duration;
  if (!d || isNaN(d)) {
    tlRange.style.left = '0%'; tlRange.style.width = '0%';
    tlInHandle.style.left = '0%'; tlOutHandle.style.left = '100%';
    return;
  }
  const inPct  = ((inPoint  ?? 0) / d) * 100;
  const outPct = ((outPoint ?? d) / d) * 100;
  tlRange.style.left  = inPct + '%';
  tlRange.style.width = (outPct - inPct) + '%';
  tlInHandle.style.left  = inPct  + '%';
  tlOutHandle.style.left = outPct + '%';
}

let dragState = null;
tlInHandle.addEventListener('mousedown',  e => { e.stopPropagation(); dragState = 'in';   tlInHandle.classList.add('dragging'); });
tlOutHandle.addEventListener('mousedown', e => { e.stopPropagation(); dragState = 'out';  tlOutHandle.classList.add('dragging'); });
timeline.addEventListener('mousedown', e => {
  if (e.target.closest('.tl-handle')) return;
  dragState = 'seek';
  if (video.duration) video.currentTime = pctFromEvent(e) * video.duration;
});

document.addEventListener('mousemove', e => {
  if (!dragState) return;
  const t = pctFromEvent(e) * (video.duration || 0);
  const d = video.duration || 0;
  if (dragState === 'in') {
    inPoint = Math.max(0, Math.min(t, (outPoint ?? d) - 0.1));
    updateTrimDisplay();
  } else if (dragState === 'out') {
    outPoint = Math.max((inPoint ?? 0) + 0.1, Math.min(t, d));
    updateTrimDisplay();
  } else if (dragState === 'seek' && d) {
    video.currentTime = Math.max(0, Math.min(t, d));
  }
});

document.addEventListener('mouseup', () => {
  tlInHandle.classList.remove('dragging');
  tlOutHandle.classList.remove('dragging');
  dragState = null;
});

// ============================================================
// Trim display
// ============================================================

function updateTrimDisplay() {
  inVal.textContent  = fmt(inPoint);
  outVal.textContent = fmt(outPoint);
  selDur.textContent = (inPoint !== null && outPoint !== null && outPoint > inPoint)
    ? `(${(outPoint - inPoint).toFixed(1)}s)` : '';
  updateTimelineRange();
}

// ============================================================
// Transport actions
// ============================================================

function togglePlay() { if (video.src) { video.paused ? video.play() : video.pause(); } }
function setIn()      { if (video.src) { inPoint  = video.currentTime; updateTrimDisplay(); } }
function setOut()     { if (video.src) { outPoint = video.currentTime; updateTrimDisplay(); } }
function seekBack()   { video.currentTime = Math.max(0, video.currentTime - 5); }
function seekFwd()    { video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); }
function seekBack1()  { video.currentTime = Math.max(0, video.currentTime - 1); }
function seekFwd1()   { video.currentTime = Math.min(video.duration || 0, video.currentTime + 1); }
function nextClip()   { loadClip(currentIdx + 1); }
function prevClip()   { loadClip(currentIdx - 1); }

const ACTIONS = { togglePlay, setIn, setOut, seekBack, seekFwd, seekBack1, seekFwd1, nextClip, prevClip, addToQueue: () => addToQueue() };

document.getElementById('play-btn').addEventListener('click', togglePlay);
document.getElementById('in-btn').addEventListener('click', setIn);
document.getElementById('out-btn').addEventListener('click', setOut);
document.getElementById('prev-btn').addEventListener('click', prevClip);
document.getElementById('next-btn').addEventListener('click', nextClip);
document.getElementById('rew-btn').addEventListener('click', seekBack);
document.getElementById('fwd-btn').addEventListener('click', seekFwd);

// ============================================================
// Keyboard shortcuts
// ============================================================

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' && !e.target.classList.contains('key-capture')) return;
  if (e.target.classList.contains('key-capture')) return;
  for (const [action, key] of Object.entries(keybinds)) {
    const match = key === ' ' ? e.key === ' ' : e.key.toLowerCase() === key.toLowerCase();
    if (match) {
      if ([' ','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault();
      ACTIONS[action]?.();
      return;
    }
  }
});

// ============================================================
// Add to queue
// ============================================================

document.getElementById('add-btn').addEventListener('click', addToQueue);

async function addToQueue() {
  if (currentIdx < 0 || !video.duration) return;
  const start = inPoint  ?? 0;
  const end   = outPoint ?? video.duration;
  if (end <= start) { alert('Out point must be after in point.'); return; }

  const destFolder = folderInput.value.trim() || 'Uncategorized';
  const label      = labelInput.value.trim()  || 'General';

  // Register the folder/label association
  addFolderLabel(destFolder, label);

  queue.jobs.push({
    id: shortId(), source: clips[currentIdx], start, end,
    destFolder, label, done: false,
    compress8mb: compressToggle.checked,
    audioOnly:   audioToggle.checked,
  });

  updateBadge();
  renderClipList();
  await saveQueue();

  const next = clips.findIndex((p, i) => i > currentIdx && !queue.jobs.find(j => j.source === p));
  if (next !== -1) loadClip(next);
  else if (currentIdx < clips.length - 1) loadClip(currentIdx + 1);
}

async function saveQueue() {
  try { await invoke('save_queue', { queue }); }
  catch (e) { console.error('save_queue failed:', e); }
}

// ============================================================
// Open folder
// ============================================================

document.getElementById('open-btn').addEventListener('click', openFolder);

async function openFolder() {
  const folder = await invoke('pick_folder');
  if (!folder) return;
  clips = await invoke('scan_folder', { folder });
  const name = folder.replace(/\\/g, '/').split('/').pop();
  folderInfo.textContent = `${clips.length} clip${clips.length !== 1 ? 's' : ''} - ${name}`;
  queue = { clipsFolder: folder, outputFolder: folder + '/ClipCurator Output', jobs: [] };
  const existing = await invoke('load_queue', { clipsFolder: folder });
  if (existing) {
    queue = existing;
    // Rebuild folder/label associations from the saved queue
    existing.jobs.forEach(j => addFolderLabel(j.destFolder, j.label));
  }
  renderClipList();
  updateBadge();
  if (clips.length > 0) loadClip(0);
}

// ============================================================
// Processing
// ============================================================

document.getElementById('process-btn').addEventListener('click', startProcessing);
document.getElementById('cancel-btn').addEventListener('click', cancelProcessing);

async function startProcessing() {
  if (isProcessing) return;
  isProcessing = true;
  processBtn.style.display   = 'none';
  cancelBtn.style.display    = '';
  processInfo.style.display  = '';
  progressWrap.style.display = '';

  const totalPending = queue.jobs.filter(j => !j.done).length;
  let doneCount = 0;
  processInfo.textContent  = `Processing 0 / ${totalPending}...`;
  progressFill.style.width = '0%';

  const unlisten = await listen('job-done', () => {
    doneCount++;
    progressFill.style.width = ((doneCount / totalPending) * 100) + '%';
    processInfo.textContent  = `Processing ${doneCount} / ${totalPending}...`;
    invoke('load_queue', { clipsFolder: queue.clipsFolder }).then(q => {
      if (q) { queue = q; renderClipList(); updateBadge(); }
    });
  });

  try {
    const msg = await invoke('process_queue', { queue });
    processInfo.textContent  = 'Done: ' + msg;
    progressFill.style.width = '100%';
  } catch (err) {
    processInfo.textContent = 'Error: ' + err;
  } finally {
    unlisten();
    isProcessing = false;
    cancelBtn.style.display = 'none'; cancelBtn.disabled = false;
    const final = await invoke('load_queue', { clipsFolder: queue.clipsFolder });
    if (final) queue = final;
    updateBadge(); renderClipList();
    setTimeout(() => { progressWrap.style.display = 'none'; processInfo.style.display = 'none'; }, 4000);
  }
}

async function cancelProcessing() {
  await invoke('cancel_processing');
  processInfo.textContent = 'Cancelling after current clip...';
  cancelBtn.disabled = true;
}

// ============================================================
// Settings panel
// ============================================================

const settingsOverlay = document.getElementById('settings-overlay');
const gearBtn         = document.getElementById('gear-btn');

function openSettings()  { settingsOverlay.classList.add('open'); gearBtn.classList.add('active'); populateSettings(); }
function closeSettings() { settingsOverlay.classList.remove('open'); gearBtn.classList.remove('active'); }

gearBtn.addEventListener('click', () => settingsOverlay.classList.contains('open') ? closeSettings() : openSettings());
document.getElementById('settings-close').addEventListener('click', closeSettings);
document.getElementById('settings-backdrop').addEventListener('click', closeSettings);
document.getElementById('reset-btn').addEventListener('click', resetAll);

// ── Advanced section toggle ──────────────────────────────────

const advancedToggle = document.getElementById('advanced-toggle');
const advancedBody   = document.getElementById('advanced-body');

advancedToggle.addEventListener('click', () => {
  const open = advancedToggle.classList.toggle('open');
  advancedBody.classList.toggle('open', open);
});

// ── Theme toggle ─────────────────────────────────────────────

const themeToggle = document.getElementById('theme-toggle');

// Init toggle to match current colors
themeToggle.checked = isLightTheme(currentColors);

themeToggle.addEventListener('change', () => {
  const preset = themeToggle.checked ? LIGHT_COLORS : DARK_COLORS;
  currentColors = { ...preset };
  applyColors(currentColors);
  saveColors(currentColors);
  // Update color inputs if panel is open
  populateSettings();
});

// ── Color inputs ─────────────────────────────────────────────

document.querySelectorAll('.color-hex-input').forEach(input => {
  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      input.classList.remove('invalid');
      currentColors[input.dataset.var] = val;
      applyColors(currentColors);
      saveColors(currentColors);
      // Sync theme toggle
      themeToggle.checked = isLightTheme(currentColors);
      const preview = input.closest('.color-row')?.querySelector('.color-preview');
      if (preview) preview.style.background = val;
    } else {
      input.classList.add('invalid');
    }
  });
});

// ── Key capture ───────────────────────────────────────────────

let listeningInput = null;
document.querySelectorAll('.key-capture').forEach(input => {
  input.addEventListener('focus', () => {
    listeningInput = input; input.classList.add('listening'); input.value = 'Press a key...';
  });
  input.addEventListener('blur', () => {
    input.classList.remove('listening');
    if (listeningInput === input) {
      listeningInput = null;
      input.value = keyDisplayName(keybinds[input.dataset.action] || '');
    }
  });
  input.addEventListener('keydown', e => {
    e.preventDefault(); e.stopPropagation();
    if (['Control','Alt','Shift','Meta'].includes(e.key)) return;
    keybinds[input.dataset.action] = e.key;
    saveKeys(keybinds);
    input.value = keyDisplayName(e.key);
    input.classList.remove('listening');
    input.blur();
    updateHints();
  });
});

function updateHints() {
  document.querySelectorAll('[data-action]').forEach(el => {
    if (keybinds[el.dataset.action]) el.textContent = keyDisplayName(keybinds[el.dataset.action]);
  });
}

function populateSettings() {
  document.querySelectorAll('.color-hex-input').forEach(input => {
    const val = currentColors[input.dataset.var] || DEFAULT_COLORS[input.dataset.var];
    input.value = val; input.classList.remove('invalid');
    const preview = input.closest('.color-row')?.querySelector('.color-preview');
    if (preview) preview.style.background = val;
  });
  document.querySelectorAll('.key-capture').forEach(input => {
    input.value = keyDisplayName(keybinds[input.dataset.action] || '');
  });
  themeToggle.checked = isLightTheme(currentColors);
  updateHints();
}

function resetAll() {
  if (!confirm('Reset all colors and key bindings to defaults?')) return;
  keybinds = {...DEFAULT_KEYS}; saveKeys(keybinds);
  currentColors = {...DEFAULT_COLORS}; saveColors(currentColors); applyColors(currentColors);
  populateSettings();
}

populateSettings();
