// @ts-nocheck
// dynamic HUD engine: animated charts, counters, data stream, info focus panel

let hudRefresh: (() => void) | null = null;

export function initHUD(): void {
  const $ = s => document.getElementById(s);
  const accs = () => {
    const cs = getComputedStyle(document.documentElement);
    return [cs.getPropertyValue('--accent').trim(), cs.getPropertyValue('--accent2').trim()];
  };
  const path = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');

  /* ─── charts (spectrum, growth, bars, scatter) ─── */
  function drawCharts() {
    const [acc] = accs();
    // luminance spectrum
    const sp = $('svg-spectrum');
    if (sp) {
      let p1 = [], p2 = [];
      for (let i = 0; i <= 46; i++) {
        const x = (i / 46) * 226 + 2;
        p1.push([x, 70 - (28 + 22 * Math.sin(i * .5) * Math.cos(i * .13) + 8 * Math.sin(i * .9))]);
        p2.push([x, 72 - (16 + 14 * Math.sin(i * .32 + 1.5))]);
      }
      const fill = 'M2 72 ' + p1.map(p => 'L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + ' L228 72 Z';
      sp.innerHTML =
        '<line class="axis" x1="2" y1="72" x2="228" y2="72"/>' +
        '<line class="axis" x1="2" y1="6" x2="2" y2="72"/>' +
        [18, 36, 54].map(y => '<line class="axis" x1="2" y1="' + y + '" x2="228" y2="' + y + '" opacity="0.4"/>').join('') +
        '<path class="fillpath" d="' + fill + '"/>' +
        '<path class="ln2 anim-line" d="' + path(p2) + '"/>' +
        '<path class="ln anim-line" d="' + path(p1) + '"/>';
    }
    // growth
    const gr = $('svg-growth');
    if (gr) {
      let pts = [], bars = '';
      for (let i = 0; i <= 30; i++) { const x = (i / 30) * 196 + 2; pts.push([x, 70 - 58 / (1 + Math.exp(-(i - 15) * .35))]); }
      for (let i = 0; i < 14; i++) { const h = 6 + 44 * Math.abs(Math.sin(i * .8 + 1)); bars += '<rect class="bar anim-bar" x="' + (4 + i * 14) + '" y="' + (72 - h) + '" width="7" height="' + h + '" style="animation-delay:' + (i * 60) + 'ms"/>'; }
      gr.innerHTML = '<line class="axis" x1="2" y1="72" x2="198" y2="72"/>' + bars + '<path class="ln anim-line" d="' + path(pts) + '"/>';
    }
    // emission bars
    const eb = $('svg-bars');
    if (eb) {
      let bars = '';
      for (let i = 0; i < 22; i++) {
        const h = 6 + 52 * Math.abs(Math.sin(i * .6 + .5) * Math.cos(i * .21));
        bars += '<rect class="bar anim-bar" x="' + (4 + i * 10) + '" y="' + (72 - h).toFixed(1) + '" width="6" height="' + h.toFixed(1) + '" style="animation-delay:' + (i * 50) + 'ms"/>';
      }
      eb.innerHTML = '<line class="axis" x1="2" y1="72" x2="228" y2="72"/>' + bars;
    }
    // scatter
    const sc = $('svg-scatter');
    if (sc) {
      const [acc, acc2] = accs();
      let s = '<line class="axis" x1="2" y1="84" x2="228" y2="84"/><line class="axis" x1="2" y1="4" x2="2" y2="84"/>';
      for (let g = 20; g < 84; g += 20) s += '<line class="axis" x1="2" y1="' + g + '" x2="228" y2="' + g + '" opacity="0.3"/>';
      for (let i = 0; i < 56; i++) {
        const x = 6 + ((i * 53) % 220), y = 6 + ((i * 29 + 11) % 76);
        s += '<circle cx="' + x + '" cy="' + y + '" r="' + (.8 + ((i * 7) % 18) / 10).toFixed(1) + '" fill="' + (i % 4 ? acc : acc2) + '" opacity="' + (.3 + ((i * 17) % 50) / 100).toFixed(2) + '" class="anim-dot" style="animation-delay:' + (i * 30) + 'ms"/>';
      }
      sc.innerHTML = s;
    }
    // animate lines (stroke-dashoffset draw-in)
    requestAnimationFrame(() => {
      document.querySelectorAll('.anim-line').forEach(el => {
        const len = el.getTotalLength ? el.getTotalLength() : 600;
        el.style.strokeDasharray = len;
        el.style.strokeDashoffset = len;
        el.style.transition = 'none';
        requestAnimationFrame(() => { el.style.transition = 'stroke-dashoffset 2s ease-out'; el.style.strokeDashoffset = '0'; });
      });
    });
  }

  /* ─── burst diagram ─── */
  function drawBurst() {
    const el = $('svg-burst'); if (!el) return;
    const [acc, acc2] = accs(), cx = 76, cy = 60; let s = '';
    for (let k = 0; k < 48; k++) {
      const a = (k / 48) * Math.PI * 2 + Math.sin(k) * .06;
      const len = 12 + ((k * 37) % 46);
      const ex = cx + Math.cos(a) * len, ey = cy + Math.sin(a) * len * .82;
      const col = k % 3 ? acc : acc2;
      s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ex.toFixed(1) + '" y2="' + ey.toFixed(1) + '" stroke="' + col + '" stroke-width="0.7" opacity="' + (.18 + ((k * 13) % 50) / 100).toFixed(2) + '"/>';
      s += '<circle cx="' + ex.toFixed(1) + '" cy="' + ey.toFixed(1) + '" r="' + (.6 + ((k * 7) % 14) / 10).toFixed(1) + '" fill="' + col + '" opacity="0.85" class="anim-dot" style="animation-delay:' + (k * 25) + 'ms"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="7" fill="' + acc + '" opacity="0.22"/><circle cx="' + cx + '" cy="' + cy + '" r="2.6" fill="#fff" opacity="0.9"/>';
    el.innerHTML = s;
  }

  /* ─── rulers ─── */
  function buildRulers() {
    const W = window.innerWidth, H = window.innerHeight;
    ['svg-rt', 'svg-rb'].forEach((id, idx) => {
      const el = $(id); if (!el) return;
      el.setAttribute('viewBox', '0 0 ' + W + ' 14');
      let s = '';
      for (let x = 0; x < W; x += 12) {
        const mj = x % 60 === 0;
        s += '<line x1="' + x + '" y1="' + (idx ? 0 : 14) + '" x2="' + x + '" y2="' + (idx ? (mj ? 12 : 6) : (mj ? 2 : 8)) + '" class="' + (mj ? 'tickm' : 'tick') + '"/>';
        if (mj && !idx) s += '<text x="' + (x + 2) + '" y="9" font-size="6" fill="#4a5d70" font-family="monospace">' + x + '</text>';
      }
      el.innerHTML = s;
    });
    const rl = $('svg-rl');
    if (rl) {
      rl.setAttribute('viewBox', '0 0 14 ' + H);
      let s = '';
      for (let y = 0; y < H; y += 12) {
        const mj = y % 60 === 0;
        s += '<line x1="14" y1="' + y + '" x2="' + (mj ? 2 : 8) + '" y2="' + y + '" class="' + (mj ? 'tickm' : 'tick') + '"/>';
      }
      rl.innerHTML = s;
    }
  }

  /* ─── barcode ─── */
  function buildBarcode() {
    const el = $('barcode'); if (!el) return;
    let s = '';
    for (let i = 0; i < 46; i++) s += '<i style="height:' + (8 + ((i * 7) % 15)) + 'px;opacity:' + (.3 + ((i * 11) % 50) / 100).toFixed(2) + '"></i>';
    el.innerHTML = s;
  }

  /* ─── animated counters ─── */
  function animateCounters() {
    document.querySelectorAll('[data-counter]').forEach(el => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const decimals = (target % 1 !== 0) ? 1 : 0;
      const dur = 2000, t0 = Date.now();
      function step() {
        const p = Math.min((Date.now() - t0) / dur, 1);
        const ep = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * ep).toFixed(decimals) + suffix;
        if (p < 1) setTimeout(step, 32);
        else el.textContent = target.toFixed(decimals) + suffix;
      }
      step();
      // fallback: guarantee final value
      setTimeout(() => { el.textContent = target.toFixed(decimals) + suffix; }, dur + 100);
    });
  }

  /* ─── data stream ─── */
  function startDataStream() {
    const el = $('datastream'); if (!el) return;
    const hex = () => Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase();
    const line = () => {
      let s = '';
      for (let i = 0; i < 16; i++) s += hex() + (i % 4 === 3 ? '  ' : ' ');
      return s;
    };
    // initial fill
    for (let i = 0; i < 6; i++) el.innerHTML += '<div>' + line() + '</div>';
    setInterval(() => {
      el.innerHTML += '<div class="stream-new">' + line() + '</div>';
      if (el.children.length > 8) el.removeChild(el.firstChild);
    }, 800);
  }

  /* ─── live ticking values ─── */
  function startLiveTickers() {
    const els = document.querySelectorAll('[data-ticker]');
    setInterval(() => {
      els.forEach(el => {
        const base = parseFloat(el.dataset.ticker);
        const jitter = (Math.random() - .5) * base * .06;
        const dec = el.dataset.dec ? parseInt(el.dataset.dec) : 2;
        el.textContent = (base + jitter).toFixed(dec);
      });
    }, 1200);
  }

  /* ─── info focus panel (on part click) ─── */
  const PART_DATA = {
    fall: {
      title: 'FALL TEPAL', sub: 'Drooping perianth segment',
      rows: [
        ['Length', '112.4 mm'], ['Width', '68.2 mm'], ['Refr. index', '1.41'],
        ['Vein density', '42 /cm'], ['Signal streak', 'ACTIVE'], ['Emission', '486 nm']
      ],
      desc: 'Primary pollinator signal surface. Sub-epidermal photonic crystal lattice produces spectral iridescence across 420–680 nm. Vein network fans from the haft to the blade margin.'
    },
    standard: {
      title: 'STANDARD TEPAL', sub: 'Upright dome petal',
      rows: [
        ['Length', '98.6 mm'], ['Width', '54.1 mm'], ['Curvature', '162°'],
        ['Opacity', '0.82'], ['Sheen index', '0.7'], ['UV reflectance', '23%']
      ],
      desc: 'Arches inward forming the protective dome. Slightly narrower than falls with reduced vein density. Iridescence strongest at the ruffled margins.'
    },
    beard: {
      title: 'BEARD ARRAY', sub: 'Trichome emission filaments',
      rows: [
        ['Density', '2.6 fil/mm²'], ['Temp delta', '+4.2°C'], ['Emission', '580–620 nm'],
        ['Pattern', 'Hexagonal'], ['Power', '0.18 mW/fil'], ['Status', 'EMITTING']
      ],
      desc: 'Self-organising filament array along the fall midrib. Each trichome is a bio-emitter radiating in the orange band, producing a thermal gradient that guides pollinators.'
    },
    style: {
      title: 'STYLE CREST', sub: 'Stigmatic arch',
      rows: [
        ['Span', '28.4 mm'], ['Receptivity', 'HIGH'], ['Pollen load', '0.12 mg'],
        ['Curvature', '74°']
      ],
      desc: 'Small arched petal-like structure covering the stigmatic surface. Positioned directly above each beard to intercept pollen from visiting insects.'
    },
    stem: {
      title: 'PEDUNCLE', sub: 'Primary support axis',
      rows: [
        ['Height', '72.8 cm'], ['Diameter', '8.5 mm'], ['Turgor', '0.42 MPa'],
        ['Curvature', '4.1°/cycle'], ['Xylem flow', '2.1 mL/h']
      ],
      desc: 'Phototropic stem maintaining vertical orientation via differential auxin distribution. Slight sigmoid curvature logged over 14 growth cycles.'
    },
    leaf: {
      title: 'ENSIFORM LEAF', sub: 'Sword-blade foliage',
      rows: [
        ['Length', '38–48 cm'], ['Width', '16 mm'], ['Chlorophyll', '412 SPAD'],
        ['Stomates', '180 /mm²'], ['Transpiration', '1.4 g/h']
      ],
      desc: 'Equitant sword-shaped leaves with parallel venation. Asymmetric curvature reduces self-shading. Waxy cuticle minimises water loss.'
    },
    center: {
      title: 'GYNOECIUM', sub: 'Reproductive core',
      rows: [
        ['Ovules', '~120'], ['Nectar vol.', '0.8 µL'], ['Scent', 'Faint ionone'],
        ['Phase', 'Anthesis III']
      ],
      desc: 'Central reproductive structure enclosed by the perianth dome. Inferior ovary with three locules. Nectar production peaks during beard emission phase.'
    }
  };

  function initInfoPanel() {
    const panel = $('info-panel');
    const titleEl = panel.querySelector('.info-title');
    const subEl = panel.querySelector('.info-sub');
    const rowsEl = panel.querySelector('.info-rows');
    const descEl = panel.querySelector('.info-desc');

    window.addEventListener('irisfocus', e => {
      document.body.classList.add('info-open');
      const data = PART_DATA[e.detail.part];
      if (!data) return;
      titleEl.textContent = data.title;
      subEl.textContent = data.sub;
      rowsEl.innerHTML = data.rows.map(r => '<div class="drow"><span class="k">' + r[0] + '</span><span class="v">' + r[1] + '</span></div>').join('');
      descEl.textContent = data.desc;
      panel.classList.add('visible');
      // animate counter-like effect for numeric values
      rowsEl.querySelectorAll('.v').forEach((v, i) => {
        v.style.animation = 'none'; v.offsetHeight;
        v.style.animation = 'fadeSlideIn .4s ease-out ' + (i * 60) + 'ms both';
      });
    });
    window.addEventListener('irisreset', () => { panel.classList.remove('visible'); document.body.classList.remove('info-open'); });
  }

  /* ─── callouts ─── */
  function layoutCallouts() {
    document.querySelectorAll('.callout').forEach(c => {
      const x = +c.dataset.x, y = +c.dataset.y, len = +c.dataset.len, ang = +c.dataset.ang;
      c.style.left = x + '%'; c.style.top = y + '%';
      const rad = ang * Math.PI / 180, ex = Math.cos(rad) * len, ey = Math.sin(rad) * len;
      const flip = Math.cos(rad) < 0;
      c.innerHTML =
        '<div class="dot" style="left:-2px;top:-2px"></div>' +
        '<div class="leader" style="width:' + len + 'px;transform:rotate(' + ang + 'deg)"></div>' +
        '<div class="ctxt" style="left:' + (ex + (flip ? -6 : 6)) + 'px;top:' + (ey - 14) + 'px;' + (flip ? 'transform:translateX(-100%)' : '') + '">' +
        c.dataset.txt + '<br><span class="cd">' + c.dataset.sub + '</span></div>';
    });
  }

  hudRefresh = () => {
    drawCharts();
    drawBurst();
  };

  buildBarcode();
  buildRulers();
  layoutCallouts();
  hudRefresh();
  animateCounters();
  startDataStream();
  startLiveTickers();
  initInfoPanel();
  window.addEventListener("resize", () => {
    layoutCallouts();
    buildRulers();
  });
}

export function refreshHUD(): void {
  hudRefresh?.();
}
