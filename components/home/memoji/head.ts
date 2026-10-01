import * as THREE from "three";

/**
 * The memoji head, reconstructed from the front, back, side and top
 * reference views.
 *
 * `public/memoji/head.bin` is the head's volume: the shape that fits every
 * view's silhouette at once (a visual hull), smoothed and simplified. Each
 * vertex also stores whether it can be seen from each reference view.
 *
 * `public/memoji/views.jpg` holds the five reference views. The shader
 * projects each view onto the head the way a projector would, and blends
 * them by how directly the surface faces each one, so the head looks like
 * the reference from every angle the references cover.
 */

const MODEL_URL = "/memoji/head.bin";
const VIEWS_URL = "/memoji/views.jpg";

// Half-extents of the head, matching the reference views' bounding boxes:
// width (x), height (y) and depth (z).
const HALF_WIDTH = 0.92759;
const HALF_HEIGHT = 1.1;
const HALF_DEPTH = 0.93844;

// Where each view's bounding box sits in the atlas: [u0, v0, u1, v1], with
// (u0, v0) its top-left corner.
const RECTS = {
  front: [0.00402, 0.99465, 0.31322, 0.50688],
  back: [0.33736, 0.99465, 0.64885, 0.50994],
  left: [0.67069, 0.99465, 0.98448, 0.50535],
  right: [0.00402, 0.49465, 0.30632, 0.01453],
  top: [0.33736, 0.49465, 0.66264, 0.04511],
} as const;

const vertexShader = /* glsl */ `
  attribute vec4 visSides; // front, back, left, right
  attribute float visTop;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec4 vVisSides;
  varying float vVisTop;
  void main() {
    vPos = position;
    vNormal = normal;
    vVisSides = visSides;
    vVisTop = visTop;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D views;
  uniform vec4 rectFront;
  uniform vec4 rectBack;
  uniform vec4 rectLeft;
  uniform vec4 rectRight;
  uniform vec4 rectTop;
  uniform vec3 halfSize;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec4 vVisSides;
  varying float vVisTop;

  vec3 project(vec4 rect, vec2 st) {
    return texture2D(views, mix(rect.xy, rect.zw, clamp(st, 0.0, 1.0))).rgb;
  }

  void main() {
    vec3 n = normalize(vNormal);
    vec3 p = vPos / halfSize; // -1..1 across the head
    float t = (1.0 - p.y) * 0.5; // top of the head = 0

    // Favour whichever view faces the surface most squarely.
    // The front view is the most detailed and the views were drawn rather
    // than photographed, so they disagree slightly; let the front win ties.
    float wF = 2.5 * vVisSides.x * pow(max(n.z, 0.0), 6.0);
    float wB = vVisSides.y * pow(max(-n.z, 0.0), 6.0);
    float wL = vVisSides.z * pow(max(n.x, 0.0), 6.0);
    float wR = vVisSides.w * pow(max(-n.x, 0.0), 6.0);
    float wT = vVisTop * pow(max(n.y, 0.0), 6.0);
    // The top view only covers the crown; toward the front it shows the
    // forehead under the fringe, which the front view draws better.
    wT *= smoothstep(0.0, 0.4, p.y) * (1.0 - smoothstep(0.15, 0.55, p.z));
    // Underneath, where no view looks, borrow from the front and back.
    // Down the middle of the face the front view is always the best source;
    // the side views only see that strip edge-on.
    float centre = (1.0 - smoothstep(0.3, 0.55, abs(p.x))) * smoothstep(0.0, 0.2, n.z);
    wL *= 1.0 - centre;
    wR *= 1.0 - centre;
    float under = 0.02 + 0.3 * max(-n.y, 0.0);
    wF += under * step(0.0, n.z);
    wB += under * step(n.z, 0.0);

    vec3 c = vec3(0.0);
    c += wF * project(rectFront, vec2((p.x + 1.0) * 0.5, t));
    c += wB * project(rectBack, vec2((1.0 - p.x) * 0.5, t));
    c += wL * project(rectLeft, vec2((1.0 - p.z) * 0.5, t));
    c += wR * project(rectRight, vec2((p.z + 1.0) * 0.5, t));
    c += wT * project(rectTop, vec2((p.x + 1.0) * 0.5, (p.z + 1.0) * 0.5));
    gl_FragColor = vec4(c / (wF + wB + wL + wR + wT), 1.0);
    #include <colorspace_fragment>
  }
`;

function parseModel(buffer: ArrayBuffer) {
  const [vertexCount, indexCount] = new Uint32Array(buffer, 0, 2);
  let offset = 8;
  const positions = new Float32Array(buffer, offset, vertexCount * 3);
  offset += positions.byteLength;
  const vis = new Uint8Array(buffer, offset, vertexCount * 5);
  offset += vis.byteLength + ((4 - (vis.byteLength % 4)) % 4);
  const indices = new Uint16Array(buffer, offset, indexCount);

  const sides = new Uint8Array(vertexCount * 4);
  const top = new Uint8Array(vertexCount);
  for (let i = 0; i < vertexCount; i++) {
    sides.set(vis.subarray(i * 5, i * 5 + 4), i * 4);
    top[i] = vis[i * 5 + 4];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("visSides", new THREE.BufferAttribute(sides, 4, true));
  geometry.setAttribute("visTop", new THREE.BufferAttribute(top, 1, true));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

export async function loadHead() {
  const [buffer, views] = await Promise.all([
    fetch(MODEL_URL).then((r) => {
      if (!r.ok) throw new Error(`Failed to load ${MODEL_URL}`);
      return r.arrayBuffer();
    }),
    new THREE.TextureLoader().loadAsync(VIEWS_URL),
  ]);
  views.colorSpace = THREE.SRGBColorSpace;
  views.anisotropy = 4;

  const rect = (r: readonly number[]) => new THREE.Vector4(r[0], r[1], r[2], r[3]);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      views: { value: views },
      rectFront: { value: rect(RECTS.front) },
      rectBack: { value: rect(RECTS.back) },
      rectLeft: { value: rect(RECTS.left) },
      rectRight: { value: rect(RECTS.right) },
      rectTop: { value: rect(RECTS.top) },
      halfSize: { value: new THREE.Vector3(HALF_WIDTH, HALF_HEIGHT, HALF_DEPTH) },
    },
  });
  // The views already carry their own lighting, so show them as they are.
  material.toneMapped = false;

  return new THREE.Mesh(parseModel(buffer), material);
}

export function disposeHead(head: THREE.Mesh) {
  head.geometry.dispose();
  const material = head.material as THREE.ShaderMaterial;
  (material.uniforms.views.value as THREE.Texture).dispose();
  material.dispose();
}
