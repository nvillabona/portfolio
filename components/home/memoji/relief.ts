/**
 * Sculpts a relief for the memoji from its 512×512 source image.
 *
 * The image is flat, so depth is modelled part by part from the memoji's
 * anatomy (all coordinates are pixels in the source image):
 *
 * - Head: an ellipsoid centred on the face (215, 215), ~216 px wide. Real
 *   heads are about as deep as they are wide, so it bulges the most.
 * - Hair: a slightly larger cap over the top of the head.
 * - Ears: small flattened ellipsoids at the sides, sitting behind the face.
 * - Face: nose, cheeks, brow ridge, eye sockets with eyeballs, a recessed
 *   open mouth and the chin, placed where they are drawn.
 * - Neck and hood: the neck column and the rolled hood around it.
 * - Torso: a wide, shallower ellipsoid for the chest cut off by the frame.
 * - Raised arm: a capsule from the shoulder to the cuff.
 * - Hand: palm plus fingers inflated from their own silhouette, thin.
 *
 * The back is sculpted from the same parts without facial features, and a
 * matching texture paints the back of the head with hair.
 */

// Half-thickness kept at the silhouette, filled by stacked rim layers.
export const RIM = 0.03;
// Radius, in source pixels, of the rounded edge along the silhouette.
const EDGE_RADIUS = 14;

type Sample = {
  alpha: Float32Array;
  r: Float32Array;
  g: Float32Array;
  b: Float32Array;
};

function sample(img: CanvasImageSource, n: number): Sample {
  const canvas = document.createElement("canvas");
  canvas.width = n;
  canvas.height = n;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, n, n);
  const { data } = ctx.getImageData(0, 0, n, n);
  const s: Sample = {
    alpha: new Float32Array(n * n),
    r: new Float32Array(n * n),
    g: new Float32Array(n * n),
    b: new Float32Array(n * n),
  };
  for (let i = 0; i < n * n; i++) {
    s.r[i] = data[i * 4];
    s.g[i] = data[i * 4 + 1];
    s.b[i] = data[i * 4 + 2];
    s.alpha[i] = data[i * 4 + 3] / 255;
  }
  return s;
}

/** Chamfer distance (in grid cells) from each opaque cell to a clear one. */
function distanceToEdge(mask: Uint8Array, n: number) {
  const dist = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) dist[i] = mask[i] ? 1e9 : 0;
  const D = Math.SQRT2;
  const relax = (i: number, j: number, w: number) => {
    if (dist[j] + w < dist[i]) dist[i] = dist[j] + w;
  };
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = y * n + x;
      if (!dist[i]) continue;
      if (x > 0) relax(i, i - 1, 1);
      if (y > 0) {
        relax(i, i - n, 1);
        if (x > 0) relax(i, i - n - 1, D);
        if (x < n - 1) relax(i, i - n + 1, D);
      }
    }
  }
  for (let y = n - 1; y >= 0; y--) {
    for (let x = n - 1; x >= 0; x--) {
      const i = y * n + x;
      if (!dist[i]) continue;
      if (x < n - 1) relax(i, i + 1, 1);
      if (y < n - 1) {
        relax(i, i + n, 1);
        if (x < n - 1) relax(i, i + n + 1, D);
        if (x > 0) relax(i, i + n - 1, D);
      }
    }
  }
  return dist;
}

function blur(src: Float32Array, n: number, r: number) {
  const tmp = new Float32Array(n * n);
  const out = new Float32Array(n * n);
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let s = 0;
      let c = 0;
      for (let k = Math.max(0, x - r); k <= Math.min(n - 1, x + r); k++) {
        s += src[y * n + k];
        c++;
      }
      tmp[y * n + x] = s / c;
    }
  }
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      let s = 0;
      let c = 0;
      for (let k = Math.max(0, y - r); k <= Math.min(n - 1, y + r); k++) {
        s += tmp[k * n + x];
        c++;
      }
      out[y * n + x] = s / c;
    }
  }
  return out;
}

// Shape primitives, in source pixels; they return a height in world units.
const ellipsoid = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  depth: number
) => {
  const q = 1 - ((x - cx) / rx) ** 2 - ((y - cy) / ry) ** 2;
  return q > 0 ? depth * Math.sqrt(q) : 0;
};

const capsule = (
  x: number,
  y: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  r: number,
  depth: number
) => {
  const vx = bx - ax;
  const vy = by - ay;
  const t = Math.max(
    0,
    Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy))
  );
  const d = Math.hypot(x - (ax + t * vx), y - (ay + t * vy));
  const q = 1 - (d / r) ** 2;
  return q > 0 ? depth * Math.sqrt(q) : 0;
};

const bump = (
  x: number,
  y: number,
  cx: number,
  cy: number,
  sigma: number,
  amount: number
) => amount * Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * sigma * sigma));

const isHandArea = (x: number, y: number) => x > 372 && y < 262;

export function buildRelief(img: CanvasImageSource, n: number) {
  const s = sample(img, n);
  const toPx = 512 / n;
  const mask = new Uint8Array(n * n);
  for (let i = 0; i < n * n; i++) mask[i] = s.alpha[i] > 0.5 ? 1 : 0;
  const dist = distanceToEdge(mask, n);

  const front = new Float32Array(n * n);
  const back = new Float32Array(n * n);

  for (let gy = 0; gy < n; gy++) {
    for (let gx = 0; gx < n; gx++) {
      const i = gy * n + gx;
      if (!mask[i]) continue;
      const x = (gx + 0.5) * toPx;
      const y = (gy + 0.5) * toPx;
      const r = s.r[i];
      const g = s.g[i];
      const b = s.b[i];
      const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const isHoodie = b > r + 12 && b > 90;
      const isSkin = r > b + 25 && r > 140;
      const d = dist[i] * toPx;

      let base: number;
      if (isHandArea(x, y)) {
        // Fingers are thin: inflate them from their own outline.
        const fingers = Math.sqrt(1 - (1 - Math.min(d / 16, 1)) ** 2) * 0.06;
        base = Math.max(fingers, ellipsoid(x, y, 440, 222, 44, 42, 0.1));
      } else {
        base = Math.max(
          // Torso, cut off by the bottom of the frame.
          ellipsoid(x, y, 245, 560, 205, 265, 0.34),
          // Neck and rolled hood around it.
          ellipsoid(x, y, 228, 318, 55, 55, 0.27),
          isHoodie ? ellipsoid(x, y, 226, 350, 120, 48, 0.33) : 0,
          // Raised arm from the shoulder to the cuff, slightly forward.
          capsule(x, y, 392, 480, 424, 280, 42, 0.16) + 0.06,
          // Head and hair cap.
          ellipsoid(x, y, 215, 215, 108, 122, 0.4),
          luma < 0.3 && y < 205
            ? ellipsoid(x, y, 212, 172, 104, 96, 0.43)
            : 0,
          // Ears sit behind the face at the sides of the head.
          ellipsoid(x, y, 122, 245, 24, 48, 0.08) + (x < 145 ? 0.08 : 0),
          ellipsoid(x, y, 309, 228, 18, 38, 0.08) + (x > 294 ? 0.08 : 0)
        );
        // Anything the parts miss still gets a soft volume.
        base = Math.max(
          base,
          Math.sqrt(1 - (1 - Math.min(d / 30, 1)) ** 2) * 0.1
        );
      }

      let face = 0;
      const onFace = isSkin && ellipsoid(x, y, 215, 230, 92, 100, 1) > 0;
      if (onFace) {
        face +=
          bump(x, y, 233, 240, 13, 0.07) + // nose
          bump(x, y, 176, 262, 24, 0.025) + // cheeks
          bump(x, y, 284, 254, 22, 0.025) +
          bump(x, y, 188, 186, 20, 0.02) + // brow ridge
          bump(x, y, 262, 180, 20, 0.02) +
          bump(x, y, 234, 312, 22, 0.025); // chin
      }
      // Eye sockets with the eyeballs rounding out of them.
      face +=
        bump(x, y, 186, 221, 24, -0.03) +
        bump(x, y, 186, 221, 14, 0.025) +
        bump(x, y, 262, 211, 22, -0.03) +
        bump(x, y, 262, 211, 13, 0.025);
      // Open mouth sits inside the lips.
      const inMouth =
        x > 190 && x < 285 && y > 252 && y < 300 && luma < 0.45 && !isSkin;
      face += inMouth ? -0.05 : bump(x, y, 236, 274, 32, 0.015);
      // Keep facial features off the hair, hood and hand.
      if (y > 330 || x > 330 || x < 130 || (luma < 0.3 && y < 200)) face = 0;

      // Fabric folds and small detail from the drawing's shading.
      const detail = isHoodie ? (luma - 0.35) * 0.03 : 0;

      // Round every part into the silhouette so edges curve in.
      const edge = Math.sqrt(1 - (1 - Math.min(d / EDGE_RADIUS, 1)) ** 2);
      front[i] = Math.max((base + face + detail) * edge, RIM);
      back[i] = Math.max(base * 0.92 * edge, RIM);
    }
  }

  // Smooth the seams between parts, then restore the silhouette.
  const smoothFront = blur(front, n, 1);
  const smoothBack = blur(back, n, 2);
  for (let i = 0; i < n * n; i++) {
    front[i] = mask[i] ? Math.max(smoothFront[i], RIM) : 0;
    back[i] = mask[i] ? Math.max(smoothBack[i], RIM) : 0;
  }
  return { front, back };
}

/** Texture for the back: the head is covered with hair instead of a face. */
export function buildBackTexture(img: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, 512, 512);
  ctx.globalCompositeOperation = "source-atop";
  const hair = ctx.createRadialGradient(210, 190, 10, 212, 205, 130);
  hair.addColorStop(0, "#3a3533");
  hair.addColorStop(1, "#1f1c1b");
  ctx.fillStyle = hair;
  ctx.beginPath();
  ctx.ellipse(214, 212, 104, 124, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nape of the neck below the hairline.
  ctx.fillStyle = "#e9c4a6";
  ctx.beginPath();
  ctx.ellipse(228, 326, 50, 24, 0, 0, Math.PI * 2);
  ctx.fill();
  // Keep the ears showing at the sides of the head.
  ctx.globalCompositeOperation = "source-over";
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(122, 245, 24, 48, 0, 0, Math.PI * 2);
  ctx.ellipse(309, 228, 18, 38, 0, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, 0, 0, 512, 512);
  ctx.restore();
  return canvas;
}
