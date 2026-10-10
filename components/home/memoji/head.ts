import * as THREE from "three";
import { VIEWS } from "./views";

/**
 * The memoji head, reconstructed from the reference views (front, back,
 * both sides, top and three-quarter).
 *
 * `public/memoji/head.bin` is the head's volume: the shape that fits every
 * view's silhouette at once (a visual hull), smoothed and simplified. Each
 * vertex also stores whether each reference view can see it.
 *
 * `public/memoji/views.jpg` holds the reference views and `views-mask.png`
 * where each one shows the head. The shader projects the views onto the head
 * like projectors and favours the views drawn from closest to where the
 * visitor is looking from, so at each reference angle the head looks exactly
 * like that drawing, and in between it blends the two nearest ones.
 *
 * scripts/memoji/build_head.py builds all three files and `views.ts`.
 */

const MODEL_URL = "/memoji/head.bin";
const VIEWS_URL = "/memoji/views.jpg";
const MASK_URL = "/memoji/views-mask.png";
const COUNT = VIEWS.length;

const vertexShader = /* glsl */ `
  attribute vec4 visA; // front, back, left, right
  attribute vec2 visB; // top, three-quarter
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec4 vVisA;
  varying vec2 vVisB;
  varying vec3 vEye;
  void main() {
    vPos = position;
    vNormal = normal;
    vVisA = visA;
    vVisB = visB;
    // Where the camera is, as seen from the head.
    vEye = normalize((inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  #define COUNT ${COUNT}
  uniform sampler2D views;
  uniform sampler2D masks;
  uniform vec4 projU[COUNT];
  uniform vec4 projV[COUNT];
  uniform vec4 rect[COUNT];
  uniform vec3 dir[COUNT];
  uniform vec3 skin;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec4 vVisA;
  varying vec2 vVisB;
  varying vec3 vEye;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 eye = normalize(vEye);
    vec4 p = vec4(vPos, 1.0);
    float vis[COUNT];
    vis[0] = vVisA.x; vis[1] = vVisA.y; vis[2] = vVisA.z; vis[3] = vVisA.w;
    vis[4] = vVisB.x; vis[5] = vVisB.y;

    // Down the middle of the face the side views only see the cheeks
    // edge-on, and draw the nose where the cheeks are.
    float centre = (1.0 - smoothstep(0.28, 0.51, abs(vPos.x))) * smoothstep(0.0, 0.2, n.z);

    // Score each view for this spot, then blend them by score.
    float score[COUNT];
    vec3 color[COUNT];
    // Where no view shows the spot (under the chin), plain skin.
    float best = -2000.0;
    for (int i = 0; i < COUNT; i++) {
      score[i] = -1e9;
      color[i] = vec3(0.0);
      vec2 uv = vec2(dot(projU[i], p), dot(projV[i], p));
      vec4 r = rect[i];
      if (uv.x < r.x || uv.x > r.z || uv.y < r.y || uv.y > r.w) continue;
      // How well this view shows this spot: whether it is hidden from the
      // view, near the view's outline, or seen edge-on.
      float trust = vis[i] * texture2D(masks, uv).r * smoothstep(-0.5, 0.3, dot(n, dir[i]));
      if (i == 2 || i == 3) trust *= 1.0 - 0.9 * centre;
      if (trust <= 0.001) continue;
      color[i] = texture2D(views, uv).rgb;
      // Prefer views drawn from near the camera. A view that shows this spot
      // poorly loses out sooner as the camera moves away from it.
      score[i] = -(1.0 - dot(eye, dir[i])) * (100.0 + 300.0 * (1.0 - trust));
      best = max(best, score[i]);
    }
    float total = exp(-2000.0 - best);
    vec3 col = total * skin;
    for (int i = 0; i < COUNT; i++) {
      float w = exp(score[i] - best);
      col += w * color[i];
      total += w;
    }
    col /= total;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

function parseModel(buffer: ArrayBuffer) {
  const [vertexCount, indexCount] = new Uint32Array(buffer, 0, 2);
  let offset = 8;
  const positions = new Float32Array(buffer, offset, vertexCount * 3);
  offset += positions.byteLength;
  const vis = new Uint8Array(buffer, offset, vertexCount * COUNT);
  offset += vis.byteLength + ((4 - (vis.byteLength % 4)) % 4);
  const indices = new Uint16Array(buffer, offset, indexCount);

  const visA = new Uint8Array(vertexCount * 4);
  const visB = new Uint8Array(vertexCount * 2);
  for (let i = 0; i < vertexCount; i++) {
    visA.set(vis.subarray(i * COUNT, i * COUNT + 4), i * 4);
    visB.set(vis.subarray(i * COUNT + 4, i * COUNT + 6), i * 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("visA", new THREE.BufferAttribute(visA, 4, true));
  geometry.setAttribute("visB", new THREE.BufferAttribute(visB, 2, true));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

export async function loadHead() {
  const loader = new THREE.TextureLoader();
  const [buffer, views, masks] = await Promise.all([
    fetch(MODEL_URL).then((r) => {
      if (!r.ok) throw new Error(`Failed to load ${MODEL_URL}`);
      return r.arrayBuffer();
    }),
    loader.loadAsync(VIEWS_URL),
    loader.loadAsync(MASK_URL),
  ]);
  views.colorSpace = THREE.SRGBColorSpace;
  views.anisotropy = 4;

  const vec4 = (a: readonly number[]) => new THREE.Vector4(a[0], a[1], a[2], a[3]);
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      views: { value: views },
      masks: { value: masks },
      projU: { value: VIEWS.map((v) => vec4(v.u)) },
      projV: { value: VIEWS.map((v) => vec4(v.v)) },
      rect: { value: VIEWS.map((v) => vec4(v.rect)) },
      dir: { value: VIEWS.map((v) => new THREE.Vector3(...v.dir)) },
      // Under the chin, where no view looks.
      skin: { value: new THREE.Color(0xd9bfa5).convertSRGBToLinear() },
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
  (material.uniforms.masks.value as THREE.Texture).dispose();
  material.dispose();
}
