/* Aztex Remodeling site script
   1. Photo section (filters + grid)
   2. Photo viewer (lightbox)
   3. Estimate form (sends to the server)
*/

/* ---------- 1. Photo section ---------- */

/* Services, in the order they appear on the page. The id matches data-service on each service card. */
const SERVICES = [
  { id: 'kitchen',  name: 'Kitchens' },
  { id: 'bath',     name: 'Bathrooms' },
  { id: 'whole',    name: 'Whole-house renovation' },
  { id: 'drywall',  name: 'Drywall & texture' },
  { id: 'paint',    name: 'Painting' },
  { id: 'addition', name: 'Room additions' },
  { id: 'patio',    name: 'Patios & decks' },
  { id: 'floor',    name: 'Flooring & repairs' }
];

/* Photos: put image files in the photos/ folder, then add one line per picture here.
   service = an id from the list above. caption is optional.
   Example:
     { service: 'bath', src: 'photos/bath-walk-in-shower.jpg', caption: 'Walk-in tile shower' },
*/
const PHOTOS = [
];

const nameOf = id => (SERVICES.find(s => s.id === id) || {}).name || '';
const countOf = id => PHOTOS.filter(p => p.service === id).length;

let current = 'all';
const filtersEl = document.getElementById('filters');
const binEl = document.getElementById('bin');

function visible() {
  return PHOTOS.filter(p => current === 'all' || p.service === current);
}

/* Filter buttons: "All photos" plus only the services that have photos */
function renderFilters() {
  filtersEl.innerHTML = '';
  if (!PHOTOS.length) { filtersEl.hidden = true; return; }
  filtersEl.hidden = false;

  const options = [{ id: 'all', name: 'All photos' }].concat(SERVICES.filter(s => countOf(s.id) > 0));
  options.forEach(o => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.setAttribute('aria-pressed', String(o.id === current));
    b.append(o.name);
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = o.id === 'all' ? PHOTOS.length : countOf(o.id);
    b.append(n);
    b.addEventListener('click', () => setFilter(o.id));
    filtersEl.append(b);
  });
}

/* Photo grid */
function renderBin() {
  binEl.innerHTML = '';
  const list = visible();

  if (!list.length) {
    const msg = document.createElement('p');
    msg.className = 'empty';
    const what = current === 'all' ? 'Photos of our work' : nameOf(current) + ' photos';
    msg.innerHTML = what + ' are coming soon. Call <a href="tel:+17373561239">(737) 356-1239</a> and we can share examples.';
    binEl.append(msg);
    return;
  }

  list.forEach((p, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'photo';
    const label = p.caption || nameOf(p.service);
    btn.setAttribute('aria-label', 'View larger: ' + label);

    const img = document.createElement('img');
    img.src = p.src;
    img.alt = label;
    img.loading = 'lazy';
    btn.append(img);

    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = nameOf(p.service);
    btn.append(tag);

    btn.addEventListener('click', () => openViewer(list, i));
    binEl.append(btn);
  });
}

function setFilter(id) {
  current = id;
  renderFilters();
  renderBin();
}

/* Service cards: clicking one jumps to the photos and filters to that service */
document.querySelectorAll('a.svc[data-service]').forEach(card => {
  card.addEventListener('click', () => setFilter(card.dataset.service));
});

renderFilters();
renderBin();


/* ---------- 2. Photo viewer ---------- */

const viewer = document.getElementById('lightbox');
const viewerImg = document.getElementById('lb-img');
const viewerCap = document.getElementById('lb-cap');
let viewerList = [];
let viewerIndex = 0;
let lastFocus = null;

function showPhoto() {
  const p = viewerList[viewerIndex];
  viewerImg.src = p.src;
  viewerImg.alt = p.caption || nameOf(p.service);
  viewerCap.textContent = p.caption || nameOf(p.service);
}
function openViewer(list, index) {
  viewerList = list;
  viewerIndex = index;
  lastFocus = document.activeElement;
  showPhoto();
  viewer.hidden = false;
  document.body.style.overflow = 'hidden';
  document.getElementById('lb-close').focus();
}
function closeViewer() {
  viewer.hidden = true;
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}
function step(d) {
  viewerIndex = (viewerIndex + d + viewerList.length) % viewerList.length;
  showPhoto();
}

document.getElementById('lb-close').addEventListener('click', closeViewer);
document.getElementById('lb-prev').addEventListener('click', () => step(-1));
document.getElementById('lb-next').addEventListener('click', () => step(1));
viewer.addEventListener('click', e => { if (e.target === viewer) closeViewer(); });
document.addEventListener('keydown', e => {
  if (viewer.hidden) return;
  if (e.key === 'Escape') closeViewer();
  if (e.key === 'ArrowLeft') step(-1);
  if (e.key === 'ArrowRight') step(1);
});


/* ---------- 3. Estimate form ---------- */

const form = document.getElementById('est-form');
const submitBtn = document.getElementById('est-submit');
const okMsg = document.getElementById('form-ok');
const errMsg = document.getElementById('form-err');

form.addEventListener('submit', async e => {
  e.preventDefault();               // send with JavaScript instead of reloading the page
  okMsg.hidden = true;
  errMsg.hidden = true;

  const data = Object.fromEntries(new FormData(form));   // { name, phone, email, address, message, website }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    const res = await fetch(form.action, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Server responded ' + res.status);
    form.reset();
    okMsg.hidden = false;
  } catch (err) {
    console.error(err);
    errMsg.hidden = false;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send request';
  }
});


/* Footer year */
document.getElementById('year').textContent = new Date().getFullYear();
