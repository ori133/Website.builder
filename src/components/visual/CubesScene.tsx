"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import * as CANNON from "cannon-es";

export type CubesSceneProps = {
  /** Pause rendering + simulation (offscreen / hidden). */
  paused?: boolean;
};

type Item = { kind: "cube" | "sphere"; size: number; home: [number, number, number]; rot: [number, number, number] };

// A loose floating cluster. Homes are spaced so nothing overlaps at rest; every body is a
// real rigid body, so they collide, bounce and get shoved around by the cursor instead of clipping.
const ITEMS: Item[] = [
  { kind: "cube", size: 1.3, home: [-1.55, 1.55, 0], rot: [0.5, 0.6, 0.1] },
  { kind: "cube", size: 1.1, home: [1.7, 1.7, 0.2], rot: [0.3, -0.7, 0.4] },
  { kind: "cube", size: 1.45, home: [0, 0, 0.3], rot: [-0.4, 0.5, 0.3] },
  { kind: "cube", size: 1.1, home: [-1.5, -1.7, 0], rot: [0.6, 0.2, -0.5] },
  { kind: "cube", size: 1.3, home: [1.6, -1.55, 0.1], rot: [-0.3, 0.8, 0.2] },
  { kind: "cube", size: 0.9, home: [0.2, 2.2, -0.3], rot: [0.7, 0.3, 0.6] },
  { kind: "sphere", size: 1.0, home: [-2.45, 0.2, 0.3], rot: [0, 0, 0] },
  { kind: "sphere", size: 0.9, home: [2.5, 0.3, 0], rot: [0, 0, 0] },
  { kind: "sphere", size: 0.85, home: [0.1, -2.6, 0.2], rot: [0, 0, 0] },
];

// Neon palette mirrored from the design tokens.
const NEON = ["#ff2bd6", "#2f6bff", "#18e29a", "#ffa626"] as const;

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

const CURSOR_R = 1.0;
const FAR = new THREE.Vector3(0, 0, 60);

function Cubes({ paused }: { paused: boolean }) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const light = useRef<THREE.PointLight>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const dots = useDotTexture();

  const cubeGeo = useMemo(() => new RoundedBoxGeometry(1, 1, 1, 5, 0.09), []);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.5, 48, 32), []);
  const cubeMat = useMemo(
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
  const sphereMat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#2a2447", metalness: 1, roughness: 0.3, clearcoat: 1, envMapIntensity: 2.4 }),
    [],
  );

  // Physics world: zero gravity, bodies are pulled to their "home" by a soft spring.
  const sim = useMemo(() => {
    const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
    world.allowSleep = false;
    const mat = new CANNON.Material("body");
    world.defaultContactMaterial = new CANNON.ContactMaterial(mat, mat, { friction: 0.15, restitution: 0.35 });
    const bodies = ITEMS.map((it) => {
      const shape = it.kind === "cube" ? new CANNON.Box(new CANNON.Vec3(it.size / 2, it.size / 2, it.size / 2)) : new CANNON.Sphere(it.size / 2);
      const mass = it.size ** 3;
      const b = new CANNON.Body({ mass, shape, linearDamping: 0.55, angularDamping: 0.6 });
      b.position.set(...it.home);
      b.quaternion.setFromEuler(...it.rot);
      return b;
    });
    bodies.forEach((b) => world.addBody(b));
    // Kinematic sphere that follows the cursor and physically shoves things.
    const cursor = new CANNON.Body({ type: CANNON.Body.KINEMATIC, shape: new CANNON.Sphere(CURSOR_R) });
    cursor.position.set(FAR.x, FAR.y, FAR.z);
    world.addBody(cursor);
    return { world, bodies, cursor };
  }, []);

  const pointer = useRef({ active: false, x: 0, y: 0, burst: false });
  const target = useRef(FAR.clone());
  const t = useRef(0);

  useEffect(() => {
    const el = gl.domElement;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      pointer.current.active = true;
    };
    const leave = () => (pointer.current.active = false);
    const down = (e: PointerEvent) => {
      move(e);
      pointer.current.burst = true;
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerdown", down);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerdown", down);
    };
  }, [gl]);

  useEffect(
    () => () => {
      cubeGeo.dispose();
      sphereGeo.dispose();
      cubeMat.dispose();
      sphereMat.dispose();
      dots.dispose();
    },
    [cubeGeo, sphereGeo, cubeMat, sphereMat, dots],
  );

  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -0.2), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const tmpQ = useMemo(() => new CANNON.Quaternion(), []);
  const tmpTarget = useMemo(() => new CANNON.Quaternion(), []);

  useFrame((_, delta) => {
    if (paused) return;
    const dt = Math.min(delta, 1 / 30);
    t.current += dt;
    const { world, bodies, cursor } = sim;

    // Cursor → world point on the z≈0 plane.
    const p = pointer.current;
    if (p.active) {
      ray.setFromCamera(new THREE.Vector2(p.x, p.y), camera);
      if (ray.ray.intersectPlane(plane, hit)) target.current.lerp(hit, Math.min(1, dt * 14));
    } else {
      target.current.lerp(FAR, Math.min(1, dt * 3));
    }
    // Kinematic body moves via velocity so contacts transfer momentum.
    const c = target.current;
    cursor.velocity.set((c.x - cursor.position.x) / dt, (c.y - cursor.position.y) / dt, (c.z - cursor.position.z) / dt);

    bodies.forEach((b, i) => {
      const it = ITEMS[i];
      // Gentle idle drift so the cluster feels alive.
      const ox = Math.sin(t.current * 0.6 + i * 1.7) * 0.1;
      const oy = Math.cos(t.current * 0.5 + i * 2.3) * 0.1;
      const k = 5 * b.mass;
      b.applyForce(new CANNON.Vec3((it.home[0] + ox - b.position.x) * k, (it.home[1] + oy - b.position.y) * k, (it.home[2] - b.position.z) * k * 1.5));
      // Click → radial impulse away from the cursor.
      if (p.burst && c.z < 10) {
        const dx = b.position.x - c.x, dy = b.position.y - c.y;
        const d = Math.hypot(dx, dy) + 0.3;
        const f = (7 * b.mass) / (d * 0.6 + 0.6);
        b.applyImpulse(new CANNON.Vec3((dx / d) * f, (dy / d) * f, 0.4 * f * (Math.random() - 0.3)));
        b.angularVelocity.set(b.angularVelocity.x + (Math.random() - 0.5) * 6, b.angularVelocity.y + (Math.random() - 0.5) * 6, b.angularVelocity.z + (Math.random() - 0.5) * 3);
      }
      // Torque back toward the resting orientation (cubes only), so they settle upright-ish.
      if (it.kind === "cube") {
        tmpTarget.setFromEuler(it.rot[0] + t.current * 0.12, it.rot[1] + t.current * 0.18, it.rot[2]);
        b.quaternion.inverse(tmpQ);
        const err = tmpTarget.mult(tmpQ);
        if (err.w < 0) { err.x = -err.x; err.y = -err.y; err.z = -err.z; err.w = -err.w; }
        const s = 3.2 * b.mass;
        b.applyTorque(new CANNON.Vec3(err.x * s, err.y * s, err.z * s));
      }
    });
    p.burst = false;

    world.step(1 / 60, dt, 4);

    bodies.forEach((b, i) => {
      const m = meshes.current[i];
      if (!m) return;
      m.position.set(b.position.x, b.position.y, b.position.z);
      m.quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
    });

    // Violet light follows the cursor and rakes across the metal.
    if (light.current) {
      light.current.position.set(c.x, c.y, 3);
      light.current.intensity = THREE.MathUtils.lerp(light.current.intensity, p.active ? 60 : 0, Math.min(1, dt * 6));
    }
  });

  return (
    <>
      <pointLight ref={light} color="#b98cff" intensity={0} distance={9} decay={1.6} />
      {ITEMS.map((it, i) => (
        <mesh
          key={i}
          ref={(el) => void (meshes.current[i] = el)}
          geometry={it.kind === "cube" ? cubeGeo : sphereGeo}
          material={it.kind === "cube" ? cubeMat : sphereMat}
          scale={it.kind === "cube" ? it.size : it.size * 1}
          position={it.home}
        />
      ))}
    </>
  );
}

export default function CubesScene({ paused = false }: CubesSceneProps) {
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={[1, 2]}
      camera={{ position: [0, 0, 12], fov: 32 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent", cursor: "grab", touchAction: "pan-y" }}
      aria-hidden="true"
    >
      <NeonEnvironment />
      <Cubes paused={paused} />
    </Canvas>
  );
}
