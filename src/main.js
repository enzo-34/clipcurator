// ClipCurator - main.js

const { invoke } = window.__TAURI__.tauri;
const { listen } = window.__TAURI__.event;

let serverPort = null;
(async () => { serverPort = await invoke('get_server_port'); })();

// ---- State -----------------------------------------------------------------

let clips        = [];   
let currentIdx   = -1;
let inPoint      = null;
let outPoint     = null;
let isProcessing = false;
let currentSpeed = 1; // Estado da velocidade

let queue = { clipsFolder: '', outputFolder: '', jobs: [] };

const usedFolders = new Set();
const usedLabels  = new Set();

// ---- DOM refs --------------------------------------------------------------

const video        = document.getElementById('video');
const noClip       = document.getElementById('no-clip');
const clipList     = document.getElementById('clip-list');
const clipCount    = document.getElementById('clip-count');
const playBtn      = document.getElementById('play-btn');
const speedBtn     = document.getElementById('speed-btn'); // Novo Ref
const timeCurrent  = document.getElementById('time-current');
const timeTotal    = document.getElementById('time-total');
const tlCursor     = document.getElementById('tl-cursor');
const tlRange      = document.getElementById('tl-range');
const timeline     = document.getElementById('timeline');
const inVal        = document.getElementById('in-val');
const outVal       = document.getElementById('out-val');
const selDur       = document.getElementById('sel-dur');
const folderInput  = document.getElementById('folder-input');
const labelInput   = document.getElementById('label-input');
const queueBadge   = document.getElementById('queue-badge');
const folderInfo   = document.getElementById('folder-info');
const processBtn   = document.getElementById('process-btn');
const cancelBtn    = document.getElementById('cancel-btn');
const processInfo  = document.getElementById('process-info');
const progressWrap = document.getElementById('progress-wrap');
const progressFill = document.getElementById('progress-fill');

// Novos inputs de opção
const compressCheck = document.getElementById('compress-8mb');
const audioOnlyCheck = document.getElementById('extract-mp3');

// ---- Utilities -------------------------------------------------------------

function fmt(t) {
  if (t === null || t === undefined || isNaN(t)) return '--:--.--';
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1).padStart(4, '0');
  return `${m}:${s}`;
}

function basename(p) {
  return p.replace(/\\/g, '/').split('/').pop();
}

function shortId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function videoUrl(absolutePath) {
  return `http://127.0.0.1:${serverPort}/file?path=${encodeURIComponent(absolutePath)}`;
}

// ---- Badge / process button ------------------------------------------------

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

// ---- Datalist suggestions --------------------------------------------------

function refreshSuggestions() {
  document.getElementById('folder-datalist').innerHTML =
    [...usedFolders].map(v => `<option value="${v}">`).join('');
  document.getElementById('label-datalist').innerHTML =
    [...usedLabels].map(v => `<option value="${v}">`).join('');
}

// ---- Clip list rendering ---------------------------------------------------

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

    const el = document.createElement('div');
    el.className = 'clip-item' +
      (i === currentIdx ? ' active'    : '') +
      (pendingJob       ? ' queued'    : '') +
      (doneJob          ? ' done-item' : '');
    el.dataset.index = i;

    const name = document.createElement('div');
    name.className   = 'clip-name';
    name.textContent = basename(path);

    el.appendChild(name);
    el.addEventListener('click', () => loadClip(i));
    clipList.appendChild(el);
  });

  const active = clipList.querySelector('.clip-item.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
}

// ---- Video loading ---------------------------------------------------------

function loadClip(idx) {
  if (idx < 0 || idx >= clips.length) return;
  currentIdx = idx;

  inPoint  = null;
  outPoint = null;
  updateTrimDisplay();

  video.style.display = 'block';
  noClip.style.display = 'none';

  video.src = videoUrl(clips[idx]);
  video.load();
  
  // Mantém a velocidade selecionada ao trocar de clipe
  video.playbackRate = currentSpeed;
  
  video.play().catch(() => {});

  renderClipList();
}

// ---- Video events ----------------------------------------------------------

video.addEventListener('loadedmetadata', () => {
  timeTotal.textContent = fmt(video.duration);
  inPoint  = 0;
  outPoint = video.duration;
  updateTrimDisplay();
});

video.addEventListener('timeupdate', () => {
  const t = video.currentTime;
  const d = video.duration || 0;
  timeCurrent.textContent = fmt(t);
  const pct = d > 0 ? (t / d) * 100 : 0;
  tlCursor.style.left = pct + '%';
  updateTimelineRange();
});

video.addEventListener('play',  () => { playBtn.textContent = 'Pause'; });
video.addEventListener('pause', () => { playBtn.textContent = 'Play'; });
video.addEventListener('ended', () => { playBtn.textContent = 'Play'; });

video.addEventListener('error', (e) => {
  console.warn('Video playback error:', e);
});

// ---- Timeline --------------------------------------------------------------

function updateTimelineRange() {
  const d = video.duration;
  if (!d || isNaN(d)) { tlRange.style.left = '0%'; tlRange.style.width = '0%'; return; }
  const l = ((inPoint  ?? 0) / d) * 100;
  const r = ((outPoint ?? d) / d) * 100;
  tlRange.style.left  = l + '%';
  tlRange.style.width = (r - l) + '%';
}

function seekFromMouse(e) {
  const r   = timeline.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  if (video.duration) video.currentTime = pct * video.duration;
}

let scrubbing = false;
timeline.addEventListener('mousedown', e => { scrubbing = true; seekFromMouse(e); });
document.addEventListener('mousemove', e => { if (scrubbing) seekFromMouse(e); });
document.addEventListener('mouseup',   ()  => { scrubbing = false; });

// ---- Trim points -----------------------------------------------------------

function updateTrimDisplay() {
  inVal.textContent  = fmt(inPoint);
  outVal.textContent = fmt(outPoint);
  if (inPoint !== null && outPoint !== null && outPoint > inPoint) {
    selDur.textContent = `(${(outPoint - inPoint).toFixed(1)}s)`;
  } else {
    selDur.textContent = '';
  }
  updateTimelineRange();
}

// ---- Transport -------------------------------------------------------------

function togglePlay() {
  if (!video.src) return;
  video.paused ? video.play() : video.pause();
}

// Função de velocidade
function toggleSpeed() {
    currentSpeed = currentSpeed === 1 ? 2 : 1;
    video.playbackRate = currentSpeed;
    speedBtn.textContent = `Speed: ${currentSpeed}x`;
}

function setIn()  { if (video.src) { inPoint  = video.currentTime; updateTrimDisplay(); } }
function setOut() { if (video.src) { outPoint = video.currentTime; updateTrimDisplay(); } }

speedBtn.addEventListener('click', toggleSpeed);
document.getElementById('play-btn').addEventListener('click', togglePlay);
document.getElementById('in-btn').addEventListener('click', setIn);
document.getElementById('out-btn').addEventListener('click', setOut);
document.getElementById('prev-btn').addEventListener('click', () => loadClip(currentIdx - 1));
document.getElementById('next-btn').addEventListener('click', () => loadClip(currentIdx + 1));
document.getElementById('rew-btn').addEventListener('click', () => {
  video.currentTime = Math.max(0, video.currentTime - 5);
});
document.getElementById('fwd-btn').addEventListener('click', () => {
  video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
});

// ---- Add to queue ----------------------------------------------------------

document.getElementById('add-btn').addEventListener('click', addToQueue);

async function addToQueue() {
  if (currentIdx < 0 || !video.duration) return;

  const start = inPoint  ?? 0;
  const end   = outPoint ?? video.duration;

  if (end <= start) { alert('Out point must be after in point.'); return; }

  const destFolder = folderInput.value.trim() || 'Uncategorized';
  const label      = labelInput.value.trim()  || 'General';

  usedFolders.add(destFolder);
  usedLabels.add(label);
  refreshSuggestions();

  // Envia as novas flags para o Rust
  queue.jobs.push({ 
    id: shortId(), 
    source: clips[currentIdx], 
    start, 
    end, 
    destFolder, 
    label, 
    compress8mb: compressCheck.checked,
    onlyAudio: audioOnlyCheck.checked,
    done: false 
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

// ---- Open folder -----------------------------------------------------------

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
    existing.jobs.forEach(j => { usedFolders.add(j.destFolder); usedLabels.add(j.label); });
    refreshSuggestions();
  }

  renderClipList();
  updateBadge();
  if (clips.length > 0) loadClip(0);
}

// ---- Processing ------------------------------------------------------------

document.getElementById('process-btn').addEventListener('click', startProcessing);
document.getElementById('cancel-btn').addEventListener('click',  cancelProcessing);

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
    cancelBtn.style.display  = 'none';
    cancelBtn.disabled       = false;

    const final = await invoke('load_queue', { clipsFolder: queue.clipsFolder });
    if (final) { queue = final; }
    updateBadge();
    renderClipList();

    setTimeout(() => {
      progressWrap.style.display = 'none';
      processInfo.style.display  = 'none';
    }, 4000);
  }
}

async function cancelProcessing() {
  await invoke('cancel_processing');
  processInfo.textContent = 'Cancelling after current clip...';
  cancelBtn.disabled = true;
}

// ---- Keyboard shortcuts ----------------------------------------------------

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;

  switch (e.key) {
    case ' ':          e.preventDefault(); togglePlay(); break;
    case 'i': case 'I': setIn();  break;
    case 'o': case 'O': setOut(); break;
    case 's': case 'S': toggleSpeed(); break; // Atalho para velocidade
    case 'ArrowLeft':  e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); break;
    case 'ArrowRight': e.preventDefault(); video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); break;
    case 'a': case 'A': video.currentTime = Math.max(0, video.currentTime - 1); break;
    case 'd': case 'D': video.currentTime = Math.min(video.duration || 0, video.currentTime + 1); break;
    case 'Enter': addToQueue(); break;
    case 'n': case 'N': loadClip(currentIdx + 1); break;
    case 'p': case 'P': loadClip(currentIdx - 1); break;
    case '?': toggleShortcuts(); break;
  }
});

// ---- Shortcuts panel -------------------------------------------------------

const shortcutsPanel = document.getElementById('shortcuts-panel');
function toggleShortcuts() {
  shortcutsPanel.style.display =
    (shortcutsPanel.style.display === '' || shortcutsPanel.style.display === 'block') ? 'none' : '';
}
document.getElementById('help-btn').addEventListener('click', toggleShortcuts);
document.addEventListener('click', e => {
  if (!shortcutsPanel.contains(e.target) && e.target.id !== 'help-btn') {
    shortcutsPanel.style.display = 'none';
  }
});