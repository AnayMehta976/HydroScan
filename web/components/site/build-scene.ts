/**
 * Three.js model of the HydroScan prototype, built from the real device:
 * base, open chamber (black outside, white inside) with one LED strip on three walls,
 * a rectangular glass dish, and a top housing holding the Raspberry Pi,
 * the downward camera and the 16×2 LCD. Units are roughly centimetres.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export { LABELS } from "./build-labels";
export type { BuildLabel } from "./build-labels";

type Part = {
  obj: THREE.Object3D;
  home: THREE.Vector3;
  off: THREE.Vector3;
  delay: number;
  label?: number;
  anchor: THREE.Vector3; // local to obj
  line?: THREE.Line;
  t: number;
};

const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export type BuildScene = {
  render: (e: number, yaw: number, w: number, h: number) => void;
  /** Screen positions of each label's anchor (px), plus how separated that part is (0–1). */
  anchors: () => { n: number; x: number; y: number; t: number }[];
  resize: (w: number, h: number, dpr: number) => void;
  dispose: () => void;
  canvas: HTMLCanvasElement;
};

async function lcdTexture() {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 128;
  const g = c.getContext("2d")!;
  try { await document.fonts.load('52px "VT323"'); } catch { /* fallback font */ }
  g.fillStyle = "#1f46e0";
  g.fillRect(0, 0, 512, 128);
  g.fillStyle = "rgba(255,255,255,.14)";
  g.fillRect(0, 0, 512, 40);
  g.fillStyle = "#e8eeff";
  g.font = '52px "VT323", monospace';
  g.fillText("HydroScan Ready", 22, 56);
  g.fillText("Press to scan", 22, 108);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export async function createBuildScene(dpr: number): Promise<BuildScene> {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = env;

  const camera = new THREE.PerspectiveCamera(28, 1, 1, 600);

  scene.add(new THREE.HemisphereLight(0xeaf4ff, 0x9aa7b3, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.7);
  key.position.set(30, 60, 45);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fd8ff, 0.8);
  rim.position.set(-40, 20, -30);
  scene.add(rim);

  const model = new THREE.Group();
  scene.add(model);

  // ---------- materials ----------
  const black = new THREE.MeshStandardMaterial({ color: 0x1b1f24, roughness: 0.82, metalness: 0 });
  const lining = new THREE.MeshStandardMaterial({ color: 0xf1f5f8, roughness: 0.9 });
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x4a6075, transparent: true, opacity: 0.85 });
  const pcbGreen = new THREE.MeshStandardMaterial({ color: 0x1f7a43, roughness: 0.55 });
  const pcbDark = new THREE.MeshStandardMaterial({ color: 0x14181c, roughness: 0.5 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xc3ccd6, roughness: 0.32, metalness: 0.85 });
  const plasticBlue = new THREE.MeshStandardMaterial({ color: 0x1663d6, roughness: 0.4 });
  const ledBase = new THREE.MeshStandardMaterial({ color: 0x2b3038, roughness: 0.5, metalness: 0.3 });
  const ledChip = new THREE.MeshStandardMaterial({ color: 0xfff0c2, emissive: 0xffd978, emissiveIntensity: 1.8 });
  const redLed = new THREE.MeshStandardMaterial({ color: 0xff2a1a, emissive: 0xff2a1a, emissiveIntensity: 3 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xcfe6f7, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.32, envMapIntensity: 1.6, clearcoat: 1, depthWrite: false });
  const glassEdge = new THREE.LineBasicMaterial({ color: 0x6f9dc2, transparent: true, opacity: 0.9 });
  const water = new THREE.MeshStandardMaterial({ color: 0x2f86e0, roughness: 0.15, transparent: true, opacity: 0.5, depthWrite: false });
  const bankMat = new THREE.MeshStandardMaterial({ color: 0x2b3440, roughness: 0.45, metalness: 0.25 });
  const lcdMat = new THREE.MeshBasicMaterial({ map: await lcdTexture(), toneMapped: false });

  const rbox = (w: number, h: number, d: number, mat: THREE.Material, r = 0.15, edges = true) => {
    const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), mat);
    if (edges) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d), 30), edgeMat);
      m.add(e);
    }
    return m;
  };

  const parts: Part[] = [];
  const add = (obj: THREE.Object3D, home: [number, number, number], off: [number, number, number], delay: number, anchor: [number, number, number], label?: number, dashed = true) => {
    obj.position.set(...home);
    model.add(obj);
    const p: Part = { obj, home: new THREE.Vector3(...home), off: new THREE.Vector3(...off), delay, label, anchor: new THREE.Vector3(...anchor), t: 0 };
    if (dashed) {
      const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
      p.line = new THREE.Line(g, new THREE.LineDashedMaterial({ color: 0x1663d6, dashSize: 0.8, gapSize: 0.6, transparent: true, opacity: 0.7 }));
      model.add(p.line);
    }
    parts.push(p);
  };

  // ---------- base ----------
  const base = new THREE.Group();
  base.add(rbox(24, 6, 20, black, 0.2));
  const floor = new THREE.Mesh(new THREE.BoxGeometry(22.8, 0.06, 18.8), lining);
  floor.position.y = 3.02;
  base.add(floor);
  add(base, [0, 3, 0], [0, -7, 0], 0.06, [-11, 0, 9], 9);

  // ---------- chamber walls ----------
  const wall = (w: number, h: number, d: number, innerAxis: "x" | "z", sign: number) => {
    const g = new THREE.Group();
    g.add(rbox(w, h, d, black, 0.08));
    const inner = new THREE.Mesh(new THREE.BoxGeometry(innerAxis === "x" ? 0.04 : w - 0.4, h - 0.2, innerAxis === "z" ? 0.04 : d - 0.4), lining);
    if (innerAxis === "x") inner.position.x = sign * (w / 2 + 0.03);
    else inner.position.z = sign * (d / 2 + 0.03);
    g.add(inner);
    return g;
  };
  add(wall(0.6, 8, 20, "x", 1), [-11.7, 10, 0], [-11, 0, 0], 0.1, [-0.3, 2, 0], 7);
  add(wall(0.6, 8, 20, "x", -1), [11.7, 10, 0], [11, 0, 0], 0.1, [0, 0, 0]);
  add(wall(24, 8, 0.6, "z", 1), [0, 10, -9.7], [0, 0, -9], 0.1, [0, 0, 0]);

  // ---------- LED strip: one continuous strip along three inside walls, at dish height ----------
  const strip = (len: number) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.6, len), ledBase));
    const n = Math.round(len / 1.2);
    for (let i = 0; i < n; i++) {
      const chip = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.32, 0.5), ledChip);
      chip.position.set(0.1, 0, -len / 2 + 0.6 + i * 1.2);
      g.add(chip);
    }
    const light = new THREE.PointLight(0xfff1d8, 20, 30, 1.6);
    light.position.set(1.5, 0.5, 0);
    g.add(light);
    return g;
  };
  const LED_Y = 8.2;
  const sl = strip(18.6);
  add(sl, [-11.25, LED_Y, -0.4], [-5.5, 0, 0], 0.16, [0, 0, 6], 6);
  const sb = strip(22.5);
  sb.rotation.y = -Math.PI / 2;
  add(sb, [0, LED_Y, -9.25], [0, 0, -5], 0.16, [0, 0, 0]);
  const sr = strip(18.6);
  sr.rotation.y = Math.PI;
  add(sr, [11.25, LED_Y, -0.4], [5.5, 0, 0], 0.16, [0, 0, 0]);

  // ---------- glass dish with water ----------
  const dish = new THREE.Group();
  const dw = 14, dh = 4.6, dd = 10, t = 0.35;
  const dishShell = (w: number, h: number, d: number) => new RoundedBoxGeometry(w, h, d, 3, 0.9);
  const outer = new THREE.Mesh(dishShell(dw, dh, dd), glass);
  outer.renderOrder = 2;
  outer.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(dw - 0.6, dh, dd - 0.6)), glassEdge));
  dish.add(outer);
  const wat = new THREE.Mesh(new RoundedBoxGeometry(dw - 2 * t, 2.6, dd - 2 * t, 3, 0.6), water);
  wat.position.y = -dh / 2 + t + 1.3;
  dish.add(wat);
  const pts = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xcff6ff, emissiveIntensity: 0.6 }), 46);
  const deb = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: 0xa86a2a, roughness: 0.8 }), 5);
  const m4 = new THREE.Matrix4();
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 46; i++) {
    const s = 0.05 + rnd() * 0.09;
    m4.compose(new THREE.Vector3((rnd() - 0.5) * 12, -dh / 2 + 0.6 + rnd() * 2.1, (rnd() - 0.5) * 8), new THREE.Quaternion(), new THREE.Vector3(s, s, s));
    pts.setMatrixAt(i, m4);
  }
  for (let i = 0; i < 5; i++) {
    const s = 0.14 + rnd() * 0.08;
    m4.compose(new THREE.Vector3((rnd() - 0.5) * 11, -dh / 2 + 0.6 + rnd() * 1.8, (rnd() - 0.5) * 7), new THREE.Quaternion(), new THREE.Vector3(s, s * 0.7, s));
    deb.setMatrixAt(i, m4);
  }
  dish.add(pts, deb);
  add(dish, [0, 6 + dh / 2 + 0.05, 1], [0, 0.5, 15], 0.22, [dw / 2, 0, 0], 8);

  // ---------- top housing ----------
  const housing = new THREE.Group();
  housing.add(rbox(24, 8, 20, black, 0.25));
  const lcdWindow = new THREE.Mesh(new THREE.BoxGeometry(7.4, 2.4, 0.05), new THREE.MeshStandardMaterial({ color: 0x07090c, roughness: 0.6 }));
  lcdWindow.position.set(0, 0, 10.01);
  housing.add(lcdWindow);
  add(housing, [0, 18, 0], [0, 27, 0], 0, [-11, 3, -4], 2);

  // scan button (rides on the housing, then lifts a little further)
  const btn = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.5, 32), metal);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.7, 32), plasticBlue);
  cap.position.y = 0.45;
  btn.add(ring, cap);
  add(btn, [7, 22.25, 4], [0, 31, 0], 0.02, [0, 0.9, 0], 1);

  // ---------- 16×2 LCD (screen + green PCB + I2C backpack) ----------
  const lcd = new THREE.Group();
  const pcb = new THREE.Mesh(new THREE.BoxGeometry(8, 3.6, 0.16), pcbGreen);
  pcb.position.z = -0.25;
  const bezel = rbox(7.2, 2.6, 0.5, new THREE.MeshStandardMaterial({ color: 0x0a0d10, roughness: 0.5 }), 0.06, false);
  bezel.position.z = 0.05;
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 1.65), lcdMat);
  screen.position.z = 0.31;
  const backpack = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.9, 0.12), new THREE.MeshStandardMaterial({ color: 0x15305e, roughness: 0.6 }));
  backpack.position.set(0, -0.2, -0.45);
  lcd.add(pcb, bezel, screen, backpack);
  add(lcd, [0, 18.3, 9.95], [0, 9, 13], 0.05, [3.4, 0.6, 0.3], 3);

  // ---------- Raspberry Pi 4 in its case ----------
  const pi = new THREE.Group();
  pi.add(rbox(9.4, 2.6, 6.6, new THREE.MeshStandardMaterial({ color: 0x15181c, roughness: 0.55 }), 0.45));
  const usbA = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.5, 1.4), metal);
  usbA.position.set(4.75, 0.1, -1.6);
  const usbB = usbA.clone();
  usbB.position.z = 0.4;
  const eth = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.6, 1.6), metal);
  eth.position.set(4.85, 0.15, 2.3);
  const header = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.5, 0.55), new THREE.MeshStandardMaterial({ color: 0x0b0b0b }));
  header.position.set(-0.6, 1.5, -2.6);
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.25), redLed);
  led.position.set(-4.2, 1.35, 2.6);
  const wireCols = [0xe53935, 0xfdd835, 0x43a047, 0x1e88e5, 0x8e24aa];
  wireCols.forEach((c, i) => {
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 6), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }));
    wire.position.set(-2.6 + i * 0.8, 1.75, -2.6);
    pi.add(wire);
  });
  pi.add(usbA, usbB, eth, header, led);
  add(pi, [-2, 19.6, -3], [0, 16, -2], 0.1, [-4.7, 0.6, 0], 4);

  // ---------- Camera Module v3 NOIR (pointing down) ----------
  const cam = new THREE.Group();
  cam.add(new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.16, 2.4), pcbDark));
  const lensBody = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.5, 0.85), new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.4 }));
  lensBody.position.y = -0.33;
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 24), new THREE.MeshPhysicalMaterial({ color: 0x1a2a4a, roughness: 0.05, metalness: 0.4, clearcoat: 1 }));
  lens.position.y = -0.65;
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 3.2), new THREE.MeshStandardMaterial({ color: 0xece6d6, roughness: 0.9 }));
  ribbon.position.set(0, 0.12, -2.6);
  cam.add(lensBody, lens, ribbon);
  add(cam, [-2, 18.4, 1.6], [0, 8, 1.5], 0.14, [0.6, -0.65, 0], 5);

  // ---------- USB-C power bank (outside, behind the box) ----------
  const bank = new THREE.Group();
  bank.add(rbox(7, 2, 14, bankMat, 0.7, false));
  const port = new THREE.Mesh(new THREE.BoxGeometry(1, 0.35, 0.1), new THREE.MeshStandardMaterial({ color: 0x0a0a0a }));
  port.position.set(0, 0, 7.02);
  const dot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.6), new THREE.MeshStandardMaterial({ color: 0x5cd6f5, emissive: 0x5cd6f5, emissiveIntensity: 1.5 }));
  dot.position.set(2, 1.02, 5);
  bank.add(port, dot);
  bank.rotation.y = -0.25;
  add(bank, [17, 1, -9], [9, 0, -4], 0.24, [3.5, 1, 0], 10, false);

  // soft contact shadow
  const sc = document.createElement("canvas");
  sc.width = sc.height = 128;
  const sg = sc.getContext("2d")!;
  const grad = sg.createRadialGradient(64, 64, 4, 64, 64, 64);
  grad.addColorStop(0, "rgba(11,34,54,.38)");
  grad.addColorStop(1, "rgba(11,34,54,0)");
  sg.fillStyle = grad;
  sg.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(46, 38), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -0.02;
  model.add(shadow);

  // ---------- per-frame ----------
  const v = new THREE.Vector3();
  const a0 = new THREE.Vector3();
  const a1 = new THREE.Vector3();
  let W = 1, H = 1;

  const render = (e: number, yaw: number, w: number, h: number) => {
    W = w; H = h;
    for (const p of parts) {
      p.t = smooth(clamp01((e * 1.3 - p.delay) / 1));
      p.obj.position.copy(p.home).addScaledVector(p.off, p.t);
      if (p.line) {
        a0.copy(p.home).add(p.anchor);
        a1.copy(p.obj.position).add(p.anchor);
        const pos = p.line.geometry.attributes.position as THREE.BufferAttribute;
        pos.setXYZ(0, a0.x, a0.y, a0.z);
        pos.setXYZ(1, a1.x, a1.y, a1.z);
        pos.needsUpdate = true;
        p.line.computeLineDistances();
        p.line.visible = p.t > 0.02;
      }
    }
    shadow.position.y = base.position.y - 3 - 0.02;
    shadow.scale.setScalar(1 + e * 0.5);
    model.rotation.y = yaw;

    // Frame the model: assembled it is ~23 cm tall, exploded ~55 cm.
    const aspect = w / h;
    const ty = THREE.MathUtils.lerp(10.5, 24.5, e);
    const height = THREE.MathUtils.lerp(40, 68, e);
    const width = THREE.MathUtils.lerp(48, 64, e);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distH = height / 2 / Math.tan(fov / 2);
    const distW = width / 2 / Math.tan(fov / 2) / aspect;
    const dist = Math.max(distH, distW);
    const elev = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(24, 16, e));
    camera.aspect = aspect;
    camera.position.set(0, ty + Math.sin(elev) * dist, Math.cos(elev) * dist);
    camera.lookAt(0, ty, 0);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  const anchors = () => {
    model.updateMatrixWorld();
    return parts.filter((p) => p.label).map((p) => {
      v.copy(p.anchor).applyMatrix4(p.obj.matrixWorld).project(camera);
      return { n: p.label!, x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, t: p.t };
    });
  };

  const resize = (w: number, h: number, d: number) => {
    renderer.setPixelRatio(d);
    renderer.setSize(w, h, false);
  };

  const dispose = () => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => x.dispose());
    });
    env.dispose();
    pmrem.dispose();
    renderer.dispose();
  };

  return { render, anchors, resize, dispose, canvas: renderer.domElement };
}
