// Set href when a project destination is ready. Positions use ocean rows and percentages.
const projects = [
  { id: 'launderease', title: 'LaunderEase', subtitle: 'AI-powered laundry experience', href: null, x: 29, row: 0 },
  { id: 'sorena', islandAsset: 'assets/works/sorena-no-flags.png', title: 'Sorena', subtitle: 'Digital event experience', href: 'https://sorena-competition.com', x: 72, row: 0 },
  { id: 'music-streaming', title: 'Music Streaming', subtitle: 'Product / UI Design', href: null, x: 24, row: 1 },
  { id: 'snapp-bike', islandAsset: 'assets/works/snapp-bike-v2.png', title: 'Snapp Bike', subtitle: 'Mobility experience', href: null, x: 76, row: 1 },
  { id: 'simorgh-store', title: 'Simorgh Store', subtitle: 'Gaming & PC Hardware E-commerce', href: 'https://simorgh-store.shop/', x: 50, row: 2 }
];
const map = document.querySelector('.island-map');
[[9, 12], [50, 8], [92, 38], [48, 39], [16, 83], [86, 75]].forEach(([x, y]) => {
  const rock = document.createElement('span');
  rock.className = 'ocean-islet';
  rock.setAttribute('aria-hidden', 'true');
  rock.style.left = `${x}%`; rock.style.top = `${y}%`;
  map.append(rock);
});
[[9, 33], [88, 25], [30, 68]].forEach(([x, y]) => {
  const bird = document.createElement('span');
  bird.className = 'ocean-bird';
  bird.setAttribute('aria-hidden', 'true');
  bird.style.left = `${x}%`; bird.style.top = `${y}%`;
  map.append(bird);
});
const visibleProjects = projects.filter(project => project.enabled !== false);
map.style.setProperty('--count', visibleProjects.length);
map.style.setProperty('--rows', Math.max(0, ...visibleProjects.map((project, index) => project.row ?? Math.floor(index / 2))) + 1);
visibleProjects.forEach((project, index) => {
  const island = document.createElement('article');
  island.className = 'project-island';
  island.style.setProperty('--x', `${project.x ?? (index % 2 ? 72 : 28)}%`);
  island.style.setProperty('--row', project.row ?? Math.floor(index / 2));
  island.style.setProperty('--index', index);
  const content = document.createElement(project.href ? 'a' : 'div');
  content.className = 'island-content';
  if (project.href) { content.href = project.href; content.setAttribute('aria-label', `Explore ${project.title}`); }
  const art = document.createElement('img');
  art.className = 'island-art';
  art.src = project.islandAsset ?? `assets/works/${project.id}.png`;
  art.alt = '';
  art.width = 360; art.height = 260;
  art.loading = index > 1 ? 'lazy' : 'eager';
  const flag = document.createElement('span');
  flag.className = 'island-number'; flag.textContent = String(index + 1).padStart(2, '0');
  const label = document.createElement('span'); label.className = 'island-label';
  const title = document.createElement('strong'); title.textContent = project.title;
  const subtitle = document.createElement('small'); subtitle.textContent = project.subtitle;
  label.append(title, subtitle);
  if (!project.href) { const pending = document.createElement('small'); pending.className = 'pending'; pending.textContent = 'Case study coming soon'; label.append(pending); }
  content.append(art, flag, label); island.append(content); map.append(island);
});
// Full-resolution water, independent swell motion and transient reflected light.
const canvas = document.querySelector('.ocean-water');
const context = canvas.getContext('2d');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const water = new Image();
const texture = document.createElement('canvas');
const textureContext = texture.getContext('2d');
let frame = 0;
let lastPaint = 0;
let waterReady = false;
let resolution = 1;
let glints = [];
function resizeWater() {
  resolution = Math.min(devicePixelRatio || 1, 1.5);
  canvas.width = Math.ceil(canvas.clientWidth * resolution);
  canvas.height = Math.ceil(canvas.clientHeight * resolution);
  texture.width = canvas.width + 96;
  texture.height = canvas.height + 96;
  if (!waterReady) return;
  const tileWidth = Math.round(760 * resolution);
  const tileHeight = Math.round(tileWidth * water.naturalHeight / water.naturalWidth);
  textureContext.imageSmoothingEnabled = true;
  textureContext.imageSmoothingQuality = 'high';
  for (let y = 0; y < texture.height; y += tileHeight) {
    for (let x = 0; x < texture.width; x += tileWidth) {
      textureContext.drawImage(water, x, y, tileWidth, tileHeight);
    }
  }
  glints = Array.from({length: Math.ceil(canvas.width * canvas.height / 16000)}, (_, index) => ({
    x: ((index * .61803398875) % 1) * canvas.width,
    y: ((index * .41421356237) % 1) * canvas.height,
    phase: index * 2.39996,
    length: (3 + index % 7) * resolution
  }));
  paintWater(0);
}
function paintWater(time) {
  if (!waterReady) return;
  const seconds = time / 1000;
  context.globalAlpha = 1;
  context.imageSmoothingEnabled = true;
  for (let y = 0; y < canvas.height; y += 4) {
    const swell = Math.sin(y / (90 * resolution) - seconds * .42) * 5;
    const ripple = Math.sin(y / (31 * resolution) + seconds * .71) * 1.8;
    const vertical = Math.sin(y / (160 * resolution) + seconds * .28) * 2;
    context.drawImage(texture, 40 + swell + ripple, y + 40 + vertical, canvas.width, 4, 0, y, canvas.width, 4);
  }
  context.fillStyle = '#d8faff';
  for (const glint of glints) {
    const light = Math.max(0, Math.sin(seconds * .85 + glint.phase));
    context.globalAlpha = Math.pow(light, 8) * .42;
    const x = glint.x + Math.sin(seconds * .42 + glint.phase) * 5 * resolution;
    const y = glint.y + Math.cos(seconds * .3 + glint.phase) * 2 * resolution;
    context.fillRect(x, y, glint.length * (.5 + light * .5), resolution);
    context.fillRect(x + glint.length * .65, y - resolution, glint.length * .3, resolution);
  }
  context.globalAlpha = 1;
}
function animateWater(time) {
  if (time - lastPaint >= 32) { paintWater(time); lastPaint = time; }
  frame = requestAnimationFrame(animateWater);
}
function syncMotion() {
  cancelAnimationFrame(frame);
  document.body.classList.toggle('scene-paused', document.hidden);
  if (!motion.matches && !document.hidden && waterReady) frame = requestAnimationFrame(animateWater);
  else paintWater(0);
}
water.onload = () => { waterReady = true; resizeWater(); syncMotion(); };
water.src = 'assets/works/water-v3.png';
new ResizeObserver(resizeWater).observe(canvas);
motion.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', syncMotion);
syncMotion();
