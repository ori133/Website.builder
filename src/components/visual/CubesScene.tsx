"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type CubesSceneProps = {
  /** Seconds for one full assemble → scatter → assemble loop. */
  period?: number;
  /** Strength of the scatter (0 = static cluster). */
  spread?: number;
  /** Pause rendering (offscreen / hidden). */
  paused?: boolean;
};

// Assembled layout: an interlocking cluster (x, y, z) in cube units.
const HOME: [number, number, number][] = [
  [-1.05, 0.95, 0],
  [1.05, 0.95, 0.2],
  [0, 0, 0.5],
  [-1.05, -1.0, -0.2],
  [1.05, -1.0, 0],
  [0, 2.05, -0.4],
];
// Where each cube drifts to at the "exploded" half of the loop.
const AWAY: [number, number, number][] = [
  [-2.5, 1.9, 1.2],
  [2.6, 1.5, -0.8],
  [0.3, -0.2, 2.2],
  [-2.2, -1.9, -0.6],
  [2.3, -2.0, 1.0],
  [0.4, 3.0, -1.6],
];
const SPIN: [number, number, number][] = [
  [1.4, 2.2, 0.6],
  [-1.8, 1.2, 1.0],
  [2.0, -1.5, 1.7],
  [-1.1, 2.4, -0.9],
  [1.6, -2.0, 0.8],
  [-2.2, 1.1, 1.5],
];

// Neon palette mirrored from the design tokens.
const NEON = ["#ff2bd6", "#2f6bff", "#18e29a", "#ffa626"] as const;

const ease = (x: number) => x * x * (3 - 2 * x); // smoothstep

/** Fine dot-grid used as a roughness map for the perforated-metal look. */
function useDotTexture() {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    g.fillStyle = "#555";
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "#e8e8e8";
    for (let y = 0; y < 128; y += 8) {
      for (let x = 0; x < 128; x += 8) {
        g.beginPath();
        g.arc(x + 4, y + 4, 2.4, 0, Math.PI * 2);
        g.fill();
      }
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.5, 1.5);
    t.colorSpace = THREE.NoColorSpace;
    return t;
  }, []);
}

/** Studio environment with colored light panels → neon reflections on dark metal. */
function NeonEnvironment() {
  const gl = useThree((state) => state.gl);
  const target = useMemo(() => {
    const env = new THREE.Scene();
    env.background = new THREE.Color("#02010a");
    const panel = (color: string, intensity: number, pos: [number, number, number], size: [number, number]) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(...size),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
      );
      m.position.set(...pos);
      m.lookAt(0, 0, 0);
      env.add(m);
    };
    panel("#ffffff", 9, [0, 9, 3], [16, 5]);
    panel("#e9d5ff", 6, [-8, 2, 4], [5, 12]);
    panel(NEON[0], 7, [8, -3, 4], [2.5, 9]);
    panel(NEON[1], 7, [-6, -6, 3], [8, 2.5]);
    panel(NEON[2], 4, [5, 6, -5], [6, 2]);
    panel(NEON[3], 4, [-7, 5, -4], [2.5, 7]);
    const pmrem = new THREE.PMREMGenerator(gl);
    const rt = pmrem.fromScene(env, 0.04);
    pmrem.dispose();
    env.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        (o.material as THREE.Material).dispose();
      }
    });
    return rt;
  }, [gl]);

  useEffect(() => () => target.dispose(), [target]);
  return <primitive object={target.texture} attach="environment" />;
}

function Cubes({ period, spread }: Required<Pick<CubesSceneProps, "period" | "spread">>) {
  const group = useRef<THREE.Group>(null);
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const geometry = useMemo(() => new RoundedBoxGeometry(1.5, 1.5, 1.5, 4, 0.12), []);
  const dots = useDotTexture();
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#14142a",
        metalness: 1,
        roughness: 0.22,
        roughnessMap: dots,
        iridescence: 1,
        iridescenceIOR: 1.6,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        envMapIntensity: 2.8,
      }),
    [dots],
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      geometry.dispose();
      material.dispose();
      dots.dispose();
    };
  }, [geometry, material, dots]);

  useFrame(({ clock }, delta) => {
    const p = (clock.elapsedTime % period) / period; // 0..1, seamless loop
    // 0 = assembled, 1 = scattered; dwell at both ends.
    const b = ease(Math.min(1, Math.max(0, (0.5 - 0.5 * Math.cos(p * Math.PI * 2)) * 1.4 - 0.2))) * spread;

    refs.current.forEach((m, i) => {
      if (!m) return;
      const h = HOME[i], a = AWAY[i], s = SPIN[i];
      m.position.set(h[0] + (a[0] - h[0]) * b, h[1] + (a[1] - h[1]) * b, h[2] + (a[2] - h[2]) * b);
      m.rotation.set(s[0] * b, s[1] * b, s[2] * b);
    });

    const g = group.current;
    if (g) {
      // One full turn per loop keeps the cycle continuous.
      const targetX = 0.3 + pointer.current.y * 0.12;
      const targetY = p * Math.PI * 2 + pointer.current.x * 0.25;
      g.rotation.x += (targetX - g.rotation.x) * Math.min(1, delta * 4);
      // y follows time directly (no lerp) so it can wrap seamlessly.
      g.rotation.y = targetY;
    }
  });

  return (
    <group ref={group} scale={0.72}>
      {HOME.map((_, i) => (
        <mesh key={i} ref={(el) => void (refs.current[i] = el)} geometry={geometry} material={material} />
      ))}
    </group>
  );
}

export default function CubesScene({ period = 9, spread = 1, paused = false }: CubesSceneProps) {
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 11], fov: 32 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent" }}
      aria-hidden="true"
    >
      <NeonEnvironment />
      <Cubes period={period} spread={spread} />
    </Canvas>
  );
}
