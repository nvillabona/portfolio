import * as THREE from "three";

/**
 * Procedural memoji head, modelled from front, side, back, top and 3/4
 * reference views. The head faces +z; it is about 2.2 units from chin to
 * the top of the hair, and every measurement below was taken from the
 * reference sheet at that scale.
 */

const SKIN = 0xf7e4d6;
const SKIN_SHADE = 0xeecbb5;
const LIP = 0xc79284;
const HAIR = 0x2f2d2c;
const BROW = 0x4d4a48;
const IRIS = 0x6a5a48;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Maps a unit direction to a point on the skull.
 *
 * From the reference: the face is ~1.6 wide at the cheeks and ~2 tall to the
 * top of the skull; seen from the side the head is deeper than it is wide,
 * with a flat, upright face, the ears ~64% of the way back, and a jaw that
 * rises from the chin toward the back of the head.
 */
function skull(d: THREE.Vector3) {
  // A flatter-fronted superellipsoid, so the face reads as a broad plane.
  const n = d.z > 0 ? 2.3 : 2.05;
  const s =
    (Math.abs(d.x) ** n + Math.abs(d.y) ** n + Math.abs(d.z) ** n) ** (1 / n);
  const u = d.clone().divideScalar(s);

  // Full cheeks, slightly narrower temples, and a jaw that narrows into a
  // soft, rounded chin.
  let rx = 0.8 + 0.08 * Math.exp(-(((u.y + 0.3) / 0.45) ** 2));
  // A broad, rounded crown rather than a narrow dome.
  rx += 0.07 * smoothstep(0.2, 0.85, u.y);
  rx *= 1 - 0.2 * smoothstep(-0.5, -1, u.y);
  // The chin sits low in front and the underside rises toward the back.
  const ry = u.y > 0 ? 0.96 : lerp(0.58, 1.02, smoothstep(-0.55, 0.5, u.z));
  const rz = u.z > 0 ? 0.86 : 0.84;

  const p = new THREE.Vector3(u.x * rx, u.y * ry, u.z * rz);
  // The middle of the face comes forward of the cheeks, so the profile
  // (brow, nose, lips, chin) shows from the side.
  const front = smoothstep(0.2, 0.9, u.z);
  p.z += 0.13 * Math.exp(-((u.x / 0.42) ** 2)) * smoothstep(0.45, -0.1, u.y) * smoothstep(-1.05, -0.6, u.y) * front;
  p.z += 0.05 * Math.exp(-(((u.y + 0.5) / 0.3) ** 2)) * front;
  return p;
}

/** Outward normal of the skull at a direction, by finite differences. */
function normalAt(d: THREE.Vector3) {
  const p = skull(d);
  const t1 = new THREE.Vector3(-d.z, 0, d.x);
  if (t1.lengthSq() < 1e-6) t1.set(1, 0, 0);
  t1.normalize();
  const t2 = new THREE.Vector3().crossVectors(d, t1).normalize();
  const e = 0.01;
  const a = skull(d.clone().addScaledVector(t1, e).normalize()).sub(p);
  const b = skull(d.clone().addScaledVector(t2, e).normalize()).sub(p);
  const n = new THREE.Vector3().crossVectors(a, b).normalize();
  if (n.dot(p) < 0) n.negate();
  return n;
}

/**
 * The point on the face whose x and y (as seen from the front) are the given
 * ones, with the surface normal there. Used to place features exactly where
 * the front view shows them.
 */
function onFace(x: number, y: number) {
  const d = new THREE.Vector3(x, y, 0.8).normalize();
  for (let i = 0; i < 30; i++) {
    const p = skull(d);
    d.x += (x - p.x) * 0.9;
    d.y += (y - p.y) * 0.9;
    d.normalize();
  }
  return { p: skull(d), n: normalAt(d) };
}

/** Same as `onFace`, but seen from the side: given y and z, on side ±1. */
function onSide(side: number, y: number, z: number) {
  const d = new THREE.Vector3(side, y, z).normalize();
  for (let i = 0; i < 30; i++) {
    const p = skull(d);
    d.y += (y - p.y) * 0.9;
    d.z += (z - p.z) * 0.9;
    d.normalize();
  }
  return { p: skull(d), n: normalAt(d) };
}

/** Where the fringe's pointed tips fall, in direction x (viewer's left < 0). */
const FRINGE_TIPS = [0.22, -0.3];

/**
 * Hairline height (in direction y) around the head, traced from the side
 * view: high over the forehead, dropping at the temples, a sideburn in front
 * of the ear, tight over the ear, then down to the nape behind it.
 */
function hairline(d: THREE.Vector3) {
  const phi = Math.abs(Math.atan2(d.x, d.z)); // 0 front, π/2 side, π back
  const step = (at: number, x: number) => smoothstep(at - 0.05, at + 0.05, x);
  let y = 0.56 - 0.06 * smoothstep(0, 0.8, phi); // forehead
  // The fringe ends in pointed tips that hang onto the forehead, leaning
  // toward the viewer's left like the locks above them.
  if (d.z > 0) {
    let tips = 0;
    for (const tip of FRINGE_TIPS) {
      const t = (d.x - tip) / 0.14;
      // Asymmetric tooth: long slope on the right, steep edge on the left.
      const tooth = t < 0 ? 1 + t / 0.45 : 1 - t;
      tips = Math.max(tips, tooth);
    }
    y -= 0.03 * Math.max(tips, 0) * smoothstep(0.9, 0.5, phi);
  }
  y += (0.4 - y) * step(1.0, phi); // temple
  y += (-0.3 - y) * step(1.36, phi); // sideburn in front of the ear
  y += (0.14 - y) * step(1.64, phi); // over the ear
  y += (-0.62 - y) * smoothstep(2.05, 2.4, phi); // behind the ear, to the nape
  return y;
}

function headGeometry(offset: (d: THREE.Vector3) => number) {
  const geometry = new THREE.SphereGeometry(1, 256, 192);
  const pos = geometry.attributes.position;
  const d = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    d.fromBufferAttribute(pos, i).normalize();
    const p = skull(d);
    const o = offset(d);
    if (o) p.addScaledVector(d, o);
    pos.setXYZ(i, p.x, p.y, p.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Hair thickness over the skull: full on top, thinner at the sides. */
const hairThickness = (d: THREE.Vector3) =>
  0.06 +
  // Fuller over the temples, so the hair is wider than the face there.
  0.05 * Math.exp(-(((d.y - 0.45) / 0.3) ** 2)) * Math.abs(d.x) +
  0.08 * smoothstep(0.1, 0.9, d.y) +
  // The quiff: extra volume over the front of the crown.
  0.08 * smoothstep(0.35, 0.85, d.y) * smoothstep(-0.2, 0.6, d.z) +
  0.04 * smoothstep(0, -0.8, d.z);

/**
 * The hair shell: an offset copy of the skull. Below the hairline it sinks
 * just under the skin, so the visible hairline is where the two surfaces
 * cross and stays smooth.
 */
function hairGeometry() {
  return headGeometry((d) => {
    const above = d.y - hairline(d);
    return -0.03 + (hairThickness(d) + 0.03) * smoothstep(-0.01, 0.16, above);
  });
}

/** Point on the outside of the hair for a direction, lifted by `lift`. */
function onHair(x: number, y: number, z: number, lift = 0) {
  const d = new THREE.Vector3(x, y, z).normalize();
  return skull(d).addScaledVector(d, hairThickness(d) + lift);
}

/** A flattened tube that tapers to a point: one chunky lock of hair. */
function lock(points: THREE.Vector3[], radius: number, flatten: number) {
  const curve = new THREE.CatmullRomCurve3(points);
  const segments = 48;
  const radial = 16;
  const geometry = new THREE.TubeGeometry(curve, segments, radius, radial);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();
  const normal = new THREE.Vector3();
  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    const center = curve.getPointAt(t);
    // Blend into the hair at the root, pointed at the tip.
    const taper = smoothstep(0, 0.2, t) * (1 - 0.92 * t ** 1.6);
    // Squash the cross-section toward the head so the lock lies flat.
    normal.copy(center).normalize();
    for (let r = 0; r <= radial; r++) {
      const i = s * (radial + 1) + r;
      v.fromBufferAttribute(pos, i).sub(center).multiplyScalar(taper);
      const out = v.dot(normal);
      v.addScaledVector(normal, -out * (1 - flatten));
      pos.setXYZ(i, center.x + v.x, center.y + v.y, center.z + v.z);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

function tube(points: THREE.Vector3[], radius: number, material: THREE.Material) {
  const group = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3(points);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 32, radius, 12), material));
  for (const end of [points[0], points[points.length - 1]]) {
    const cap = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), material);
    cap.position.copy(end);
    group.add(cap);
  }
  return group;
}

export function buildHead() {
  const head = new THREE.Group();

  const skin = new THREE.MeshPhysicalMaterial({
    color: SKIN,
    roughness: 0.6,
    sheen: 0.5,
    sheenColor: new THREE.Color(0xffe8da),
  });
  const skinShade = new THREE.MeshStandardMaterial({
    color: SKIN_SHADE,
    roughness: 0.65,
  });
  // Satin hair: a soft clear coat gives the grey streak highlights.
  const hair = new THREE.MeshPhysicalMaterial({
    color: HAIR,
    roughness: 0.62,
    clearcoat: 0.35,
    clearcoatRoughness: 0.45,
  });
  const brow = new THREE.MeshStandardMaterial({ color: BROW, roughness: 0.85 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 });
  const iris = new THREE.MeshStandardMaterial({ color: IRIS, roughness: 0.35 });
  const black = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
  const lid = new THREE.MeshStandardMaterial({ color: 0x2c2826, roughness: 0.6 });
  const lip = new THREE.MeshStandardMaterial({ color: LIP, roughness: 0.55 });

  head.add(new THREE.Mesh(headGeometry(() => 0), skin));
  head.add(new THREE.Mesh(hairGeometry(), hair));

  // Chunky locks over the front half of the head, sweeping forward and to
  // the viewer's left, their tips curling down onto the forehead.
  const locks: [number, number, number][] = [
    // [x at the crown, x at the tip, lift]; tips match the fringe.
    [0.45, FRINGE_TIPS[0], 0.0],
    [0.05, FRINGE_TIPS[1], 0.02],
    [-0.35, -0.66, 0.0],
  ];
  locks.forEach(([x0, x1, lift], k) => {
    const points = [
      onHair(x0 * 0.8, 1, -0.35, -0.08),
      onHair(x0, 1, 0.15, lift * 0.6),
      onHair(lerp(x0, x1, 0.5), 0.85, 0.55, lift),
      onHair(x1, 0.6, 0.85, lift * 0.7 + 0.02),
      onHair(x1, 0.52, 0.95, -0.03),
    ];
    head.add(new THREE.Mesh(lock(points, 0.3 - k * 0.02, 0.25), hair));
  });
  // A smaller lock standing up at the back of the crown, as in the side view.
  head.add(
    new THREE.Mesh(
      lock(
        [onHair(0.1, 0.9, -0.6, -0.05), onHair(0.12, 1, -0.25, 0.06), onHair(0.2, 1, 0.05, 0.12)],
        0.13,
        0.6
      ),
      hair
    )
  );

  // Eyes: large, wide apart, just below the middle of the head.
  for (const side of [-1, 1]) {
    const { p, n } = onFace(0.38 * side, -0.13);
    const eye = new THREE.Group();
    eye.position.copy(p).addScaledVector(n, -0.075);
    eye.lookAt(eye.position.clone().add(n.clone().setX(n.x * 0.4)));
    eye.scale.set(1.15, 0.95, 1);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.19, 40, 30), white);
    eye.add(ball);
    const irisMesh = new THREE.Mesh(new THREE.SphereGeometry(0.122, 32, 24), iris);
    irisMesh.scale.set(1, 1, 0.35);
    irisMesh.position.z = 0.155;
    eye.add(irisMesh);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.058, 24, 16), black);
    pupil.scale.set(1, 1, 0.4);
    pupil.position.z = 0.19;
    eye.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.026, 12, 8), white);
    glint.position.set(0.04 * side, 0.045, 0.198);
    eye.add(glint);
    // Skin lids close over the top and bottom of the eyeball, giving the
    // almond shape; a dark line runs along the upper lid's edge.
    const LID_R = 0.198;
    const upperTilt = 0.0;
    const upperOpen = 0.62;
    const upper = new THREE.Mesh(
      new THREE.SphereGeometry(LID_R, 40, 16, 0, Math.PI * 2, 0, upperOpen),
      skin
    );
    upper.rotation.x = upperTilt;
    eye.add(upper);
    const lower = new THREE.Mesh(
      new THREE.SphereGeometry(LID_R, 40, 16, 0, Math.PI * 2, 0, 0.72),
      skin
    );
    lower.rotation.x = Math.PI - 0.25;
    eye.add(lower);
    const lidLine = new THREE.Mesh(
      new THREE.TorusGeometry(LID_R * Math.sin(upperOpen), 0.022, 10, 48, Math.PI),
      lid
    );
    lidLine.position
      .set(0, Math.cos(upperTilt), Math.sin(upperTilt))
      .multiplyScalar(LID_R * Math.cos(upperOpen));
    lidLine.rotation.set(upperTilt - Math.PI / 2, 0, Math.PI);
    eye.add(lidLine);
    head.add(eye);
  }

  // Brows: thick, gently arched, sitting just proud of the skin.
  for (const side of [-1, 1]) {
    const pts = [
      [0.15, 0.15],
      [0.37, 0.2],
      [0.58, 0.15],
    ].map(([x, y]) => {
      const { p, n } = onFace(x * side, y);
      return p.addScaledVector(n, -0.008);
    });
    const b = tube(pts, 0.04, brow);
    head.add(b);
  }

  // Nose: a small round button, the most forward point of the face.
  {
    const { p, n } = onFace(0, -0.33);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.135, 32, 24), skin);
    nose.scale.set(1.05, 0.95, 0.9);
    nose.position.copy(p).addScaledVector(n, 0.05);
    head.add(nose);
  }

  // Mouth: a wide, closed smile with a soft pink lower lip.
  {
    const pts = [
      [-0.3, -0.61],
      [-0.15, -0.665],
      [0, -0.675],
      [0.15, -0.665],
      [0.3, -0.61],
    ].map(([x, y]) => {
      const { p, n } = onFace(x, y);
      return p.addScaledVector(n, 0.003);
    });
    head.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.018, 8),
        lip
      )
    );
    const { p, n } = onFace(0, -0.71);
    const lower = new THREE.Mesh(new THREE.SphereGeometry(0.15, 32, 16), lip);
    lower.scale.set(1.2, 0.3, 0.25);
    lower.position.copy(p).addScaledVector(n, -0.015);
    head.add(lower);
  }

  // Ears: large, from brow height down to the mouth, ~64% of the way back,
  // turned forward enough to stick out in the front view.
  for (const side of [-1, 1]) {
    const { p, n } = onSide(side, -0.14, -0.2);
    const ear = new THREE.Group();
    ear.position.copy(p).addScaledVector(n, 0.09);
    ear.lookAt(ear.position.clone().add(new THREE.Vector3(side, 0, 0.7)));
    const outer = new THREE.Mesh(new THREE.SphereGeometry(1, 40, 30), skin);
    outer.scale.set(0.2, 0.32, 0.1);
    ear.add(outer);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 24), skinShade);
    inner.scale.set(0.12, 0.22, 0.055);
    inner.position.set(0.02 * side, -0.02, 0.05);
    ear.add(inner);
    head.add(ear);
  }

  return head;
}

/** Soft studio lighting: warm key upper left, fill right, rim behind. */
export function addLights(scene: THREE.Scene) {
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd6cdc6, 1.5));
  const key = new THREE.DirectionalLight(0xfffaf5, 1.9);
  key.position.set(-2.5, 3, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 1.0);
  fill.position.set(3, 0.5, 2.5);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2);
  rim.position.set(0, 2.5, -4);
  scene.add(rim);
}

export function disposeHead(head: THREE.Object3D) {
  head.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      const m = o.material as THREE.Material | THREE.Material[];
      (Array.isArray(m) ? m : [m]).forEach((mm) => mm.dispose());
    }
  });
}
