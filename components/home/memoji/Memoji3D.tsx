"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SIZE = 300;
const SRC = "/memoji-3d.webp";
const MAX_TILT = 0.45;

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
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
      const [THREE, { addLights, buildHead, disposeHead }] = await Promise.all([
        import("three"),
        import("./head"),
      ]);
      if (disposed || !mount) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.className = "absolute inset-0 h-full w-full";
      // Horizontal drags rotate; vertical swipes still scroll the page.
      canvas.style.touchAction = "pan-y";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0.05, 5.6);

      addLights(scene);

      const memoji = new THREE.Group();
      const head = buildHead();
      head.position.y = -0.02;
      memoji.add(head);
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
        disposeHead(head);
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
