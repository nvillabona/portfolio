import * as THREE from "three";

/**
 * Procedural memoji head, modelled from front, side, back, top and 3/4
 * reference views. Units: the skull is roughly 2 units tall, facing +z.
 */

const SKIN = 0xf3d9c3;
const SKIN_SHADE = 0xe6bfa3;
const LIP = 0xcf9f8e;
const HAIR = 0x2e2c2b;
const BROW = 0x4a4847;
const IRIS = 0x5b5143;

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * Maps a unit direction to a point on the skull. The face is broad and
 * fairly flat, the cheeks full, the jaw rounded into a soft chin, and the
 * back of the skull reaches well behind the ears.
 */
function skull(d: THREE.Vector3) {
  const { x, y, z } = d;
  // Full cheeks, narrower temples and a jaw that tapers into the chin.
  const cheeks = 1 + 0.1 * Math.exp(-(((y + 0.25) / 0.4) ** 2));
  const jaw = 1 - 0.12 * smoothstep(-0.45, -1, y);
  const px = x * 0.95 * cheeks * jaw;
  // Flatter face in front, rounder and deeper skull behind.
  let pz = z > 0 ? z * 0.9 : z * 1.12;
  // Chin comes forward a little below the mouth.
  pz += 0.06 * smoothstep(-0.45, -0.8, y) * smoothstep(0.2, 0.8, z);
  // Slightly taller than wide, with a flatter underside toward the neck.
  const py = y > 0 ? y * 1.02 : y * (1.02 - 0.08 * smoothstep(0, -1, y));
  return new THREE.Vector3(px, py, pz);
}

/** Point on the skull surface and its outward normal for a direction. */
function anchor(x: number, y: number, z: number) {
  const d = new THREE.Vector3(x, y, z).normalize();
  const p = skull(d);
  const e = 0.01;
  // Numerical normal from two tangents on the surface.
  const t1 = new THREE.Vector3(-d.z, 0, d.x).normalize();
  if (t1.lengthSq() < 1e-6) t1.set(1, 0, 0);
  const t2 = new THREE.Vector3().crossVectors(d, t1).normalize();
  const a = skull(d.clone().addScaledVector(t1, e).normalize()).sub(p);
  const b = skull(d.clone().addScaledVector(t2, e).normalize()).sub(p);
  const n = new THREE.Vector3().crossVectors(a, b).normalize();
  if (n.dot(p) < 0) n.negate();
  return { p, n };
}

/** Hairline height (in unit-sphere y) around the head. */
function hairline(d: THREE.Vector3) {
  const phi = Math.abs(Math.atan2(d.x, d.z)); // 0 front, π/2 side, π back
  const edge = (a: number, b: number) => smoothstep(a - 0.04, a + 0.04, b);
  let y = 0.5 - 0.06 * smoothstep(0, 0.8, phi); // forehead
  y += (0.34 - y) * edge(0.85, phi); // temples
  y += (-0.12 - y) * edge(1.12, phi); // sideburns in front of the ears
  y += (0.13 - y) * edge(1.36, phi); // over the ears
  y += (-0.6 - y) * smoothstep(1.75, 2.5, phi); // down to the nape
  return y;
}

function skullGeometry(offset: (d: THREE.Vector3) => number) {
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

/**
 * The hair shell: an offset copy of the skull. Below the hairline it sinks
 * just under the skin, so the visible hairline is where the two surfaces
 * cross, which keeps it smooth instead of following the mesh grid.
 */
function hairGeometry() {
  return skullGeometry((d) => {
    const above = d.y - hairline(d);
    const thickness = 0.035 + 0.1 * smoothstep(0.2, 0.9, d.y);
    return -0.03 + (thickness + 0.03) * smoothstep(-0.01, 0.1, above);
  });
}

/** A tube that tapers to a point: one swept lock of hair. */
function lock(points: THREE.Vector3[], radius: number) {
  const curve = new THREE.CatmullRomCurve3(points);
  const segments = 40;
  const radial = 12;
  const geometry = new THREE.TubeGeometry(curve, segments, radius, radial);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();
  for (let s = 0; s <= segments; s++) {
    const t = s / segments;
    const center = curve.getPointAt(t);
    // Round at the root, pointed at the tip.
    const taper = Math.sin(Math.min(t * 6, 1) * (Math.PI / 2)) * (1 - 0.85 * t ** 1.4);
    for (let r = 0; r <= radial; r++) {
      const i = s * (radial + 1) + r;
      v.fromBufferAttribute(pos, i).sub(center).multiplyScalar(taper);
      // Flatten the lock against the head.
      pos.setXYZ(i, center.x + v.x, center.y + v.y * 0.7, center.z + v.z);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Point on the hair surface for a direction, lifted by `lift`. */
function onHair(x: number, y: number, z: number, lift: number) {
  const d = new THREE.Vector3(x, y, z).normalize();
  return skull(d).addScaledVector(d, 0.13 + lift);
}

export function buildHead() {
  const head = new THREE.Group();

  const skin = new THREE.MeshPhysicalMaterial({
    color: SKIN,
    roughness: 0.55,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xffe6d6),
  });
  const skinShade = new THREE.MeshStandardMaterial({
    color: SKIN_SHADE,
    roughness: 0.6,
  });
  // Satin hair: a soft clear coat gives the grey streak highlights.
  const hair = new THREE.MeshPhysicalMaterial({
    color: HAIR,
    roughness: 0.55,
    clearcoat: 0.5,
    clearcoatRoughness: 0.35,
  });
  const brow = new THREE.MeshStandardMaterial({ color: BROW, roughness: 0.8 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
  const iris = new THREE.MeshStandardMaterial({ color: IRIS, roughness: 0.3 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.2 });
  const lid = new THREE.MeshStandardMaterial({ color: 0x2a2626, roughness: 0.5 });
  const lip = new THREE.MeshStandardMaterial({ color: LIP, roughness: 0.5 });

  head.add(new THREE.Mesh(skullGeometry(() => 0), skin));
  head.add(new THREE.Mesh(hairGeometry(), hair));

  // Swept locks over the crown and forehead, curling toward the viewer's
  // left like the reference's quiff, a little out of step with each other.
  const locks = 7;
  for (let k = 0; k < locks; k++) {
    const u = k / (locks - 1); // 0 = viewer's left, 1 = right
    const x = -0.58 + u * 1.12;
    // The quiff rises highest in the middle and overhangs the forehead.
    const lift = 0.05 + 0.1 * Math.sin(u * Math.PI);
    const points = [
      onHair(x * 0.6 + 0.2, 0.72, -0.7, -0.05),
      onHair(x * 0.8 + 0.12, 0.99, -0.1, lift * 0.5),
      onHair(x + 0.02, 0.88, 0.42, lift),
      onHair(x - 0.18, 0.66, 0.8, lift * 1.1),
      onHair(x - 0.34, 0.47, 0.92, lift * 0.35),
    ];
    const radius = 0.2 + 0.05 * Math.sin(u * Math.PI);
    head.add(new THREE.Mesh(lock(points, radius), hair));
  }

  // Nose: a small round button just below eye level.
  {
    const { p, n } = anchor(0, -0.14, 1);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.13, 32, 24), skin);
    nose.scale.set(1, 0.95, 0.85);
    nose.position.copy(p).addScaledVector(n, 0.02);
    head.add(nose);
  }

  // Eyes: large, set wide, nearly flush with the face.
  for (const side of [-1, 1]) {
    const { p, n } = anchor(0.35 * side, 0.05, 1);
    const eye = new THREE.Group();
    eye.position.copy(p).addScaledVector(n, -0.07);
    eye.lookAt(eye.position.clone().add(n));
    // Look a touch toward the viewer's centre, like the reference.
    eye.rotateY(-0.12 * side);

    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.175, 32, 24), white);
    eye.add(ball);
    const irisMesh = new THREE.Mesh(new THREE.SphereGeometry(0.115, 32, 24), iris);
    irisMesh.scale.set(1, 1, 0.35);
    irisMesh.position.z = 0.145;
    eye.add(irisMesh);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 16), black);
    pupil.scale.set(1, 1, 0.4);
    pupil.position.z = 0.172;
    eye.add(pupil);
    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 8), white);
    glint.position.set(0.04, 0.04, 0.18);
    eye.add(glint);
    // Dark upper lid line hugging the top of the eye.
    const lidMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.173, 0.016, 8, 40, Math.PI * 0.95),
      lid
    );
    lidMesh.rotation.z = Math.PI * 0.025;
    lidMesh.position.z = 0.02;
    lidMesh.rotation.x = -0.35;
    eye.add(lidMesh);
    head.add(eye);
  }

  // Brows: thick, softly arched strips close to the skin.
  for (const side of [-1, 1]) {
    const pts = [0.13, 0.33, 0.55].map((x, i) => {
      const { p, n } = anchor(x * side, [0.36, 0.42, 0.37][i], 1);
      return p.addScaledVector(n, -0.005);
    });
    const curve = new THREE.CatmullRomCurve3(pts);
    head.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.045, 12), brow));
    for (const end of [pts[0], pts[2]]) {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), brow);
      cap.position.copy(end);
      head.add(cap);
    }
  }

  // Mouth: a closed, gentle smile with a soft lower lip.
  {
    const pts = [
      [-0.17, -0.4],
      [-0.08, -0.44],
      [0, -0.445],
      [0.08, -0.44],
      [0.17, -0.4],
    ].map(([x, y]) => {
      const { p, n } = anchor(x, y, 1);
      return p.addScaledVector(n, 0.004);
    });
    const line = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 0.014, 8),
      lip
    );
    head.add(line);
    const { p, n } = anchor(0, -0.5, 1);
    const lower = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 16), skin);
    lower.scale.set(1.2, 0.35, 0.35);
    lower.position.copy(p).addScaledVector(n, -0.01);
    head.add(lower);
  }

  // Ears: stick out at mid depth, level with the eyes and nose, and flare
  // forward so they show from the front.
  for (const side of [-1, 1]) {
    const { p, n } = anchor(side, -0.06, -0.18);
    const ear = new THREE.Group();
    ear.position.copy(p).addScaledVector(n, 0.07);
    ear.lookAt(ear.position.clone().add(new THREE.Vector3(side, 0, 0.55)));
    const outer = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 24), skin);
    outer.scale.set(0.78, 1.15, 0.32);
    ear.add(outer);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), skinShade);
    inner.scale.set(0.65, 1.05, 0.25);
    inner.position.set(0, -0.01, 0.035);
    ear.add(inner);
    head.add(ear);
  }

  // Neck.
  {
    const neck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.38, 0.5, 40),
      skinShade
    );
    neck.position.set(0, -0.98, -0.15);
    head.add(neck);
  }

  return head;
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
