// iris-scene.js — procedural 3D iris stalk with iridescent petals + bloom.
// Vanilla Three.js module. Reads window.IRIS_CONFIG; listens for 'sceneconfig' events.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const D2R = THREE.MathUtils.degToRad;
const smooth = (a, b, x) => { x = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const ease = (t) => t * t * (3 - 2 * t);

/* ----------------------------- palettes ------------------------------ */
const PALETTES = {
  spectral: {
    throat: '#19a8ff', mid: '#7b5cff', tip: '#ff5db0', beard: '#ff8a1e',
    lights: ['#37c6ff', '#9a5cff', '#ff7a3c'], stem: '#2f8f6b',
    irid: [120, 560], iridStrength: 1.0,
  },
  violet: {
    throat: '#7a3cff', mid: '#c06bff', tip: '#ff9ad0', beard: '#ff9a3c',
    lights: ['#9a4bff', '#d06bff', '#ff7e9e'], stem: '#5a6f8f',
    irid: [320, 540], iridStrength: 0.4,
  },
  cyan: {
    throat: '#10e0c4', mid: '#2aa6ff', tip: '#9ef0ff', beard: '#ffd06a',
    lights: ['#22e6cf', '#2aa6ff', '#7fe6ff'], stem: '#2f8f8a',
    irid: [150, 320], iridStrength: 0.42,
  },
};

/* ---------------------- procedural petal texture ---------------------- */
function drawPetalTexture(pal, type) {
  const W = 256, H = 512;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  const Y = (t) => H * (1 - t); // t: 0 base .. 1 tip
  const throat = new THREE.Color(pal.throat).getHexString();
  const mid = new THREE.Color(pal.mid).getHexString();
  const tip = new THREE.Color(pal.tip).getHexString();

  // base vertical gradient (warm throat -> tip color)
  const g = x.createLinearGradient(0, H, 0, 0);
  g.addColorStop(0.0, '#fff3df');
  g.addColorStop(0.14, '#' + throat);
  g.addColorStop(0.52, '#' + mid);
  g.addColorStop(1.0, '#' + tip);
  x.fillStyle = g; x.fillRect(0, 0, W, H);

  // longitudinal veins fanning from the base
  for (let k = 0; k < 64; k++) {
    const ex = (k / 63) * W;
    x.beginPath();
    x.moveTo(W * 0.5, Y(0.05));
    const midx = (W * 0.5 + ex) / 2 + Math.sin(k * 1.7) * 7;
    x.bezierCurveTo(midx, Y(0.42), ex + Math.sin(k * 1.3) * 5, Y(0.72), ex, Y(1.0));
    const dark = k % 2 === 0;
    x.strokeStyle = dark ? 'rgba(18,26,54,0.11)' : 'rgba(255,255,255,0.13)';
    x.lineWidth = dark ? 1.3 : 0.7;
    x.stroke();
  }

  // bright midrib
  const mr = x.createLinearGradient(0, H, 0, 0);
  mr.addColorStop(0.0, 'rgba(255,255,255,0)');
  mr.addColorStop(0.12, 'rgba(255,255,255,0.55)');
  mr.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  mr.addColorStop(1.0, 'rgba(255,255,255,0)');
  x.fillStyle = mr; x.fillRect(W * 0.47, 0, W * 0.06, H);

  if (type === 'fall') {
    // white throat splash
    const tg = x.createRadialGradient(W * 0.5, Y(0.14), 2, W * 0.5, Y(0.14), W * 0.46);
    tg.addColorStop(0, 'rgba(255,250,236,0.92)');
    tg.addColorStop(0.5, 'rgba(255,244,224,0.34)');
    tg.addColorStop(1, 'rgba(255,244,224,0)');
    x.fillStyle = tg; x.fillRect(0, Y(0.45), W, H);
    // beard: fuzzy orange filaments down the centre
    const bc = new THREE.Color(pal.beard);
    const br = Math.round(bc.r * 255), bg = Math.round(bc.g * 255), bb = Math.round(bc.b * 255);
    for (let i = 0; i < 320; i++) {
      const ty = 0.02 + Math.random() * 0.3;
      const spread = W * 0.12 * (1 - ty * 1.6);
      const cx = W * 0.5 + (Math.random() - 0.5) * spread * 2;
      const len = 3 + Math.random() * 8;
      x.strokeStyle = 'rgba(' + br + ',' + bg + ',' + bb + ',' + (0.45 + Math.random() * 0.45) + ')';
      x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(cx, Y(ty)); x.lineTo(cx + (Math.random() - 0.5) * 4, Y(ty) - len); x.stroke();
    }
    // hot core
    const hc = x.createRadialGradient(W * 0.5, Y(0.13), 1, W * 0.5, Y(0.13), 30);
    hc.addColorStop(0, 'rgba(255,214,150,0.95)');
    hc.addColorStop(1, 'rgba(255,180,90,0)');
    x.fillStyle = hc; x.fillRect(W * 0.5 - 34, Y(0.13) - 34, 68, 68);
  }

  // edge + tip alpha falloff -> delicate translucent margins
  x.globalCompositeOperation = 'destination-in';
  const am = x.createLinearGradient(0, 0, W, 0);
  am.addColorStop(0.0, 'rgba(0,0,0,0)');
  am.addColorStop(0.07, 'rgba(0,0,0,1)');
  am.addColorStop(0.93, 'rgba(0,0,0,1)');
  am.addColorStop(1.0, 'rgba(0,0,0,0)');
  x.fillStyle = am; x.fillRect(0, 0, W, H);
  const tf = x.createLinearGradient(0, 0, 0, H);
  tf.addColorStop(0.0, 'rgba(0,0,0,0.45)'); // tip (y=0)
  tf.addColorStop(0.12, 'rgba(0,0,0,1)');
  tf.addColorStop(1.0, 'rgba(0,0,0,1)');
  x.fillStyle = tf; x.fillRect(0, 0, W, H);
  x.globalCompositeOperation = 'source-over';

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/* --------------------------- petal geometry --------------------------- */
function centerline(type) {
  const N = 56;
  let theta0, theta1, len, cup;
  if (type === 'fall') { theta0 = D2R(22); theta1 = D2R(-86); len = 2.7; cup = -0.30; }
  else if (type === 'style') { theta0 = D2R(38); theta1 = D2R(74); len = 1.05; cup = 0.18; }
  else { theta0 = D2R(78); theta1 = D2R(162); len = 2.15; cup = 0.34; }
  const pts = [], tan = [], nrm = [];
  let pos = new THREE.Vector3(0, 0, 0);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const th = theta0 + (theta1 - theta0) * ease(t);
    const dir = new THREE.Vector3(Math.cos(th), Math.sin(th), 0);
    if (i > 0) pos = pos.clone().add(dir.clone().multiplyScalar(len / N));
    pts.push(pos.clone());
    tan.push(dir.clone());
    nrm.push(new THREE.Vector3(-Math.sin(th), Math.cos(th), 0)); // perp in x-y plane
  }
  return { pts, tan, nrm, N, cup };
}

function buildPetal(type) {
  const { pts, nrm, N, cup } = centerline(type);
  const M = 34;
  const maxW = type === 'fall' ? 1.06 : type === 'style' ? 0.34 : 0.92;
  const r1A = type === 'fall' ? 0.20 : type === 'style' ? 0.05 : 0.14;
  const r1F = type === 'fall' ? 9 : 7;
  const r2A = type === 'style' ? 0.02 : 0.07, r2F = 22;

  const positions = [], uvs = [];
  const widthProfile = (t) => Math.pow(Math.sin(Math.PI * Math.pow(t, 0.7)), 0.6);

  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const P = pts[i], Nn = nrm[i];
    const w = maxW * widthProfile(t) + 0.03;
    for (let j = 0; j <= M; j++) {
      const s = j / M, v = s * 2 - 1; // -1..1
      // multi-octave ruffle, stronger toward the edge and the tip
      const edge = Math.pow(Math.abs(v), 1.8);
      const ruffle = (r1A * Math.sin(v * r1F * Math.PI + i * 0.4) +
                      r2A * Math.sin(v * r2F * Math.PI + i * 0.9)) * w * edge * (0.4 + 0.95 * t);
      const cupOff = cup * w * v * v;
      positions.push(
        P.x + Nn.x * (cupOff + ruffle),
        P.y + Nn.y * (cupOff + ruffle),
        v * w
      );
      uvs.push(s, t);
    }
  }
  // indices
  const idx = [];
  const stride = M + 1;
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < M; j++) {
      const a = i * stride + j, b = a + 1, c = a + stride, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------- iridescent material ------------------------ */
function makePetalMaterial(glowRef, pal, tex) {
  const mat = new THREE.MeshPhysicalMaterial({
    map: tex,
    emissive: 0xffffff,
    emissiveMap: tex,            // petal's own colour/veins/beard glow
    emissiveIntensity: glowRef.value,
    roughness: 0.42,
    metalness: 0.0,
    transmission: 0.34,
    thickness: 0.8,
    ior: 1.33,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    opacity: 1.0,
    iridescence: pal.iridStrength,
    iridescenceIOR: 1.35,
    clearcoat: 0.5,
    clearcoatRoughness: 0.4,
    sheen: 0.7,
    sheenColor: new THREE.Color('#cfeaff'),
  });
  mat.iridescenceThicknessRange = pal.irid;
  return mat;
}

/* ------------------------------- beard -------------------------------- */
function buildBeard(pal) {
  const g = new THREE.Group();
  const col = new THREE.Color(pal.beard);
  const mat = new THREE.MeshStandardMaterial({
    color: col, emissive: col, emissiveIntensity: 1.6, roughness: 0.5,
  });
  const n = 18;
  const { pts, nrm } = centerline('fall');
  for (let k = 0; k < n; k++) {
    const t = 0.02 + (k / n) * 0.30;
    const i = Math.round(t * (pts.length - 1));
    const P = pts[i], Nn = nrm[i];
    const r = 0.036 + 0.018 * Math.sin(k);
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 6, 6), mat);
    s.position.copy(P).add(Nn.clone().multiplyScalar(0.05));
    s.position.z += (Math.random() - 0.5) * 0.06;
    g.add(s);
  }
  return g;
}

/* ------------------------------ flower -------------------------------- */
function buildFlower(shared, open = 1.0) {
  const { matFall, matStd, matStyle, geoFall, geoStd, geoStyle, pal } = shared;
  const flower = new THREE.Group();
  const closeTilt = 1 - open;
  for (let k = 0; k < 3; k++) {
    const ang = (k / 3) * Math.PI * 2;
    // drooping fall
    const fall = new THREE.Mesh(geoFall, matFall);
    fall.rotation.y = ang;
    fall.rotation.z = -closeTilt * 0.9;
    // beard along the fall midrib
    const beard = buildBeard(pal);
    beard.rotation.y = ang;
    beard.rotation.z = -closeTilt * 0.9;
    // upright standard (offset 60deg)
    const std = new THREE.Mesh(geoStd, matStd);
    std.rotation.y = ang + Math.PI / 3;
    std.rotation.z = closeTilt * 0.5;
    // style crest arching over the beard
    const style = new THREE.Mesh(geoStyle, matStyle);
    style.rotation.y = ang;
    style.position.y = 0.08;
    flower.add(fall, beard, std, style);
  }
  // glowing centre column
  const cMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(pal.beard), emissive: new THREE.Color(pal.beard),
    emissiveIntensity: 1.3, roughness: 0.4,
  });
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), cMat);
  flower.add(center);
  return flower;
}

/* ------------------------------- stem --------------------------------- */
function buildStemAndLeaves(pal) {
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, -3.6, 0),
    new THREE.Vector3(0.15, -2.0, 0.1),
    new THREE.Vector3(-0.1, -0.4, -0.1),
    new THREE.Vector3(0.12, 1.2, 0.08),
    new THREE.Vector3(-0.05, 2.6, 0),
    new THREE.Vector3(0.0, 3.7, 0),
  ]);
  const stemMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(pal.stem), roughness: 0.45, metalness: 0,
    transmission: 0.25, thickness: 0.4, transparent: true, opacity: 0.96,
    emissive: new THREE.Color(pal.stem), emissiveIntensity: 0.25, clearcoat: 0.4,
  });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.085, 12, false), stemMat);
  g.add(tube);

  // sword leaves at base
  const leafMat = stemMat.clone();
  leafMat.opacity = 0.9;
  const leafColor = new THREE.Color(pal.stem).offsetHSL(0, 0, -0.04);
  leafMat.color = leafColor;
  for (let l = 0; l < 4; l++) {
    const ang = (l / 4) * Math.PI * 2 + 0.4;
    const h = 3.4 + Math.random() * 1.6;
    const lean = 0.18 + Math.random() * 0.12;
    const blade = buildLeaf(h, lean, leafMat);
    blade.rotation.y = ang;
    blade.position.y = -3.6;
    g.add(blade);
  }
  g.userData.curve = curve;
  return g;
}

function buildLeaf(height, lean, mat) {
  const N = 30, M = 4;
  const positions = [], idx = [], uvs = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = t * height;
    const x = Math.sin(t * 1.2) * lean * height; // gentle outward sweep
    const z = 0;
    const w = 0.16 * Math.sin(Math.PI * Math.pow(t, 0.7)) * (1 - 0.3 * t) + 0.01;
    for (let j = 0; j <= M; j++) {
      const v = (j / M) * 2 - 1;
      positions.push(x + 0, y, v * w);
      uvs.push(j / M, t);
    }
  }
  const stride = M + 1;
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * stride + j, b = a + 1, c = a + stride, d = c + 1;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

/* ------------------------------ plant --------------------------------- */
function buildPlant(cfg) {
  const pal = PALETTES[cfg.palette] || PALETTES.spectral;
  const glowRef = { value: cfg.glow };
  const plant = new THREE.Group();
  plant.userData.glowRef = glowRef;

  const stem = buildStemAndLeaves(pal);
  plant.add(stem);
  const curve = stem.userData.curve;

  // shared geometry + textured materials (built once, reused per bloom)
  const geoFall = buildPetal('fall');
  const geoStd = buildPetal('standard');
  const geoStyle = buildPetal('style');
  const texFall = drawPetalTexture(pal, 'fall');
  const texStd = drawPetalTexture(pal, 'standard');
  const matFall = makePetalMaterial(glowRef, pal, texFall);
  const matStd = makePetalMaterial(glowRef, pal, texStd);
  const matStyle = makePetalMaterial(glowRef, pal, texStd);
  const shared = { matFall, matStd, matStyle, geoFall, geoStd, geoStyle, pal };
  plant.userData.petalMats = [matFall, matStd, matStyle];

  // bloom placements along upper stem (fuller, overlapping)
  const count = cfg.bloomCount;
  const layout = count === 4
    ? [{ t: 0.99, s: 0.5, open: 0.3 }, { t: 0.86, s: 1.0, open: 1 }, { t: 0.68, s: 1.12, open: 1 }, { t: 0.5, s: 1.05, open: 1 }]
    : [{ t: 0.96, s: 0.6, open: 0.4 }, { t: 0.78, s: 1.08, open: 1 }, { t: 0.56, s: 1.12, open: 1 }];

  layout.forEach((b, i) => {
    const fl = buildFlower(shared, b.open);
    const p = curve.getPointAt(b.t);
    fl.position.copy(p);
    fl.position.y += 0.1;
    fl.scale.setScalar(b.s * 1.0);
    fl.rotation.y = i * 2.2;
    fl.rotation.x = -0.12 - 0.1 * Math.sin(i); // slight nod outward
    plant.add(fl);
  });

  plant.userData.pal = pal;
  return plant;
}

/* ---------------------------- particles ------------------------------- */
function buildParticles(pal) {
  const n = 320;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const cA = new THREE.Color(pal.lights[0]), cB = new THREE.Color(pal.lights[1]);
  const tmp = new THREE.Color();
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 11;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 7;
    tmp.copy(cA).lerp(cB, Math.random());
    col[i * 3] = tmp.r; col[i * 3 + 1] = tmp.g; col[i * 3 + 2] = tmp.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({
    size: 0.05, vertexColors: true, transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  return new THREE.Points(g, m);
}

/* ============================== APP =================================== */
export function initIris(canvas) {
  const cfg = Object.assign({
    palette: 'spectral', bloomCount: 3, glow: 0.35,
    bloomStrength: 0.62, rotateSpeed: 0.5,
  }, window.IRIS_CONFIG || {});

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0.9, 12.8);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 7;
  controls.maxDistance = 18;
  controls.target.set(0, 0.7, 0);

  // lights
  scene.add(new THREE.AmbientLight(0x1a2238, 0.7));
  const lightGroup = new THREE.Group();
  const lA = new THREE.PointLight(0x37c6ff, 60, 40); lA.position.set(-5, 3, 4);
  const lB = new THREE.PointLight(0x9a5cff, 60, 40); lB.position.set(5, 1, 3);
  const lC = new THREE.PointLight(0xff7a3c, 35, 40); lC.position.set(0, -3, 5);
  const lTop = new THREE.DirectionalLight(0xbfe6ff, 0.8); lTop.position.set(0, 8, 2);
  lightGroup.add(lA, lB, lC);
  scene.add(lightGroup, lTop);

  let plant = buildPlant(cfg);
  scene.add(plant);
  let particles = buildParticles(plant.userData.pal);
  scene.add(particles);

  function applyLightColors() {
    const p = plant.userData.pal;
    lA.color.set(p.lights[0]); lB.color.set(p.lights[1]); lC.color.set(p.lights[2]);
  }
  applyLightColors();

  // postprocessing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), cfg.bloomStrength, 0.5, 0.55);
  composer.addPass(bloom);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  // config updates
  function rebuildPlant() {
    scene.remove(plant);
    plant.traverse(o => { o.geometry?.dispose?.(); });
    plant.userData.petalMats?.forEach(m => { m.map?.dispose(); m.dispose(); });
    scene.remove(particles); particles.geometry.dispose();
    plant = buildPlant(cfg); scene.add(plant);
    particles = buildParticles(plant.userData.pal); scene.add(particles);
    applyLightColors();
  }
  window.addEventListener('sceneconfig', (e) => {
    const d = e.detail || {};
    const needRebuild = (d.palette && d.palette !== cfg.palette) ||
      (d.bloomCount && d.bloomCount !== cfg.bloomCount);
    Object.assign(cfg, d);
    if (needRebuild) rebuildPlant();
    else if (plant.userData.glowRef) {
      plant.userData.glowRef.value = cfg.glow;
      plant.userData.petalMats?.forEach(m => { m.emissiveIntensity = cfg.glow; });
    }
    bloom.strength = cfg.bloomStrength;
  });

  // animate
  const clock = new THREE.Clock();
  function tick() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    plant.rotation.y += dt * cfg.rotateSpeed * 0.35;
    particles.rotation.y -= dt * 0.02;
    particles.position.y = Math.sin(t * 0.2) * 0.3;
    lightGroup.rotation.y = Math.sin(t * 0.15) * 0.4;
    controls.update();
    composer.render();
    requestAnimationFrame(tick);
  }
  tick();
  return { scene, camera, cfg };
}
