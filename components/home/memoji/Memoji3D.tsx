"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SIZE = 300;
const SRC = "/memoji.webp";
// Resolution of the relief mesh (vertices per side).
const GRID = 192;
// How far the thickest part of the memoji bulges out, in world units (the
// memoji is 2 units wide).
const MAX_DEPTH = 0.32;
// Extra relief taken from the image brightness, for facial detail.
const DETAIL_DEPTH = 0.035;
// Minimum half-thickness at the silhouette edge, filled by stacked layers.
const RIM = 0.035;
const RIM_LAYERS = 10;
const MAX_TILT = 0.45;

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Estimates a height map for the memoji from its silhouette: each opaque
 * pixel is raised according to its distance from the edge (rounded like an
 * inflated pillow) plus a little relief from its brightness.
 */
function buildHeightMap(img: HTMLImageElement, n: number) {
  const canvas = document.createElement("canvas");
  canvas.width = n;
  canvas.height = n;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, n, n);
  const { data } = ctx.getImageData(0, 0, n, n);

  const alpha = new Float32Array(n * n);
  const luma = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) {
    alpha[i] = data[i * 4 + 3] / 255;
    luma[i] =
      (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) /
      255;
  }

  // Two-pass chamfer distance transform: distance from each inside pixel to
  // the nearest transparent pixel.
  const INF = 1e9;
  const dist = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) dist[i] = alpha[i] > 0.5 ? INF : 0;
  const D = Math.SQRT2;
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      const i = y * n + x;
      if (dist[i] === 0) continue;
      let d = dist[i];
      if (x > 0) d = Math.min(d, dist[i - 1] + 1);
      if (y > 0) {
        d = Math.min(d, dist[i - n] + 1);
        if (x > 0) d = Math.min(d, dist[i - n - 1] + D);
        if (x < n - 1) d = Math.min(d, dist[i - n + 1] + D);
      }
      dist[i] = d;
    }
  }
  for (let y = n - 1; y >= 0; y--) {
    for (let x = n - 1; x >= 0; x--) {
      const i = y * n + x;
      if (dist[i] === 0) continue;
      let d = dist[i];
      if (x < n - 1) d = Math.min(d, dist[i + 1] + 1);
      if (y < n - 1) {
        d = Math.min(d, dist[i + n] + 1);
        if (x < n - 1) d = Math.min(d, dist[i + n + 1] + D);
        if (x > 0) d = Math.min(d, dist[i + n - 1] + D);
      }
      dist[i] = d;
    }
  }
  // Pixels beyond the frame are never counted as edges, so the cropped torso
  // stays full height instead of flattening at the bottom of the image.
  let maxDist = 0;
  for (let i = 0; i < n * n; i++) maxDist = Math.max(maxDist, dist[i]);

  // Rounded (circular) profile so edges curve in like a real surface.
  let height = new Float32Array(n * n);
  for (let i = 0; i < n * n; i++) {
    if (dist[i] === 0) continue;
    const t = Math.min(dist[i] / maxDist, 1);
    height[i] = Math.sqrt(1 - (1 - t) * (1 - t)) * MAX_DEPTH;
  }

  // Blur to soften the ridges a distance transform leaves along the middle.
  const blur = (src: Float32Array, r: number) => {
    const tmp = new Float32Array(n * n);
    const out = new Float32Array(n * n);
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        let s = 0;
        let c = 0;
        for (let k = -r; k <= r; k++) {
          const xx = x + k;
          if (xx < 0 || xx >= n) continue;
          s += src[y * n + xx];
          c++;
        }
        tmp[y * n + x] = s / c;
      }
    }
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        let s = 0;
        let c = 0;
        for (let k = -r; k <= r; k++) {
          const yy = y + k;
          if (yy < 0 || yy >= n) continue;
          s += tmp[yy * n + x];
          c++;
        }
        out[y * n + x] = s / c;
      }
    }
    return out;
  };
  height = blur(blur(height, 3), 3);
  const detail = blur(luma, 1);

  for (let i = 0; i < n * n; i++) {
    if (alpha[i] < 0.5) {
      height[i] = 0;
      continue;
    }
    height[i] += (detail[i] - 0.5) * DETAIL_DEPTH;
    height[i] = Math.max(height[i], RIM);
  }
  return height;
}

export default function Memoji3D({ alt, hint }: { alt: string; hint: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !supportsWebGL()) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    // Load three.js only once the memoji is about to be visible.
    const lazyObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        lazyObserver.disconnect();
        init();
      },
      { rootMargin: "200px" }
    );
    lazyObserver.observe(mount);

    async function init() {
      const [THREE, img] = await Promise.all([import("three"), loadImage(SRC)]);
      if (disposed || !mount) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.className = "absolute inset-0 h-full w-full";
      // Horizontal drags rotate; vertical swipes still scroll the page.
      canvas.style.touchAction = "pan-y";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 3.6);

      scene.add(new THREE.HemisphereLight(0xffffff, 0x8a7a70, 1.6));
      const key = new THREE.DirectionalLight(0xffffff, 1.9);
      key.position.set(-1.5, 2, 3);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.8);
      rim.position.set(2, 0.5, -2);
      scene.add(rim);

      const texture = new THREE.Texture(img);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.needsUpdate = true;

      // Relief mesh: a subdivided plane displaced by the height map. The back
      // is the same surface mirrored, so the memoji is a closed volume.
      const height = buildHeightMap(img, GRID);
      const geometry = new THREE.PlaneGeometry(2, 2, GRID - 1, GRID - 1);
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) pos.setZ(i, height[i]);
      geometry.computeVertexNormals();

      const frontMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        alphaTest: 0.5,
        roughness: 0.55,
        metalness: 0,
      });
      const backMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        alphaTest: 0.5,
        roughness: 0.7,
        metalness: 0,
        color: 0xb0a8a2,
      });
      const memoji = new THREE.Group();
      memoji.add(new THREE.Mesh(geometry, frontMaterial));
      const back = new THREE.Mesh(geometry, backMaterial);
      // three.js flips the winding for negatively scaled meshes itself.
      back.scale.z = -1;
      memoji.add(back);
      // Close the side wall between front and back with stacked cut-outs.
      const rimGeometry = new THREE.PlaneGeometry(2, 2);
      const rimMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        alphaTest: 0.5,
        side: THREE.DoubleSide,
        roughness: 0.8,
        color: 0x8f8580,
      });
      for (let i = 0; i < RIM_LAYERS; i++) {
        const layer = new THREE.Mesh(rimGeometry, rimMaterial);
        layer.position.z = -RIM + (2 * RIM * (i + 0.5)) / RIM_LAYERS;
        memoji.add(layer);
      }
      scene.add(memoji);

      mount.appendChild(canvas);

      // Drag to rotate, with a bit of inertia.
      let dragging = false;
      let autoRotate = !reducedMotion;
      let lastX = 0;
      let lastY = 0;
      let velocityY = 0;
      let targetTilt = 0;

      const onPointerDown = (e: PointerEvent) => {
        dragging = true;
        autoRotate = false;
        lastX = e.clientX;
        lastY = e.clientY;
        velocityY = 0;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        velocityY = dx * 0.012;
        memoji.rotation.y += velocityY;
        if (e.pointerType === "mouse") {
          targetTilt = THREE.MathUtils.clamp(
            targetTilt + dy * 0.008,
            -MAX_TILT,
            MAX_TILT
          );
        }
      };
      const onPointerUp = (e: PointerEvent) => {
        dragging = false;
        canvas.style.cursor = "grab";
        if (canvas.hasPointerCapture(e.pointerId)) {
          canvas.releasePointerCapture(e.pointerId);
        }
      };
      canvas.style.cursor = "grab";
      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);

      const clock = new THREE.Clock();
      const render = () => {
        const dt = Math.min(clock.getDelta(), 0.1);
        if (!dragging) {
          if (autoRotate) {
            memoji.rotation.y += dt * 0.5;
          } else {
            memoji.rotation.y += velocityY;
            velocityY *= 0.92;
          }
          targetTilt *= 0.96;
        }
        memoji.rotation.x += (targetTilt - memoji.rotation.x) * 0.15;
        renderer.render(scene, camera);
      };
      renderer.setAnimationLoop(render);
      render();
      setReady(true);

      // Pause rendering while the memoji is off screen.
      let visible = true;
      const visibilityObserver = new IntersectionObserver((entries) => {
        const nowVisible = entries.some((e) => e.isIntersecting);
        if (nowVisible === visible) return;
        visible = nowVisible;
        if (visible) clock.getDelta();
        renderer.setAnimationLoop(visible ? render : null);
      });
      visibilityObserver.observe(mount);

      const resizeObserver = new ResizeObserver(() => {
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      });
      resizeObserver.observe(mount);

      cleanup = () => {
        visibilityObserver.disconnect();
        resizeObserver.disconnect();
        renderer.setAnimationLoop(null);
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        geometry.dispose();
        rimGeometry.dispose();
        rimMaterial.dispose();
        frontMaterial.dispose();
        backMaterial.dispose();
        texture.dispose();
        renderer.dispose();
        canvas.remove();
      };
    }

    return () => {
      disposed = true;
      lazyObserver.disconnect();
      cleanup?.();
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={mountRef}
        className="relative"
        style={{ width: SIZE, maxWidth: "100%", aspectRatio: "1" }}
      >
        <Image
          src={SRC}
          width={SIZE}
          height={SIZE}
          alt={alt}
          quality={90}
          priority={true}
          className={`pointer-events-none absolute inset-0 h-full w-full transition-opacity duration-300 ${
            ready ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
      <p
        className={`text-sm opacity-70 mt-1 transition-opacity duration-300 ${
          ready ? "visible" : "invisible"
        }`}
      >
        {hint}
      </p>
    </div>
  );
}
