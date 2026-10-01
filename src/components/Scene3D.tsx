import { useEffect, useRef } from "react";
import * as THREE from "three";
import { sc } from "../lib/scroll";

const rnd = Math.random;

// ─────────────────────────────────────────────────────────────────
// Flame silhouette sampler (accurate Angaar shape)
// ─────────────────────────────────────────────────────────────────
function inFlame(x: number, y: number): boolean {
  if (y < -1.0 || y > 1.55 || Math.abs(x) > 1.0) return false;
  const t = (y + 1.0) / 2.55;
  // right wall — wide belly, tapers to sharp tip
  const right = 0.92 * Math.sin(Math.pow(t, 0.55) * Math.PI) + (1 - t) * 0.08;
  // left wall — characteristic inward notch at mid-height
  let left = -(0.84 * Math.sin(Math.pow(t, 0.60) * Math.PI) + (1 - t) * 0.08);
  if (t > 0.07 && t < 0.50) {
    const nt = (t - 0.07) / 0.43;
    left += Math.sin(nt * Math.PI) * 0.55; // notch bite
  }
  // tip leans right
  const lean = Math.pow(Math.max(0, t - 0.52) / 0.48, 2.2) * 0.20;
  return x >= left + lean * 0.35 && x <= right + lean;
}

function sampleFlameContour(n: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    let x = 0, y = 0;
    if (t < 0.44) {              // right flank (tip → base-right)
      const u = t / 0.44;
      y = 1.55 - u * 2.55;
      x = Math.sin(Math.pow(u, 0.58) * Math.PI * 0.92) * 0.92 + (1 - u) * 0.1;
    } else if (t < 0.68) {       // base arc (right → left)
      const u = (t - 0.44) / 0.24;
      y = -1.0 + u * 0.8;
      x = Math.cos(u * Math.PI) * 0.86;
    } else {                      // left notch tongue back to tip
      const u = (t - 0.68) / 0.32;
      y = -0.2 + u * 1.75;
      x = -0.62 + Math.sin(u * Math.PI) * 0.50 + u * 0.74;
    }
    pts.push([x, y]);
  }
  return pts;
}

function buildFlameCloud(n: number): Float32Array {
  const arr = new Float32Array(n * 3);
  let count = 0;
  // 40% on contour — makes outline crisp
  const contourPts = sampleFlameContour(Math.floor(n * 0.40));
  for (const [cx, cy] of contourPts) {
    if (count >= n) break;
    arr[count * 3]     = cx + (rnd() - 0.5) * 0.035;
    arr[count * 3 + 1] = cy + (rnd() - 0.5) * 0.035;
    arr[count * 3 + 2] = (rnd() - 0.5) * 0.20;
    count++;
  }
  // 60% interior fill
  let tries = 0;
  while (count < n && tries < n * 35) {
    tries++;
    const x = (rnd() - 0.5) * 2.1;
    const y = rnd() * 2.55 - 1.0;
    if (!inFlame(x, y)) continue;
    const d = Math.max(0.05, (1 - Math.abs(x) / 0.9) * 0.70);
    arr[count * 3]     = x;
    arr[count * 3 + 1] = y;
    arr[count * 3 + 2] = (rnd() - 0.5) * d;
    count++;
  }
  return arr;
}

// ─────────────────────────────────────────────────────────────────
// Per-particle "home" = rest position in flame, "away" = drifted
// We'll lerp between them based on scroll
// ─────────────────────────────────────────────────────────────────
export default function Scene3D() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const M = window.innerWidth < 768;
    const R = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ── Renderer ──────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas: cv, antialias: true, alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x070605, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 200);
    camera.position.z = 7.0;

    const resize = () => {
      renderer.setSize(innerWidth, innerHeight, false);
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // ── Particle budget ───────────────────────────────────────────
    const N = M ? 5000 : 11000;

    // ── Build rest positions (flame shape) ────────────────────────
    const restPos = buildFlameCloud(N); // the logo home

    // ── Build "explode" scatter positions ─────────────────────────
    // Each particle has a unique ember destination — a wide field
    const scatterPos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      // Embers scatter in a wide cone upward and sideways
      const angle = (rnd() - 0.5) * Math.PI * 2.4;
      const dist  = 1.0 + rnd() * 14.0;
      const rise  = rnd() * rnd() * 8.0; // biased upward
      scatterPos[i * 3]     = Math.sin(angle) * dist;
      scatterPos[i * 3 + 1] = rise - 2.0 + (rnd() - 0.5) * 4.0;
      scatterPos[i * 3 + 2] = Math.cos(angle) * dist * 0.5 - 2.0 - rnd() * 5;
    }

    // ── Live position buffer (CPU-interpolated) ───────────────────
    const livePos = new Float32Array(N * 3);
    for (let k = 0; k < N * 3; k++) livePos[k] = restPos[k];

    // ── Per-particle attributes ───────────────────────────────────
    const aColor  = new Float32Array(N * 3);
    const aSize   = new Float32Array(N);
    const aPhase  = new Float32Array(N);
    const aSpeed  = new Float32Array(N);
    const aHeight = new Float32Array(N); // 0=base, 1=tip — for fire physics

    const cWhiteHot = new THREE.Color(1.00, 0.98, 0.88);
    const cGold     = new THREE.Color(1.00, 0.78, 0.08);
    const cAmber    = new THREE.Color(1.00, 0.42, 0.01);
    const cEmber    = new THREE.Color(0.86, 0.14, 0.00);
    const cDeep     = new THREE.Color(0.55, 0.06, 0.00);

    for (let i = 0; i < N; i++) {
      const isContour = i < Math.floor(N * 0.40);
      // Height-based color (use rest Y position)
      const ry = restPos[i * 3 + 1]; // -1.0 → +1.55
      const h  = Math.max(0, Math.min(1, (ry + 1.0) / 2.55));
      aHeight[i] = h;

      const c = new THREE.Color();
      if      (h > 0.82) c.copy(cGold).lerp(cWhiteHot, (h - 0.82) / 0.18);
      else if (h > 0.55) c.copy(cAmber).lerp(cGold,    (h - 0.55) / 0.27);
      else if (h > 0.28) c.copy(cEmber).lerp(cAmber,   (h - 0.28) / 0.27);
      else               c.copy(cDeep).lerp(cEmber,    h / 0.28);

      // Contour gets slightly hotter look
      if (isContour) c.lerp(cAmber, 0.25);

      aColor[i * 3]     = c.r;
      aColor[i * 3 + 1] = c.g;
      aColor[i * 3 + 2] = c.b;

      // Tip particles are smaller (sharp tip), belly is bigger
      const belly = Math.sin(h * Math.PI);
      aSize[i]  = (M ? 0.058 : 0.050) * (isContour ? 1.30 : 0.80) * (0.6 + belly * 0.7 + rnd() * 0.4);
      aPhase[i] = rnd() * Math.PI * 2;
      aSpeed[i] = 0.5 + rnd() * 1.2;
    }

    // ── Geometry ──────────────────────────────────────────────────
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(livePos,  3));
    geo.setAttribute("aColor",   new THREE.BufferAttribute(aColor,   3));
    geo.setAttribute("aSize",    new THREE.BufferAttribute(aSize,    1));
    geo.setAttribute("aPhase",   new THREE.BufferAttribute(aPhase,   1));
    geo.setAttribute("aSpeed",   new THREE.BufferAttribute(aSpeed,   1));
    geo.setAttribute("aHeight",  new THREE.BufferAttribute(aHeight,  1));

    // ── Shader ────────────────────────────────────────────────────
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime:       { value: 0 },
        uPixelRatio: { value: Math.min(devicePixelRatio, 2) },
        uScatter:    { value: 0 }, // 0=flame logo, 1=fully scattered
      },
      vertexShader: /* glsl */`
        uniform float uTime;
        uniform float uPixelRatio;
        uniform float uScatter;

        attribute vec3  aColor;
        attribute float aSize;
        attribute float aPhase;
        attribute float aSpeed;
        attribute float aHeight;

        varying vec3  vColor;
        varying float vSparkle;
        varying float vAlpha;

        void main() {
          vec3 p = position;

          // ── Fire physics only while in flame form ──────────────
          float flameness = 1.0 - uScatter;

          // 1) Upward flicker: tip particles rise fastest
          float riseAmp = aHeight * aHeight * 0.055 * flameness;
          p.y += sin(uTime * aSpeed * 2.8 + aPhase) * riseAmp;

          // 2) Side sway: stronger near tip, sine-wave
          float swayAmp = (0.8 - aHeight * 0.5) * 0.030 * flameness;
          p.x += sin(uTime * 2.0 + aPhase + p.y * 1.8) * swayAmp;

          // 3) Depth shimmer
          p.z += sin(uTime * 1.4 + aPhase) * 0.014 * flameness;

          // ── Scattered: particles slowly drift (as glowing embers) 
          float scatterDrift = uScatter;
          p.y += sin(uTime * 0.6 + aPhase) * 0.08 * scatterDrift;
          p.x += cos(uTime * 0.5 + aPhase * 1.3) * 0.06 * scatterDrift;

          vec4 mvp = modelViewMatrix * vec4(p, 1.0);

          // ── Sparkle: sharp diamond twinkle ─────────────────────
          float s = sin(uTime * (2.2 + aSpeed * 3.5) + aPhase * 6.28);
          vSparkle = clamp(s * s * s * s, 0.0, 1.0);

          // Scattered particles are dimmer (long-distance embers)
          vAlpha = mix(1.0, 0.35 + aHeight * 0.5, uScatter);
          vColor = aColor;

          float szMul = 1.0 + vSparkle * 2.0;
          // Scattered particles shrink slightly (perspective depth)
          szMul *= mix(1.0, 0.65, uScatter);
          gl_PointSize = aSize * szMul * uPixelRatio * (260.0 / -mvp.z);
          gl_Position  = projectionMatrix * mvp;
        }
      `,
      fragmentShader: /* glsl */`
        varying vec3  vColor;
        varying float vSparkle;
        varying float vAlpha;

        void main() {
          vec2  uv   = gl_PointCoord - 0.5;
          float dist = length(uv);
          if (dist > 0.5) discard;

          // Smooth radial glow
          float core = pow(1.0 - smoothstep(0.0, 0.50, dist), 1.6);

          // 4-point diamond sparkle spike
          float sH = max(0.0, 1.0 - abs(uv.y) * 20.0) * max(0.0, 1.0 - abs(uv.x) * 3.2);
          float sV = max(0.0, 1.0 - abs(uv.x) * 20.0) * max(0.0, 1.0 - abs(uv.y) * 3.2);
          float spike = (sH + sV) * vSparkle * 0.90;

          vec3 hotWhite = vec3(1.0, 0.96, 0.80);
          vec3 col = mix(vColor, hotWhite, vSparkle * 0.80 + spike * 0.55);
          float alpha = clamp((core * 1.1 + spike * 1.3) * vAlpha, 0.0, 1.0);
          gl_FragColor = vec4(col, alpha);
        }
      `,
      transparent: true,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });

    const group = new THREE.Group();
    group.add(new THREE.Points(geo, mat));
    scene.add(group);

    // ── Ambient ember field (always visible, drifts upward) ───────
    const EC = M ? 220 : 480;
    const ePos = new Float32Array(EC * 3);
    const eVel = new Float32Array(EC);
    const eWig = new Float32Array(EC);
    const eBri = new Float32Array(EC); // brightness
    for (let i = 0; i < EC; i++) {
      ePos[i * 3]     = (rnd() - 0.5) * 32;
      ePos[i * 3 + 1] = rnd() * 22 - 11;
      ePos[i * 3 + 2] = 1 - rnd() * 40;
      eVel[i] = 0.008 + rnd() * 0.022;
      eWig[i] = rnd() * Math.PI * 2;
      eBri[i] = 0.3 + rnd() * 0.7;
    }
    const eGeo = new THREE.BufferGeometry();
    eGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
    const eMat = new THREE.PointsMaterial({
      size: 0.038, color: 0xff7711,
      transparent: true, opacity: 0.55,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const emberMesh = new THREE.Points(eGeo, eMat);
    scene.add(emberMesh);

    // ── Mouse parallax ────────────────────────────────────────────
    let mx = 0, my = 0, smx = 0, smy = 0;
    const onPtr = (e: PointerEvent) => {
      mx = (e.clientX / innerWidth)  * 2 - 1;
      my = (e.clientY / innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPtr, { passive: true });

    // ── Scroll-driven layout ──────────────────────────────────────
    // scroll 0→0.25: flame logo at rest, gentle right offset
    // scroll 0.25→0.6: flame explodes → particles scatter outward
    // scroll 0.6→1.0: full scatter — embers fill the void, slow drift
    const LOGO_X = M ? 0 : 2.1;
    const LOGO_Y = M ? 1.0 : 0.0;
    const LOGO_S = M ? 2.5 : 2.85;

    const clock = new THREE.Clock();
    let scrollCur = 0;
    let animId = 0;

    const smooth = (x: number) => x * x * (3 - 2 * x); // smoothstep

    const loop = () => {
      animId = requestAnimationFrame(loop);
      const t = R ? 0 : clock.getElapsedTime();

      mat.uniforms.uTime.value = t;
      scrollCur += (sc.p - scrollCur) * (R ? 1 : 0.055);
      smx += (mx - smx) * 0.04;
      smy += (my - smy) * 0.04;

      // ── Scatter factor: 0 when scroll<0.25, rises to 1 at 0.65
      const scatterRaw = Math.max(0, Math.min(1, (scrollCur - 0.22) / 0.38));
      const scatter    = smooth(scatterRaw);
      mat.uniforms.uScatter.value = scatter;

      // ── CPU morph: lerp each particle from rest → scatter pos ──
      for (let k = 0; k < N * 3; k++) {
        livePos[k] = restPos[k] + (scatterPos[k] - restPos[k]) * scatter;
      }
      geo.attributes.position.needsUpdate = true;

      // ── Group transform ────────────────────────────────────────
      const posX  = (LOGO_X + smx * 0.4) * (1 - scatter * 0.5);
      const posY  = (LOGO_Y - smy * 0.28) * (1 - scatter * 0.4);
      const scale = LOGO_S * (1 - scatter * 0.35) * (1 + Math.sin(t * 1.3) * 0.022);
      const rotY  = t * 0.14 * (1 - scatter * 0.8) + smx * 0.30;
      const rotZ  = Math.sin(t * 0.7) * 0.035 * (1 - scatter);

      group.position.set(posX, posY, 0);
      group.scale.setScalar(scale);
      group.rotation.set(-smy * 0.12 * (1 - scatter), rotY, rotZ);

      // ── Embers ────────────────────────────────────────────────
      const ep = eGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < EC; i++) {
        ep[i * 3 + 1] += eVel[i] * (1 + scatter * 2.0); // faster when scattered
        ep[i * 3]     += Math.sin(t * 0.85 + eWig[i]) * 0.004;
        if (ep[i * 3 + 1] > 11) ep[i * 3 + 1] = -11;
      }
      eGeo.attributes.position.needsUpdate = true;
      eMat.opacity = 0.45 + scatter * 0.45; // embers become brighter as scatter grows

      // ── Camera subtle parallax ─────────────────────────────────
      camera.position.set(smx * 0.4, -smy * 0.28, 7.0);
      camera.rotation.set(-smy * 0.025, -smx * 0.03, scrollCur * 0.8 * (1 - scatter * 0.7));
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPtr);
      geo.dispose(); eGeo.dispose(); mat.dispose(); eMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-0 h-full w-full pointer-events-none"
    />
  );
}
