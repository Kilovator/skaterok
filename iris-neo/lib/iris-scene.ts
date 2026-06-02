// @ts-nocheck
// cinematic 3D iris with interactive focus + film grain
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { getIrisConfig } from "@/lib/iris-config";

const D2R = THREE.MathUtils.degToRad;
const sm = (a, b, x) => { x = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
const ease = t => t * t * (3 - 2 * t);

/* ─── palettes ─────────────────────────────────────────────── */
const PALETTES = {
  spectral: { throat:'#19a8ff', mid:'#7b5cff', tip:'#ff5db0', beard:'#ff8a1e',
    lights:['#37c6ff','#9a5cff','#ff7a3c'], stem:'#2f8f6b', irid:[120,560], iridStrength:1.0 },
  violet: { throat:'#7a3cff', mid:'#c06bff', tip:'#ff9ad0', beard:'#ff9a3c',
    lights:['#9a4bff','#d06bff','#ff7e9e'], stem:'#5a6f8f', irid:[320,540], iridStrength:0.4 },
  cyan: { throat:'#10e0c4', mid:'#2aa6ff', tip:'#9ef0ff', beard:'#ffd06a',
    lights:['#22e6cf','#2aa6ff','#7fe6ff'], stem:'#2f8f8a', irid:[150,320], iridStrength:0.42 },
};

/* ─── procedural petal texture ─────────────────────────────── */
function drawPetalTexture(pal, type) {
  const W = 256, H = 512, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const c = cv.getContext('2d'), Y = t => H * (1 - t);
  const thr = new THREE.Color(pal.throat).getHexString();
  const mid = new THREE.Color(pal.mid).getHexString();
  const tip = new THREE.Color(pal.tip).getHexString();
  const g = c.createLinearGradient(0, H, 0, 0);
  g.addColorStop(0, '#fff3df'); g.addColorStop(0.14, '#' + thr);
  g.addColorStop(0.52, '#' + mid); g.addColorStop(1, '#' + tip);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // veins
  for (let k = 0; k < 64; k++) {
    const ex = (k / 63) * W;
    c.beginPath(); c.moveTo(W * .5, Y(.05));
    c.bezierCurveTo((W * .5 + ex) / 2 + Math.sin(k * 1.7) * 7, Y(.42),
      ex + Math.sin(k * 1.3) * 5, Y(.72), ex, Y(1));
    c.strokeStyle = k % 2 ? 'rgba(255,255,255,0.13)' : 'rgba(18,26,54,0.11)';
    c.lineWidth = k % 2 ? 0.7 : 1.3; c.stroke();
  }
  // midrib
  const mr = c.createLinearGradient(0, H, 0, 0);
  mr.addColorStop(0, 'rgba(255,255,255,0)'); mr.addColorStop(.12, 'rgba(255,255,255,0.55)');
  mr.addColorStop(.6, 'rgba(255,255,255,0.12)'); mr.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = mr; c.fillRect(W * .47, 0, W * .06, H);
  if (type === 'fall') {
    const tg = c.createRadialGradient(W * .5, Y(.14), 2, W * .5, Y(.14), W * .46);
    tg.addColorStop(0, 'rgba(255,250,236,0.92)'); tg.addColorStop(.5, 'rgba(255,244,224,0.34)');
    tg.addColorStop(1, 'rgba(255,244,224,0)');
    c.fillStyle = tg; c.fillRect(0, Y(.45), W, H);
    const bc = new THREE.Color(pal.beard);
    const br = Math.round(bc.r * 255), bg = Math.round(bc.g * 255), bb = Math.round(bc.b * 255);
    for (let i = 0; i < 320; i++) {
      const ty = .02 + Math.random() * .3, sp = W * .12 * (1 - ty * 1.6);
      const cx = W * .5 + (Math.random() - .5) * sp * 2, len = 3 + Math.random() * 8;
      c.strokeStyle = `rgba(${br},${bg},${bb},${(.45 + Math.random() * .45).toFixed(2)})`;
      c.lineWidth = 1.4; c.beginPath(); c.moveTo(cx, Y(ty)); c.lineTo(cx + (Math.random() - .5) * 4, Y(ty) - len); c.stroke();
    }
    const hc = c.createRadialGradient(W * .5, Y(.13), 1, W * .5, Y(.13), 30);
    hc.addColorStop(0, 'rgba(255,214,150,0.95)'); hc.addColorStop(1, 'rgba(255,180,90,0)');
    c.fillStyle = hc; c.fillRect(W * .5 - 34, Y(.13) - 34, 68, 68);
  }
  c.globalCompositeOperation = 'destination-in';
  const am = c.createLinearGradient(0, 0, W, 0);
  am.addColorStop(0, 'rgba(0,0,0,0)'); am.addColorStop(.07, 'rgba(0,0,0,1)');
  am.addColorStop(.93, 'rgba(0,0,0,1)'); am.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = am; c.fillRect(0, 0, W, H);
  const tf = c.createLinearGradient(0, 0, 0, H);
  tf.addColorStop(0, 'rgba(0,0,0,0.45)'); tf.addColorStop(.12, 'rgba(0,0,0,1)'); tf.addColorStop(1, 'rgba(0,0,0,1)');
  c.fillStyle = tf; c.fillRect(0, 0, W, H);
  c.globalCompositeOperation = 'source-over';
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  return tex;
}

/* ─── geometry ─────────────────────────────────────────────── */
function centerline(type) {
  const N = 56; let t0, t1, len, cup;
  if (type === 'fall')       { t0 = D2R(22); t1 = D2R(-86); len = 2.7; cup = -.30; }
  else if (type === 'style') { t0 = D2R(38); t1 = D2R(74);  len = 1.05; cup = .18; }
  else                       { t0 = D2R(78); t1 = D2R(162); len = 2.15; cup = .34; }
  const pts = [], nrm = []; let pos = new THREE.Vector3();
  for (let i = 0; i <= N; i++) {
    const t = i / N, th = t0 + (t1 - t0) * ease(t);
    const dir = new THREE.Vector3(Math.cos(th), Math.sin(th), 0);
    if (i > 0) pos = pos.clone().add(dir.clone().multiplyScalar(len / N));
    pts.push(pos.clone());
    nrm.push(new THREE.Vector3(-Math.sin(th), Math.cos(th), 0));
  }
  return { pts, nrm, N, cup };
}

function buildPetal(type) {
  const { pts, nrm, N, cup } = centerline(type);
  const M = 34;
  const maxW = type === 'fall' ? 1.06 : type === 'style' ? .34 : .92;
  const r1A = type === 'fall' ? .20 : type === 'style' ? .05 : .14;
  const r1F = type === 'fall' ? 9 : 7;
  const r2A = type === 'style' ? .02 : .07, r2F = 22;
  const positions = [], uvs = [];
  const wp = t => Math.pow(Math.sin(Math.PI * Math.pow(t, .7)), .6);
  for (let i = 0; i <= N; i++) {
    const t = i / N, P = pts[i], Nn = nrm[i], w = maxW * wp(t) + .03;
    for (let j = 0; j <= M; j++) {
      const s = j / M, v = s * 2 - 1, edge = Math.pow(Math.abs(v), 1.8);
      const ruffle = (r1A * Math.sin(v * r1F * Math.PI + i * .4) +
        r2A * Math.sin(v * r2F * Math.PI + i * .9)) * w * edge * (.4 + .95 * t);
      const cupOff = cup * w * v * v;
      positions.push(P.x + Nn.x * (cupOff + ruffle), P.y + Nn.y * (cupOff + ruffle), v * w);
      uvs.push(s, t);
    }
  }
  const idx = [], stride = M + 1;
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * stride + j; idx.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

/* ─── material ─────────────────────────────────────────────── */
function makePetalMat(pal, tex, glow) {
  const m = new THREE.MeshPhysicalMaterial({
    map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: glow,
    roughness: .42, metalness: 0, transmission: .30, thickness: .8, ior: 1.33,
    side: THREE.DoubleSide, transparent: true, depthWrite: true, alphaTest: .04,
    iridescence: pal.iridStrength, iridescenceIOR: 1.35,
    clearcoat: .5, clearcoatRoughness: .4, sheen: .7,
    sheenColor: new THREE.Color('#cfeaff'),
  });
  m.iridescenceThicknessRange = pal.irid;
  return m;
}

/* ─── beard ────────────────────────────────────────────────── */
function buildBeard(pal) {
  const g = new THREE.Group(); g.userData.part = 'beard';
  const col = new THREE.Color(pal.beard);
  const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.6, roughness: .5 });
  const { pts, nrm } = centerline('fall');
  for (let k = 0; k < 18; k++) {
    const t = .02 + (k / 18) * .30, i = Math.round(t * (pts.length - 1));
    const s = new THREE.Mesh(new THREE.SphereGeometry(.036 + .018 * Math.sin(k), 6, 6), mat);
    s.position.copy(pts[i]).add(nrm[i].clone().multiplyScalar(.05));
    s.position.z += (Math.random() - .5) * .06;
    s.userData.part = 'beard'; g.add(s);
  }
  return g;
}

/* ─── flower assembly ──────────────────────────────────────── */
function buildFlower(shared, open = 1) {
  const { matF, matS, matSt, geoF, geoS, geoSt, pal } = shared;
  const fl = new THREE.Group(); fl.userData.part = 'flower';
  const ct = 1 - open;
  for (let k = 0; k < 3; k++) {
    const ang = (k / 3) * Math.PI * 2;
    const fall = new THREE.Mesh(geoF, matF); fall.rotation.y = ang; fall.rotation.z = -ct * .9;
    fall.userData.part = 'fall';
    const beard = buildBeard(pal); beard.rotation.y = ang; beard.rotation.z = -ct * .9;
    const std = new THREE.Mesh(geoS, matS); std.rotation.y = ang + Math.PI / 3; std.rotation.z = ct * .5;
    std.userData.part = 'standard';
    const sty = new THREE.Mesh(geoSt, matSt); sty.rotation.y = ang; sty.position.y = .08;
    sty.userData.part = 'style';
    fl.add(fall, beard, std, sty);
  }
  const cMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(pal.beard), emissive: new THREE.Color(pal.beard),
    emissiveIntensity: 1.3, roughness: .4
  });
  const center = new THREE.Mesh(new THREE.SphereGeometry(.12, 16, 16), cMat);
  center.userData.part = 'center'; fl.add(center);
  return fl;
}

/* ─── asymmetric leaves ────────────────────────────────────── */
function buildLeaf(height, lean, twist, widthMul, mat) {
  const N = 34, M = 5, positions = [], uvs = [], idx = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, y = t * height;
    const curve = Math.sin(t * 1.2 + twist * .5) * lean * height;
    const sideCurve = Math.sin(t * 2.8 + twist) * .06 * height;
    const w = (.16 * widthMul) * Math.sin(Math.PI * Math.pow(t, .7)) * (1 - .3 * t) + .01;
    for (let j = 0; j <= M; j++) {
      const v = (j / M) * 2 - 1;
      positions.push(curve, y, v * w + sideCurve * v);
      uvs.push(j / M, t);
    }
  }
  const stride = M + 1;
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    const a = i * stride + j; idx.push(a, a + stride, a + 1, a + 1, a + stride, a + stride + 1);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, mat); m.userData.part = 'leaf';
  return m;
}

/* ─── stem + leaves ────────────────────────────────────────── */
function buildStem(pal) {
  const g = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -3.6, 0), new THREE.Vector3(.15, -2, .1),
    new THREE.Vector3(-.1, -.4, -.1), new THREE.Vector3(.12, 1.2, .08),
    new THREE.Vector3(-.05, 2.6, 0), new THREE.Vector3(0, 3.7, 0),
  ]);
  const stemMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(pal.stem), roughness: .45, transmission: .25,
    thickness: .4, transparent: true, opacity: .96,
    emissive: new THREE.Color(pal.stem), emissiveIntensity: .25, clearcoat: .4,
  });
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 80, .085, 12, false), stemMat);
  tube.userData.part = 'stem'; g.add(tube);
  const leafCol = new THREE.Color(pal.stem).offsetHSL(0, 0, -.04);
  const leafMat = stemMat.clone(); leafMat.opacity = .9; leafMat.color = leafCol;
  // asymmetric leaves with random parameters
  const leafParams = [
    { h: 4.2, lean: .22, twist: 0.0,  wm: 1.1, ang: 0.3 },
    { h: 3.6, lean: .18, twist: 1.4,  wm: .85, ang: 1.9 },
    { h: 4.8, lean: .28, twist: -.8,  wm: 1.0, ang: 3.4 },
    { h: 3.2, lean: .15, twist: 2.1,  wm: .75, ang: 4.8 },
    { h: 3.9, lean: .20, twist: -.3,  wm: .95, ang: 5.8 },
  ];
  leafParams.forEach(lp => {
    const leaf = buildLeaf(lp.h, lp.lean, lp.twist, lp.wm, leafMat);
    leaf.rotation.y = lp.ang; leaf.position.y = -3.6; g.add(leaf);
  });
  g.userData.curve = curve;
  return g;
}

/* ─── plant ────────────────────────────────────────────────── */
function buildPlant(cfg) {
  const pal = PALETTES[cfg.palette] || PALETTES.spectral;
  const plant = new THREE.Group(); plant.userData.pal = pal;
  const stem = buildStem(pal); plant.add(stem);
  const curve = stem.userData.curve;
  const geoF = buildPetal('fall'), geoS = buildPetal('standard'), geoSt = buildPetal('style');
  const texF = drawPetalTexture(pal, 'fall'), texS = drawPetalTexture(pal, 'standard');
  const matF = makePetalMat(pal, texF, cfg.glow);
  const matS = makePetalMat(pal, texS, cfg.glow);
  const matSt = makePetalMat(pal, texS, cfg.glow);
  const shared = { matF, matS, matSt, geoF, geoS, geoSt, pal };
  plant.userData.petalMats = [matF, matS, matSt];
  const count = cfg.bloomCount;
  const layout = count >= 4
    ? [{t:.99,s:.5,o:.3},{t:.86,s:1,o:1},{t:.68,s:1.12,o:1},{t:.5,s:1.05,o:1}]
    : [{t:.96,s:.6,o:.4},{t:.78,s:1.08,o:1},{t:.56,s:1.12,o:1}];
  layout.forEach((b, i) => {
    const fl = buildFlower(shared, b.o);
    fl.position.copy(curve.getPointAt(b.t)).add(new THREE.Vector3(0, .1, 0));
    fl.scale.setScalar(b.s); fl.rotation.set(-.12 - .1 * Math.sin(i), i * 2.2, 0);
    plant.add(fl);
  });
  return plant;
}

/* ─── particles ────────────────────────────────────────────── */
function buildParticles(pal) {
  const n = 400, pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const cA = new THREE.Color(pal.lights[0]), cB = new THREE.Color(pal.lights[1]), tmp = new THREE.Color();
  for (let i = 0; i < n; i++) {
    pos[i*3]=(Math.random()-.5)*12; pos[i*3+1]=(Math.random()-.5)*12; pos[i*3+2]=(Math.random()-.5)*8;
    tmp.copy(cA).lerp(cB, Math.random());
    col[i*3]=tmp.r; col[i*3+1]=tmp.g; col[i*3+2]=tmp.b;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({
    size: .045, vertexColors: true, transparent: true, opacity: .65,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  }));
}

/* ─── film grain shader ────────────────────────────────────── */
const FilmGrain = {
  uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uIntensity: { value: .08 } },
  vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader: `
    uniform sampler2D tDiffuse; uniform float uTime; uniform float uIntensity;
    varying vec2 vUv;
    float rand(vec2 co){return fract(sin(dot(co,vec2(12.9898,78.233)))*43758.5453);}
    void main(){
      vec4 c=texture2D(tDiffuse,vUv);
      float noise=rand(vUv*vec2(1024.)+vec2(uTime*100.))*2.-1.;
      c.rgb+=noise*uIntensity;
      // subtle vignette
      float d=length(vUv-.5)*1.4; c.rgb*=1.-d*d*.45;
      gl_FragColor=c;
    }`
};

/* ═══════════════════ INIT ═══════════════════════════════════ */
export function initIris(canvas: HTMLCanvasElement) {
  const cfg = Object.assign(
    {
      palette: "spectral",
      bloomCount: 3,
      glow: 0.35,
      bloomStrength: 0.62,
      rotateSpeed: 0.5,
    },
    getIrisConfig()
  );

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  // subtle depth fog
  scene.fog = new THREE.FogExp2(0x04060b, .028);

  const camera = new THREE.PerspectiveCamera(40, 1, .1, 100);
  camera.position.set(0, .9, 12.8);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = .08;
  controls.enablePan = false; controls.minDistance = 5; controls.maxDistance = 18;
  controls.target.set(0, .7, 0);

  // ── cinematic lighting ──
  scene.add(new THREE.AmbientLight(0x0e1624, .6));
  const lightGroup = new THREE.Group();
  const lA = new THREE.PointLight(0x37c6ff, 55, 40); lA.position.set(-5, 3, 4);
  const lB = new THREE.PointLight(0x9a5cff, 55, 40); lB.position.set(5, 1, 3);
  const lC = new THREE.PointLight(0xff7a3c, 30, 40); lC.position.set(0, -3, 5);
  const lTop = new THREE.DirectionalLight(0xbfe6ff, .7); lTop.position.set(0, 8, 2);
  // rim / backlight for cinematic edge glow
  const lRim = new THREE.PointLight(0x6090ff, 40, 30); lRim.position.set(0, 2, -6);
  lightGroup.add(lA, lB, lC, lRim);
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

  // ── postprocessing ──
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), cfg.bloomStrength, .5, .55);
  composer.addPass(bloom);
  const grainPass = new ShaderPass(FilmGrain);
  composer.addPass(grainPass);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); composer.setSize(w, h);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas); resize();

  // ── raycaster + click-to-focus ──
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let focused = null;
  const homePos = camera.position.clone();
  const homeTarget = controls.target.clone();
  const tweenState = { active: false, progress: 0, from: {}, to: {} };

  function getPartName(obj) {
    let o = obj;
    while (o) { if (o.userData.part) return o.userData.part; o = o.parent; }
    return null;
  }
  const PART_INFO = {
    fall:     { label: 'FALL TEPAL',     cam: [0, .5, 7] },
    standard: { label: 'STANDARD TEPAL', cam: [0, 1.8, 7] },
    beard:    { label: 'BEARD ARRAY',    cam: [0, .3, 6] },
    style:    { label: 'STYLE CREST',    cam: [0, .8, 6.5] },
    stem:     { label: 'PEDUNCLE',       cam: [1, -.5, 8] },
    leaf:     { label: 'ENSIFORM LEAF',  cam: [1.5, -2, 8] },
    center:   { label: 'GYNOECIUM',      cam: [0, .6, 5.5] },
  };

  function focusOn(partName, hitPoint) {
    const info = PART_INFO[partName]; if (!info) return;
    focused = partName;
    const target = hitPoint || new THREE.Vector3(0, .7, 0);
    tweenState.active = true; tweenState.progress = 0;
    tweenState.fromPos = camera.position.clone();
    tweenState.fromTarget = controls.target.clone();
    tweenState.toPos = new THREE.Vector3(...info.cam);
    tweenState.toTarget = target.clone();
    window.dispatchEvent(new CustomEvent('irisfocus', { detail: { part: partName, label: info.label } }));
  }
  function resetFocus() {
    if (!focused) return;
    focused = null;
    tweenState.active = true; tweenState.progress = 0;
    tweenState.fromPos = camera.position.clone();
    tweenState.fromTarget = controls.target.clone();
    tweenState.toPos = homePos.clone();
    tweenState.toTarget = homeTarget.clone();
    window.dispatchEvent(new CustomEvent('irisreset'));
  }

  // ── drag vs click detection (threshold 6px) ──
  let downX = 0, downY = 0;
  canvas.addEventListener('mousedown', e => { downX = e.clientX; downY = e.clientY; });
  canvas.addEventListener('mouseup', e => {
    const dx = e.clientX - downX, dy = e.clientY - downY;
    if (dx * dx + dy * dy > 36) return; // drag, not click
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(plant, true);
    if (hits.length) {
      const part = getPartName(hits[0].object);
      if (part && part !== focused) focusOn(part, hits[0].point);
      else if (part === focused) resetFocus();
    } else { resetFocus(); }
  });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') resetFocus(); });

  // ── hover tooltip ──
  const tooltip = document.createElement('div');
  tooltip.id = 'hover-tooltip'; tooltip.style.display = 'none';
  document.body.appendChild(tooltip);
  let hoveredPart = null;
  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(plant, true);
    if (hits.length) {
      const part = getPartName(hits[0].object);
      const info = PART_INFO[part];
      if (info) {
        hoveredPart = part;
        tooltip.textContent = info.label;
        tooltip.style.display = 'block';
        tooltip.style.left = (e.clientX + 14) + 'px';
        tooltip.style.top = (e.clientY - 8) + 'px';
        canvas.style.cursor = 'pointer';
        return;
      }
    }
    hoveredPart = null;
    tooltip.style.display = 'none';
    canvas.style.cursor = focused ? 'crosshair' : 'grab';
  });

  // ── rebuild ──
  function rebuildPlant() {
    scene.remove(plant);
    plant.traverse(o => o.geometry?.dispose?.());
    plant.userData.petalMats?.forEach(m => { m.map?.dispose(); m.dispose(); });
    scene.remove(particles); particles.geometry.dispose();
    plant = buildPlant(cfg); scene.add(plant);
    particles = buildParticles(plant.userData.pal); scene.add(particles);
    applyLightColors();
  }
  const onSceneConfig = (e: Event) => {
    const d = (e as CustomEvent).detail || {};
    const rebuild =
      (d.palette && d.palette !== cfg.palette) ||
      (d.bloomCount && d.bloomCount !== cfg.bloomCount);
    Object.assign(cfg, d);
    if (rebuild) rebuildPlant();
    else
      plant.userData.petalMats?.forEach((m: THREE.MeshPhysicalMaterial) => {
        m.emissiveIntensity = cfg.glow;
      });
    bloom.strength = cfg.bloomStrength;
  };
  window.addEventListener("sceneconfig", onSceneConfig);

  let rafId = 0;
  const clock = new THREE.Clock();
  const tick = () => {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;
    if (tweenState.active) {
      tweenState.progress = Math.min(tweenState.progress + dt * 1.6, 1);
      const p = ease(tweenState.progress);
      camera.position.lerpVectors(tweenState.fromPos, tweenState.toPos, p);
      controls.target.lerpVectors(tweenState.fromTarget, tweenState.toTarget, p);
      if (tweenState.progress >= 1) tweenState.active = false;
    }
    if (!focused && !tweenState.active)
      plant.rotation.y += dt * cfg.rotateSpeed * 0.35;
    particles.rotation.y -= dt * 0.02;
    particles.position.y = Math.sin(t * 0.2) * 0.3;
    lightGroup.rotation.y = Math.sin(t * 0.15) * 0.4;
    grainPass.uniforms.uTime.value = t;
    controls.update();
    composer.render();
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("sceneconfig", onSceneConfig);
    tooltip.remove();
    controls.dispose();
    renderer.dispose();
  };
}
