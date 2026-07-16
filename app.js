/* ============================================================
   MAJSTER — samostatná appka pre inštalatéra
   Vanilla JS, žiadne závislosti. Dáta v IndexedDB (v prehliadači).
   ============================================================ */

/* ---------------- Icons (feather-style inline SVG) ---------------- */
const ICON_PATHS = {
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z"/>',
  clipboard: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1" ry="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="15" y2="16"/>',
  folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>',
  barchart: '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  home: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  truck: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  package: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  percent: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
  chevronLeft: '<polyline points="15 18 9 12 15 6"/>',
  camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  fileText: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  euro: '<path d="M17 4a8 8 0 1 0 0 16"/><line x1="3" y1="10" x2="14" y2="10"/><line x1="3" y1="14" x2="12" y2="14"/>',
};
function icon(name, size = 18) {
  const body = ICON_PATHS[name] || '';
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
}

/* ---------------- Constants ---------------- */
const STATUS_ORDER = ['dopyt', 'naplanovane', 'prebieha', 'hotovo', 'zaplatene'];
const STATUS_LABEL = {
  dopyt: 'Dopyt',
  naplanovane: 'Naplánované',
  prebieha: 'Prebieha',
  hotovo: 'Hotovo',
  zaplatene: 'Zaplatené',
};
const STATUS_VAR = {
  dopyt: '--grey',
  naplanovane: '--primary',
  prebieha: '--accent',
  hotovo: '--accent-light',
  zaplatene: '--success',
};

/* ---------------- Small utils ---------------- */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}
function money(n) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString('sk-SK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('sk-SK') + ' ' + d.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
}
function fmtDateShort(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('sk-SK');
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : str;
  return div.innerHTML;
}
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}
function showConfirm(title, text, onConfirm) {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal-sheet">
        <div class="modal-title">${escapeHtml(title)}</div>
        <div class="modal-text">${escapeHtml(text)}</div>
        <div class="modal-actions">
          <button class="btn btn-outline" id="modalCancel">Zrušiť</button>
          <button class="btn btn-primary" id="modalOk" style="background:var(--danger);">Vymazať</button>
        </div>
      </div>
    </div>`;
  document.getElementById('modalCancel').onclick = () => { root.innerHTML = ''; };
  document.getElementById('modalBackdrop').addEventListener('click', (e) => {
    if (e.target.id === 'modalBackdrop') root.innerHTML = '';
  });
  document.getElementById('modalOk').onclick = () => {
    root.innerHTML = '';
    onConfirm();
  };
}

/* ---------------- IndexedDB layer ---------------- */
const DB_NAME = 'majsterDB';
const DB_VERSION = 1;
let dbInstance = null;

function idbOpen() {
  return new Promise((resolve, reject) => {
    if (dbInstance) return resolve(dbInstance);
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('jobs')) db.createObjectStore('jobs', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('folders')) db.createObjectStore('folders', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('notes')) {
        const s = db.createObjectStore('notes', { keyPath: 'id' });
        s.createIndex('ownerId', 'ownerId', { unique: false });
      }
      if (!db.objectStoreNames.contains('photos')) {
        const s = db.createObjectStore('photos', { keyPath: 'id' });
        s.createIndex('ownerId', 'ownerId', { unique: false });
      }
    };
    req.onsuccess = (e) => { dbInstance = e.target.result; resolve(dbInstance); };
    req.onerror = (e) => reject(e.target.error);
  });
}
async function idbGetAll(store) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}
async function idbGetByOwner(store, ownerId) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const idx = tx.objectStore(store).index('ownerId');
    const req = idx.getAll(ownerId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e.target.error);
  });
}
async function idbPut(store, obj) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(obj);
    tx.oncomplete = () => resolve(obj);
    tx.onerror = (e) => reject(e.target.error);
  });
}
async function idbDelete(store, id) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = (e) => reject(e.target.error);
  });
}
async function idbGet(store, id) {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = (e) => reject(e.target.error);
  });
}

/* ---------------- Image compression ---------------- */
function fileToCompressedDataURL(file, maxDim = 1280, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => { img.src = reader.result; };
    reader.onerror = reject;
    img.onload = () => {
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
        else { width = Math.round(width * (maxDim / height)); height = maxDim; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------------- App state ---------------- */
const state = {
  view: 'calc',
  jobs: [],
  folders: [],
  currentJobId: null,
  currentFolderId: null,
  calcMaterials: [],
  settings: { hourlyRate: 15, kmRate: 0.30, vatPayer: false, vatRate: 20 },
};

/* ---------------- Financial calc ---------------- */
function computeJobTotals(job) {
  const hours = parseFloat(job.hours) || 0;
  const hourlyRate = parseFloat(job.hourlyRate) || 0;
  const km = parseFloat(job.km) || 0;
  const kmRate = parseFloat(job.kmRate) || 0;
  const materials = job.materials || [];
  const materialsRevenue = materials.reduce((s, m) => s + (parseFloat(m.price) || 0), 0);
  const materialsCost = materials.reduce((s, m) => s + (parseFloat(m.cost) || 0), 0);
  const laborRevenue = hours * hourlyRate;
  const travelRevenue = km * kmRate;
  const subtotal = laborRevenue + travelRevenue + materialsRevenue;
  const vatRate = parseFloat(job.vatRate) || 0;
  const vatAmount = job.vatPayer ? subtotal * (vatRate / 100) : 0;
  const total = subtotal + vatAmount;
  const profit = subtotal - materialsCost;
  const payments = job.payments || [];
  const paidTotal = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const remaining = total - paidTotal;
  return { laborRevenue, travelRevenue, materialsRevenue, materialsCost, subtotal, vatAmount, total, profit, paidTotal, remaining };
}

/* ---------------- Navigation ---------------- */
function setView(view) {
  state.view = view;
  document.querySelectorAll('.view').forEach((v) => v.classList.add('hidden'));
  document.getElementById('view-' + view).classList.remove('hidden');
  document.querySelectorAll('.nav-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.nav === view || (view === 'job-detail' && b.dataset.nav === 'jobs') || (view === 'folder-detail' && b.dataset.nav === 'folders'));
  });
  const headerBackViews = { 'job-detail': true, 'folder-detail': true };
  const header = document.getElementById('header');
  if (headerBackViews[view]) {
    header.querySelector('.header-icon').style.display = 'none';
  } else {
    header.querySelector('.header-icon').style.display = 'flex';
  }
  window.scrollTo(0, 0);
  const scroller = document.getElementById('view-' + view);
  if (scroller) scroller.scrollTop = 0;
}

/* ================================================================
   CALCULATOR VIEW
   ================================================================ */
function renderMaterialsEditor(containerId, materials, onChange) {
  const el = document.getElementById(containerId);
  if (materials.length === 0) {
    el.innerHTML = `<div class="empty-hint">Zatiaľ žiadny materiál. Pridaj položky (nákupná a predajná cena).</div>`;
    return;
  }
  el.innerHTML = materials.map((m) => `
    <div class="mat-row" data-id="${m.id}">
      <input type="text" placeholder="Názov položky" value="${escapeHtml(m.name)}" data-field="name" />
      <input type="number" inputmode="decimal" placeholder="Nákup €" value="${m.cost}" data-field="cost" />
      <input type="number" inputmode="decimal" placeholder="Predaj €" value="${m.price}" data-field="price" />
      <button class="icon-btn" data-remove="${m.id}">${icon('trash', 16)}</button>
    </div>
  `).join('');
  el.querySelectorAll('input').forEach((inp) => {
    inp.addEventListener('input', () => {
      const row = inp.closest('.mat-row');
      const id = row.dataset.id;
      const field = inp.dataset.field;
      const mat = materials.find((m) => m.id === id);
      mat[field] = inp.value;
      onChange();
    });
  });
  el.querySelectorAll('[data-remove]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.remove;
      const idx = materials.findIndex((m) => m.id === id);
      materials.splice(idx, 1);
      renderMaterialsEditor(containerId, materials, onChange);
      onChange();
    });
  });
}

function getCalcValues() {
  return {
    clientName: document.getElementById('calcClientName').value.trim(),
    phone: document.getElementById('calcPhone').value.trim(),
    address: document.getElementById('calcAddress').value.trim(),
    description: document.getElementById('calcDescription').value.trim(),
    hours: parseFloat(document.getElementById('calcHours').value) || 0,
    hourlyRate: parseFloat(document.getElementById('calcHourlyRate').value) || 0,
    km: parseFloat(document.getElementById('calcKm').value) || 0,
    kmRate: parseFloat(document.getElementById('calcKmRate').value) || 0,
    vatPayer: document.getElementById('calcVatToggle').classList.contains('on'),
    vatRate: parseFloat(document.getElementById('calcVatRate').value) || 0,
  };
}

function renderCalcSummary() {
  const v = getCalcValues();
  const job = { ...v, materials: state.calcMaterials };
  const t = computeJobTotals(job);
  const el = document.getElementById('calcSummary');
  el.innerHTML = `
    <div class="summary-row"><span>Práca</span><span class="val">${money(t.laborRevenue)}</span></div>
    <div class="summary-row"><span>Doprava</span><span class="val">${money(t.travelRevenue)}</span></div>
    <div class="summary-row"><span>Materiál (predaj)</span><span class="val">${money(t.materialsRevenue)}</span></div>
    ${v.vatPayer ? `<div class="summary-row"><span>DPH (${v.vatRate}%)</span><span class="val">${money(t.vatAmount)}</span></div>` : ''}
    <div class="divider-dashed"></div>
    <div class="total-row"><span class="total-label f-display">CELKOM</span><span class="total-value f-mono">${money(t.total)}</span></div>
  `;
}

function resetCalculator() {
  document.getElementById('calcClientName').value = '';
  document.getElementById('calcPhone').value = '';
  document.getElementById('calcAddress').value = '';
  document.getElementById('calcDescription').value = '';
  document.getElementById('calcHours').value = '';
  document.getElementById('calcKm').value = '';
  state.calcMaterials = [];
  renderMaterialsEditor('calcMaterialsList', state.calcMaterials, renderCalcSummary);
  renderCalcSummary();
}

async function saveCalculatorAsJob() {
  const v = getCalcValues();
  const job = {
    id: uid(),
    clientName: v.clientName || 'Bez mena',
    phone: v.phone,
    address: v.address,
    description: v.description,
    date: new Date().toISOString(),
    status: 'dopyt',
    hours: v.hours,
    hourlyRate: v.hourlyRate,
    km: v.km,
    kmRate: v.kmRate,
    materials: state.calcMaterials.map((m) => ({ ...m })),
    vatPayer: v.vatPayer,
    vatRate: v.vatRate,
    payments: [],
  };
  await idbPut('jobs', job);
  state.jobs.unshift(job);
  await idbPut('settings', { id: 'settings', hourlyRate: v.hourlyRate, kmRate: v.kmRate, vatPayer: v.vatPayer, vatRate: v.vatRate });
  showToast('Zákazka uložená');
  resetCalculator();
  renderJobsList();
  setView('jobs');
}

function initCalculatorView() {
  document.getElementById('calcAddMaterialBtn').addEventListener('click', () => {
    state.calcMaterials.push({ id: uid(), name: '', cost: '', price: '' });
    renderMaterialsEditor('calcMaterialsList', state.calcMaterials, renderCalcSummary);
    renderCalcSummary();
  });
  ['calcHours', 'calcHourlyRate', 'calcKm', 'calcKmRate', 'calcVatRate'].forEach((id) => {
    document.getElementById(id).addEventListener('input', renderCalcSummary);
  });
  document.getElementById('calcVatToggle').addEventListener('click', (e) => {
    const btn = e.currentTarget;
    btn.classList.toggle('on');
    document.getElementById('calcVatRate').style.display = btn.classList.contains('on') ? 'block' : 'none';
    renderCalcSummary();
  });
  document.getElementById('calcResetBtn').addEventListener('click', resetCalculator);
  document.getElementById('calcSaveBtn').addEventListener('click', saveCalculatorAsJob);
  renderMaterialsEditor('calcMaterialsList', state.calcMaterials, renderCalcSummary);
  renderCalcSummary();
}

/* ================================================================
   JOBS LIST + DETAIL
   ================================================================ */
function renderJobsList() {
  const el = document.getElementById('jobsList');
  if (state.jobs.length === 0) {
    el.innerHTML = `<div class="empty-state">Zatiaľ žiadne zákazky.<br/>Vytvor prvú v Kalkulačke.</div>`;
    return;
  }
  const sorted = [...state.jobs].sort((a, b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = sorted.map((j) => {
    const t = computeJobTotals(j);
    return `
    <div class="ticket" data-job="${j.id}">
      <div class="rivet left"></div><div class="rivet right"></div>
      <div class="ticket-head">
        <div class="ticket-client f-display">${escapeHtml(j.clientName)}</div>
        <div class="stamp f-display" style="color:var(${STATUS_VAR[j.status]}); border:2px solid var(${STATUS_VAR[j.status]});">${STATUS_LABEL[j.status]}</div>
      </div>
      <div class="ticket-body">
        ${j.address ? `<div>${icon('home', 13)} ${escapeHtml(j.address)}</div>` : ''}
        ${j.description ? `<div>${escapeHtml(j.description)}</div>` : ''}
        <div>${fmtDateShort(j.date)}</div>
      </div>
      <div class="ticket-foot">
        <div class="ticket-total f-mono">${money(t.total)}</div>
      </div>
      <div class="status-chips">
        ${STATUS_ORDER.map((s) => `<button class="chip ${s === j.status ? 'active' : ''}" data-status="${s}" data-job-chip="${j.id}" style="${s === j.status ? `background:var(${STATUS_VAR[s]});` : ''}">${STATUS_LABEL[s]}</button>`).join('')}
      </div>
    </div>`;
  }).join('');

  el.querySelectorAll('.ticket').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('[data-job-chip]')) return;
      openJobDetail(card.dataset.job);
    });
  });
  el.querySelectorAll('[data-job-chip]').forEach((chip) => {
    chip.addEventListener('click', async (e) => {
      e.stopPropagation();
      const jobId = chip.dataset.jobChip;
      const status = chip.dataset.status;
      const job = state.jobs.find((j) => j.id === jobId);
      job.status = status;
      await idbPut('jobs', job);
      renderJobsList();
    });
  });
}

async function openJobDetail(jobId) {
  state.currentJobId = jobId;
  setView('job-detail');
  await renderJobDetail();
}

async function renderJobDetail() {
  const job = state.jobs.find((j) => j.id === state.currentJobId);
  if (!job) { setView('jobs'); return; }
  const t = computeJobTotals(job);
  const photos = await idbGetByOwner('photos', job.id);
  const notes = await idbGetByOwner('notes', job.id);
  notes.sort((a, b) => new Date(b.date) - new Date(a.date));

  const el = document.getElementById('jobDetailContent');
  el.innerHTML = `
    <button class="header-back" id="jobBackBtn" style="color:var(--text-muted); margin-bottom:10px;">${icon('chevronLeft', 18)} Zákazky</button>

    <div class="card">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
        <div class="f-display" style="font-size:19px; font-weight:600;">${escapeHtml(job.clientName)}</div>
        <button class="icon-btn" id="jobDeleteBtn">${icon('trash', 18)}</button>
      </div>
      <div class="status-chips" style="border-top:none; padding-top:6px;">
        ${STATUS_ORDER.map((s) => `<button class="chip ${s === job.status ? 'active' : ''}" data-status="${s}" style="${s === job.status ? `background:var(${STATUS_VAR[s]});` : ''}">${STATUS_LABEL[s]}</button>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="field">
        <div class="field-label">${icon('home', 13)} Adresa</div>
        <input type="text" id="editAddress" value="${escapeHtml(job.address || '')}" />
      </div>
      <div class="field">
        <div class="field-label">Telefón</div>
        <input type="text" id="editPhone" value="${escapeHtml(job.phone || '')}" />
      </div>
      <div class="field" style="margin-bottom:0;">
        <div class="field-label">Popis práce</div>
        <textarea id="editDescription" rows="2">${escapeHtml(job.description || '')}</textarea>
      </div>
    </div>

    <div class="card">
      <div class="stat-label" style="margin-bottom:10px;">Účtovníctvo</div>
      <div class="row-2">
        <div class="field">
          <div class="field-label">${icon('clock', 13)} Hodiny</div>
          <input type="number" inputmode="decimal" id="editHours" value="${job.hours}" />
        </div>
        <div class="field"><div class="field-label">Sadzba €/h</div><input type="number" inputmode="decimal" id="editHourlyRate" value="${job.hourlyRate}" /></div>
        <div class="field"><div class="field-label">${icon('truck', 13)} Doprava (km)</div><input type="number" inputmode="decimal" id="editKm" value="${job.km}" /></div>
        <div class="field"><div class="field-label">Sadzba €/km</div><input type="number" inputmode="decimal" id="editKmRate" value="${job.kmRate}" /></div>
      </div>

      <div class="section-label" style="margin-top:4px;">
        <span>${icon('package', 13)} Materiál</span>
        <button class="btn btn-outline btn-sm" id="editAddMaterialBtn">+ Pridať</button>
      </div>
      <div id="editMaterialsList"></div>

      <div class="field" style="display:flex; align-items:center; justify-content:space-between; margin-top:10px;">
        <div class="field-label" style="margin-bottom:0;">${icon('percent', 13)} Platca DPH</div>
        <div style="display:flex; align-items:center; gap:8px;">
          <input type="number" inputmode="decimal" id="editVatRate" value="${job.vatRate}" style="width:60px; ${job.vatPayer ? '' : 'display:none;'}" />
          <button class="switch ${job.vatPayer ? 'on' : ''}" id="editVatToggle"><span class="switch-knob"></span></button>
        </div>
      </div>

      <div class="divider-dashed"></div>
      <div id="editSummary"></div>
    </div>

    <div class="card">
      <div class="stat-label" style="margin-bottom:8px;">${icon('euro', 13)} Platby</div>
      <div id="paymentsList"></div>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <input type="number" inputmode="decimal" id="newPaymentAmount" placeholder="Suma €" style="flex:1;" />
        <button class="btn btn-primary btn-sm" id="addPaymentBtn">Pridať platbu</button>
      </div>
    </div>

    <div class="section-label">
      <span>${icon('image', 13)} Fotky</span>
    </div>
    <div class="photo-grid" id="jobPhotoGrid"></div>

    <div class="section-label">
      <span>${icon('fileText', 13)} Poznámky</span>
    </div>
    <div class="card">
      <textarea id="newNoteText" rows="2" placeholder="Napíš poznámku k zákazke..."></textarea>
      <button class="btn btn-primary btn-sm" id="addNoteBtn" style="margin-top:8px;">Pridať poznámku</button>
      <div id="jobNotesList" style="margin-top:6px;"></div>
    </div>
  `;

  // photos
  renderPhotoGrid('jobPhotoGrid', photos, job.id, 'job', async () => { await renderJobDetail(); });

  // notes
  document.getElementById('jobNotesList').innerHTML = notes.length
    ? notes.map((n) => `<div class="note-item"><div class="note-date">${fmtDate(n.date)}</div><div class="note-text">${escapeHtml(n.text)}</div></div>`).join('')
    : `<div class="empty-hint" style="margin-top:8px;">Zatiaľ žiadne poznámky.</div>`;

  // payments
  const paymentsListEl = document.getElementById('paymentsList');
  paymentsListEl.innerHTML = (job.payments && job.payments.length)
    ? job.payments.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((p) => `<div class="payment-item"><span>${fmtDateShort(p.date)}</span><span class="f-mono">${money(parseFloat(p.amount) || 0)}</span></div>`).join('')
    : `<div class="empty-hint">Žiadne platby zatiaľ neboli prijaté.</div>`;
  paymentsListEl.insertAdjacentHTML('beforeend', `
    <div class="summary-row" style="margin-top:8px;"><span>Zaplatené</span><span class="val">${money(t.paidTotal)}</span></div>
    <div class="summary-row"><span>Zostáva doplatiť</span><span class="val" style="color:${t.remaining > 0.004 ? 'var(--danger)' : 'var(--success)'};">${money(t.remaining)}</span></div>
  `);

  // materials editor for accounting
  renderMaterialsEditor('editMaterialsList', job.materials, () => refreshEditSummary(job));
  refreshEditSummary(job);

  // events: back
  document.getElementById('jobBackBtn').addEventListener('click', () => { renderJobsList(); setView('jobs'); });

  // events: delete job
  document.getElementById('jobDeleteBtn').addEventListener('click', () => {
    showConfirm('Vymazať zákazku?', `Zákazka pre "${job.clientName}" a všetky jej fotky a poznámky budú natrvalo vymazané.`, async () => {
      await idbDelete('jobs', job.id);
      const photosToDelete = await idbGetByOwner('photos', job.id);
      for (const p of photosToDelete) await idbDelete('photos', p.id);
      const notesToDelete = await idbGetByOwner('notes', job.id);
      for (const n of notesToDelete) await idbDelete('notes', n.id);
      state.jobs = state.jobs.filter((j) => j.id !== job.id);
      renderJobsList();
      setView('jobs');
      showToast('Zákazka vymazaná');
    });
  });

  // events: status chips
  el.querySelectorAll('[data-status]').forEach((chip) => {
    chip.addEventListener('click', async () => {
      job.status = chip.dataset.status;
      await idbPut('jobs', job);
      await renderJobDetail();
    });
  });

  // events: field edits -> persist on blur/input (debounced-ish via direct save)
  const fieldMap = {
    editAddress: 'address', editPhone: 'phone', editDescription: 'description',
  };
  Object.keys(fieldMap).forEach((elId) => {
    document.getElementById(elId).addEventListener('change', async (e) => {
      job[fieldMap[elId]] = e.target.value;
      await idbPut('jobs', job);
    });
  });
  ['editHours', 'editHourlyRate', 'editKm', 'editKmRate', 'editVatRate'].forEach((elId) => {
    document.getElementById(elId).addEventListener('input', () => refreshEditSummary(job));
    document.getElementById(elId).addEventListener('change', async (e) => {
      const map = { editHours: 'hours', editHourlyRate: 'hourlyRate', editKm: 'km', editKmRate: 'kmRate', editVatRate: 'vatRate' };
      job[map[elId]] = parseFloat(e.target.value) || 0;
      await idbPut('jobs', job);
    });
  });
  document.getElementById('editVatToggle').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.classList.toggle('on');
    job.vatPayer = btn.classList.contains('on');
    document.getElementById('editVatRate').style.display = job.vatPayer ? 'block' : 'none';
    refreshEditSummary(job);
    await idbPut('jobs', job);
  });
  document.getElementById('editAddMaterialBtn').addEventListener('click', async () => {
    job.materials.push({ id: uid(), name: '', cost: '', price: '' });
    renderMaterialsEditor('editMaterialsList', job.materials, () => refreshEditSummary(job));
    refreshEditSummary(job);
    await idbPut('jobs', job);
  });

  // events: add payment
  document.getElementById('addPaymentBtn').addEventListener('click', async () => {
    const input = document.getElementById('newPaymentAmount');
    const amount = parseFloat(input.value);
    if (!amount || amount <= 0) { showToast('Zadaj sumu platby'); return; }
    job.payments = job.payments || [];
    job.payments.push({ id: uid(), date: new Date().toISOString(), amount });
    await idbPut('jobs', job);
    input.value = '';
    await renderJobDetail();
    showToast('Platba pridaná');
  });

  // events: add note
  document.getElementById('addNoteBtn').addEventListener('click', async () => {
    const ta = document.getElementById('newNoteText');
    const text = ta.value.trim();
    if (!text) return;
    await idbPut('notes', { id: uid(), ownerType: 'job', ownerId: job.id, text, date: new Date().toISOString() });
    ta.value = '';
    await renderJobDetail();
  });
}

function refreshEditSummary(job) {
  // re-read material edit values already synced live via inputs into job.materials objects
  const hours = parseFloat(document.getElementById('editHours').value) || 0;
  const hourlyRate = parseFloat(document.getElementById('editHourlyRate').value) || 0;
  const km = parseFloat(document.getElementById('editKm').value) || 0;
  const kmRate = parseFloat(document.getElementById('editKmRate').value) || 0;
  const vatPayer = document.getElementById('editVatToggle').classList.contains('on');
  const vatRate = parseFloat(document.getElementById('editVatRate').value) || 0;
  const tempJob = { hours, hourlyRate, km, kmRate, vatPayer, vatRate, materials: job.materials, payments: job.payments };
  const t = computeJobTotals(tempJob);
  const el = document.getElementById('editSummary');
  el.innerHTML = `
    <div class="summary-row"><span>Práca</span><span class="val">${money(t.laborRevenue)}</span></div>
    <div class="summary-row"><span>Doprava</span><span class="val">${money(t.travelRevenue)}</span></div>
    <div class="summary-row"><span>Materiál (predaj)</span><span class="val">${money(t.materialsRevenue)}</span></div>
    <div class="summary-row"><span>Materiál (nákup)</span><span class="val">${money(t.materialsCost)}</span></div>
    ${vatPayer ? `<div class="summary-row"><span>DPH (${vatRate}%)</span><span class="val">${money(t.vatAmount)}</span></div>` : ''}
    <div class="divider-dashed"></div>
    <div class="summary-row"><span>Zisk (bez DPH)</span><span class="val" style="color:var(--success);">${money(t.profit)}</span></div>
    <div class="total-row" style="margin-top:6px;"><span class="total-label f-display">CELKOM (faktúra)</span><span class="total-value f-mono">${money(t.total)}</span></div>
  `;
}

/* ================================================================
   PHOTO GRID (shared by job detail + folder detail)
   ================================================================ */
function renderPhotoGrid(containerId, photos, ownerId, ownerType, onChange) {
  const el = document.getElementById(containerId);
  const sorted = [...photos].sort((a, b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = sorted.map((p) => `
    <div class="photo-thumb" data-photo="${p.id}">
      <img src="${p.dataUrl}" alt="foto" />
      <button class="photo-del" data-photo-del="${p.id}">${icon('x', 12)}</button>
    </div>
  `).join('') + `<div class="photo-add-tile" id="${containerId}-add">${icon('camera', 22)}</div>`;

  el.querySelector(`#${containerId}-add`).addEventListener('click', () => {
    const input = document.getElementById('photoInput');
    input.onchange = async () => {
      const files = Array.from(input.files || []);
      for (const file of files) {
        try {
          const dataUrl = await fileToCompressedDataURL(file);
          await idbPut('photos', { id: uid(), ownerType, ownerId, dataUrl, date: new Date().toISOString() });
        } catch (err) { /* skip file on error */ }
      }
      input.value = '';
      onChange();
    };
    input.click();
  });

  el.querySelectorAll('[data-photo-del]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await idbDelete('photos', btn.dataset.photoDel);
      onChange();
    });
  });
}

/* ================================================================
   FOLDERS LIST + DETAIL
   ================================================================ */
function renderFoldersList() {
  const el = document.getElementById('foldersList');
  if (state.folders.length === 0) {
    el.innerHTML = `<div class="empty-state">Zatiaľ žiadne priečinky.<br/>Vytvor prvý pre fotky a poznámky.</div>`;
    return;
  }
  const sorted = [...state.folders].sort((a, b) => new Date(b.date) - new Date(a.date));
  el.innerHTML = sorted.map((f) => `
    <div class="folder-card" data-folder="${f.id}">
      <div class="folder-icon-wrap">${icon('folder', 20)}</div>
      <div style="flex:1;">
        <div class="folder-name">${escapeHtml(f.name)}</div>
        <div class="folder-meta">${f.description ? escapeHtml(f.description) : fmtDateShort(f.date)}</div>
      </div>
    </div>
  `).join('');
  el.querySelectorAll('.folder-card').forEach((card) => {
    card.addEventListener('click', () => openFolderDetail(card.dataset.folder));
  });
}

function promptCreateFolder() {
  const root = document.getElementById('modalRoot');
  root.innerHTML = `
    <div class="modal-backdrop" id="modalBackdrop">
      <div class="modal-sheet">
        <div class="modal-title">Nový priečinok</div>
        <div class="field"><input type="text" id="newFolderName" placeholder="Názov priečinka" /></div>
        <div class="field" style="margin-bottom:12px;"><input type="text" id="newFolderDesc" placeholder="Popis (nepovinné)" /></div>
        <div class="modal-actions">
          <button class="btn btn-outline" id="modalCancel">Zrušiť</button>
          <button class="btn btn-primary" id="modalCreate">Vytvoriť</button>
        </div>
      </div>
    </div>`;
  document.getElementById('modalCancel').onclick = () => { root.innerHTML = ''; };
  document.getElementById('modalBackdrop').addEventListener('click', (e) => { if (e.target.id === 'modalBackdrop') root.innerHTML = ''; });
  document.getElementById('modalCreate').onclick = async () => {
    const name = document.getElementById('newFolderName').value.trim();
    if (!name) { showToast('Zadaj názov priečinka'); return; }
    const desc = document.getElementById('newFolderDesc').value.trim();
    const folder = { id: uid(), name, description: desc, date: new Date().toISOString() };
    await idbPut('folders', folder);
    state.folders.unshift(folder);
    root.innerHTML = '';
    renderFoldersList();
    openFolderDetail(folder.id);
  };
}

async function openFolderDetail(folderId) {
  state.currentFolderId = folderId;
  setView('folder-detail');
  await renderFolderDetail();
}

async function renderFolderDetail() {
  const folder = state.folders.find((f) => f.id === state.currentFolderId);
  if (!folder) { setView('folders'); return; }
  const photos = await idbGetByOwner('photos', folder.id);
  const notes = await idbGetByOwner('notes', folder.id);
  notes.sort((a, b) => new Date(b.date) - new Date(a.date));

  const el = document.getElementById('folderDetailContent');
  el.innerHTML = `
    <button class="header-back" id="folderBackBtn" style="color:var(--text-muted); margin-bottom:10px;">${icon('chevronLeft', 18)} Priečinky</button>
    <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <div class="f-display" style="font-size:19px; font-weight:600;">${escapeHtml(folder.name)}</div>
        ${folder.description ? `<div class="folder-meta">${escapeHtml(folder.description)}</div>` : ''}
      </div>
      <button class="icon-btn" id="folderDeleteBtn">${icon('trash', 18)}</button>
    </div>

    <div class="section-label"><span>${icon('image', 13)} Fotky</span></div>
    <div class="photo-grid" id="folderPhotoGrid"></div>

    <div class="section-label"><span>${icon('fileText', 13)} Poznámky</span></div>
    <div class="card">
      <textarea id="newFolderNoteText" rows="2" placeholder="Napíš poznámku..."></textarea>
      <button class="btn btn-primary btn-sm" id="addFolderNoteBtn" style="margin-top:8px;">Pridať poznámku</button>
      <div id="folderNotesList" style="margin-top:6px;"></div>
    </div>
  `;

  renderPhotoGrid('folderPhotoGrid', photos, folder.id, 'folder', async () => { await renderFolderDetail(); });

  document.getElementById('folderNotesList').innerHTML = notes.length
    ? notes.map((n) => `<div class="note-item"><div class="note-date">${fmtDate(n.date)}</div><div class="note-text">${escapeHtml(n.text)}</div></div>`).join('')
    : `<div class="empty-hint" style="margin-top:8px;">Zatiaľ žiadne poznámky.</div>`;

  document.getElementById('folderBackBtn').addEventListener('click', () => { renderFoldersList(); setView('folders'); });

  document.getElementById('folderDeleteBtn').addEventListener('click', () => {
    showConfirm('Vymazať priečinok?', `Priečinok "${folder.name}" a všetky jeho fotky a poznámky budú natrvalo vymazané.`, async () => {
      await idbDelete('folders', folder.id);
      const photosToDelete = await idbGetByOwner('photos', folder.id);
      for (const p of photosToDelete) await idbDelete('photos', p.id);
      const notesToDelete = await idbGetByOwner('notes', folder.id);
      for (const n of notesToDelete) await idbDelete('notes', n.id);
      state.folders = state.folders.filter((f) => f.id !== folder.id);
      renderFoldersList();
      setView('folders');
      showToast('Priečinok vymazaný');
    });
  });

  document.getElementById('addFolderNoteBtn').addEventListener('click', async () => {
    const ta = document.getElementById('newFolderNoteText');
    const text = ta.value.trim();
    if (!text) return;
    await idbPut('notes', { id: uid(), ownerType: 'folder', ownerId: folder.id, text, date: new Date().toISOString() });
    ta.value = '';
    await renderFolderDetail();
  });
}

/* ================================================================
   OVERVIEW
   ================================================================ */
function renderOverview() {
  const now = new Date();
  const thisMonthPaid = state.jobs.reduce((sum, j) => {
    const payments = j.payments || [];
    const monthSum = payments.filter((p) => {
      const d = new Date(p.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    return sum + monthSum;
  }, 0);

  const awaitingPayment = state.jobs.reduce((sum, j) => {
    const t = computeJobTotals(j);
    return sum + (t.remaining > 0.004 ? t.remaining : 0);
  }, 0);

  const activeCount = state.jobs.filter((j) => ['dopyt', 'naplanovane', 'prebieha'].includes(j.status)).length;

  document.getElementById('statMonth').textContent = money(thisMonthPaid);
  document.getElementById('statAwaiting').textContent = money(awaitingPayment);
  document.getElementById('statActive').textContent = String(activeCount);

  // last 6 months income (based on payment dates)
  const monthData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleDateString('sk-SK', { month: 'short' });
    let income = 0;
    state.jobs.forEach((j) => {
      (j.payments || []).forEach((p) => {
        const pd = new Date(p.date);
        if (pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth()) {
          income += parseFloat(p.amount) || 0;
        }
      });
    });
    monthData.push({ label, income });
  }
  drawChart(monthData);
}

function drawChart(data) {
  const svg = document.getElementById('chartSvg');
  const max = Math.max(1, ...data.map((d) => d.income));
  const w = 300, h = 160, pad = 6;
  const barW = (w - pad * 2) / data.length * 0.55;
  const gap = (w - pad * 2) / data.length;
  let bars = '';
  data.forEach((d, i) => {
    const barH = Math.max(2, (d.income / max) * (h - 30));
    const x = pad + i * gap + (gap - barW) / 2;
    const y = h - 20 - barH;
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="4" fill="var(--accent)"></rect>`;
    bars += `<text x="${(x + barW / 2).toFixed(1)}" y="${h - 6}" font-size="9" text-anchor="middle" fill="var(--text-muted)" font-family="IBM Plex Sans, sans-serif">${d.label}</text>`;
  });
  svg.innerHTML = bars;
  document.getElementById('chartLabels').innerHTML = '';
}

/* ================================================================
   INIT
   ================================================================ */
function injectStaticIcons() {
  document.getElementById('headerIcon').innerHTML = icon('wrench', 20);
  document.querySelector('[data-nav="calc"]').innerHTML = icon('wrench', 20) + '<span>Kalkulačka</span>';
  document.querySelector('[data-nav="jobs"]').innerHTML = icon('clipboard', 20) + '<span>Zákazky</span>';
  document.querySelector('[data-nav="folders"]').innerHTML = icon('folder', 20) + '<span>Priečinky</span>';
  document.querySelector('[data-nav="overview"]').innerHTML = icon('barchart', 20) + '<span>Prehľad</span>';
  document.getElementById('ic-home').innerHTML = icon('home', 13) + ' Klient';
  document.getElementById('ic-clock-label').innerHTML = icon('clock', 13) + ' Hodiny';
  document.getElementById('ic-truck-label').innerHTML = icon('truck', 13) + ' Doprava (km)';
  document.getElementById('ic-material-label').innerHTML = icon('package', 13) + ' Materiál';
  document.getElementById('ic-vat-label').innerHTML = icon('percent', 13) + ' Som platca DPH';
  document.getElementById('ic-plus-inline').innerHTML = icon('plus', 13);
}

async function init() {
  injectStaticIcons();

  try {
    const s = await idbGet('settings', 'settings');
    if (s) {
      state.settings = s;
      document.getElementById('calcHourlyRate').value = s.hourlyRate;
      document.getElementById('calcKmRate').value = s.kmRate;
      document.getElementById('calcVatRate').value = s.vatRate;
      if (s.vatPayer) {
        document.getElementById('calcVatToggle').classList.add('on');
        document.getElementById('calcVatRate').style.display = 'block';
      }
    }
  } catch (e) { /* defaults stay */ }

  try { state.jobs = await idbGetAll('jobs'); } catch (e) { state.jobs = []; }
  try { state.folders = await idbGetAll('folders'); } catch (e) { state.folders = []; }

  initCalculatorView();
  renderJobsList();
  renderFoldersList();
  renderOverview();

  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.nav;
      if (target === 'overview') renderOverview();
      if (target === 'jobs') renderJobsList();
      if (target === 'folders') renderFoldersList();
      setView(target);
    });
  });
  document.getElementById('folderCreateBtn').addEventListener('click', promptCreateFolder);

  setView('calc');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline install optional */ });
  }
}

document.addEventListener('DOMContentLoaded', init);
