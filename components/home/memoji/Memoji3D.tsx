"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SIZE = 300;
const LAYERS = 24;
const DEPTH = 0.14;

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
      const [THREE, { OrbitControls }] = await Promise.all([
        import("three"),
        import("three/examples/jsm/controls/OrbitControls.js"),
      ]);
      if (disposed || !mount) return;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.style.display = "block";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      camera.position.set(0, 0, 3.4);

      const texture = await new THREE.TextureLoader().loadAsync("/memoji.webp");
      if (disposed) {
        texture.dispose();
        renderer.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      // Stack cut-out layers of the memoji to give it real thickness: the
      // front and back faces keep full color, inner layers are darker so the
      // edge reads as a solid side when rotated.
      const geometry = new THREE.PlaneGeometry(2, 2);
      const materials: InstanceType<typeof THREE.MeshBasicMaterial>[] = [];
      const memoji = new THREE.Group();
      for (let i = 0; i < LAYERS; i++) {
        const isFace = i === 0 || i === LAYERS - 1;
        const material = new THREE.MeshBasicMaterial({
          map: texture,
          alphaTest: 0.5,
          side: THREE.DoubleSide,
          color: isFace ? 0xffffff : 0x9a8578,
        });
        materials.push(material);
        const layer = new THREE.Mesh(geometry, material);
        layer.position.z = DEPTH / 2 - (i / (LAYERS - 1)) * DEPTH;
        memoji.add(layer);
      }
      scene.add(memoji);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.8;
      controls.minPolarAngle = Math.PI / 2 - 0.5;
      controls.maxPolarAngle = Math.PI / 2 + 0.5;
      controls.autoRotate = !reducedMotion;
      controls.autoRotateSpeed = 1.5;
      controls.addEventListener("start", () => {
        controls.autoRotate = false;
        mount.style.cursor = "grabbing";
      });
      controls.addEventListener("end", () => {
        mount.style.cursor = "grab";
      });

      mount.appendChild(renderer.domElement);
      // Horizontal drags rotate; vertical swipes still scroll the page on touch.
      renderer.domElement.style.touchAction = "pan-y";

      let visible = true;
      const render = () => {
        controls.update();
        renderer.render(scene, camera);
      };
      renderer.setAnimationLoop(render);
      render();
      setReady(true);

      // Pause rendering while the memoji is off screen.
      const visibilityObserver = new IntersectionObserver((entries) => {
        const nowVisible = entries.some((e) => e.isIntersecting);
        if (nowVisible === visible) return;
        visible = nowVisible;
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
        controls.dispose();
        geometry.dispose();
        materials.forEach((m) => m.dispose());
        texture.dispose();
        renderer.dispose();
        renderer.domElement.remove();
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
        className="relative cursor-grab"
        style={{ width: SIZE, maxWidth: "100%", aspectRatio: "1" }}
      >
        <Image
          src="/memoji.webp"
          width={SIZE}
          height={SIZE}
          alt={alt}
          quality={90}
          priority={true}
          className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
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
