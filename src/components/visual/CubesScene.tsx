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

type Item = { kind: "cube" | "sphere"; size: number };

// Free-floating rigid bodies. They roam the whole canvas (even behind the hero text),
// bounce off the invisible edges of the view, and collide elastically with each other.
const ITEMS: Item[] = [
  { kind: "cube", size: 1.15 },
  { kind: "cube", size: 1.0 },
  { kind: "cube", size: 1.3 },
  { kind: "cube", size: 0.9 },
  { kind: "cube", size: 1.1 },
  { kind: "cube", size: 0.8 },
  { kind: "sphere", size: 0.95 },
  { kind: "sphere", size: 0.8 },
  { kind: "sphere", size: 0.7 },
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

const CURSOR_R = 0.4; // physical radius of the cursor "paddle" — it only touches what it actually overlaps
const TAN = Math.tan(THREE.MathUtils.degToRad(16)); // half of fov 32
const MAX_SPEED = 3.5;
const MIN_SPEED = 0.35;
const MAX_SPIN = 2.5; // rad/s
const FAR = new THREE.Vector3(0, 0, 60);

function createSim() {
  const world = new CANNON.World({ gravity: new CANNON.Vec3(0, 0, 0) });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = false;
  (world.solver as CANNON.GSSolver).iterations = 20;
  const mat = new CANNON.Material("body");
  world.defaultContactMaterial = new CANNON.ContactMaterial(mat, mat, {
    friction: 0.05,
    restitution: 0.8,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
  });
  const bodies = ITEMS.map((it) => {
    const shape =
      it.kind === "cube" ? new CANNON.Box(new CANNON.Vec3(it.size / 2, it.size / 2, it.size / 2)) : new CANNON.Sphere(it.size / 2);
    const b = new CANNON.Body({ mass: it.size ** 3, shape, linearDamping: 0.12, angularDamping: 0.04 });
    b.linearFactor.set(1, 1, 0);
    return b;
  });
  bodies.forEach((b) => world.addBody(b));
  const cursor = new CANNON.Body({ type: CANNON.Body.KINEMATIC, shape: new CANNON.Sphere(CURSOR_R) });
  cursor.position.set(FAR.x, FAR.y, FAR.z);
  world.addBody(cursor);
  return { world, bodies, cursor };
}

function Cubes({ paused }: { paused: boolean }) {
  const gl = useThree((state) => state.gl);
  const light = useRef<THREE.PointLight>(null);
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const placed = useRef(false);
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

  // Zero-gravity world; motion is locked to the z = 0 plane so the cursor maps exactly onto the bodies.
  const simRef = useRef<ReturnType<typeof createSim> | null>(null);
  useEffect(() => {
    simRef.current = createSim();
    placed.current = false;
    return () => {
      simRef.current = null;
    };
  }, []);

  const pointer = useRef({ active: false, x: 0, y: 0, burst: false });
  const target = useRef(FAR.clone());

  // Listen on window so the cursor interacts even through the text that sits above the canvas.
  useEffect(() => {
    const el = gl.domElement;
    const inside = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const ok = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (ok) {
        pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      }
      return ok;
    };
    const move = (e: PointerEvent) => void (pointer.current.active = inside(e));
    const down = (e: PointerEvent) => {
      if (!inside(e)) return;
      if ((e.target as Element | null)?.closest("a,button,input,textarea,label,select")) return;
      pointer.current.burst = true;
    };
    const out = (e: MouseEvent) => {
      if (!e.relatedTarget) pointer.current.active = false;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("mouseout", out);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      document.removeEventListener("mouseout", out);
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
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  useFrame(({ camera, size }, delta) => {
    if (paused) return;
    const dt = Math.min(delta, 1 / 30);
    const sim = simRef.current;
    if (!sim) return;
    const { world, bodies, cursor } = sim;

    // Keep the whole width in view on narrow screens by dollying the camera back.
    const aspect = size.width / size.height;
    const camZ = THREE.MathUtils.clamp(3.4 / (TAN * aspect), 10.5, 40);
    if (Math.abs(camera.position.z - camZ) > 0.01) {
      camera.position.z = camZ;
      camera.updateMatrixWorld();
    }
    const halfH = TAN * camZ;
    const halfW = halfH * aspect;

    // First frame: scatter bodies across the visible area with random drift.
    if (!placed.current) {
      placed.current = true;
      bodies.forEach((b, i) => {
        const ang = i * 2.399;
        const r = Math.sqrt((i + 0.5) / bodies.length);
        b.position.set(Math.cos(ang) * r * (halfW - 1.2), Math.sin(ang) * r * (halfH - 1.2), 0);
        b.quaternion.setFromEuler(Math.random() * 3, Math.random() * 3, Math.random() * 3);
        const v = 0.4 + Math.random() * 0.5;
        const a2 = Math.random() * Math.PI * 2;
        b.velocity.set(Math.cos(a2) * v, Math.sin(a2) * v, 0);
        b.angularVelocity.set((Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 1.2);
      });
    }

    // Cursor → exact world point on z = 0.
    const p = pointer.current;
    if (p.active) {
      ndc.set(p.x, p.y);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) target.current.lerp(hit, Math.min(1, dt * 18));
    } else {
      target.current.lerp(FAR, Math.min(1, dt * 4));
    }
    const c = target.current;
    // Kinematic paddle: velocity-driven (so contacts carry real momentum), clamped to avoid tunnelling.
    const cv = new CANNON.Vec3((c.x - cursor.position.x) / dt, (c.y - cursor.position.y) / dt, 0);
    const cs = cv.length();
    if (cs > 7 && c.z < 10) cv.scale(7 / cs, cv);
    if (c.z >= 10) cursor.position.set(c.x, c.y, c.z);
    cursor.velocity.copy(cv);
    if (c.z < 10) cursor.position.z = 0;

    if (p.burst && c.z < 10) {
      bodies.forEach((b) => {
        const dx = b.position.x - c.x, dy = b.position.y - c.y;
        const d = Math.hypot(dx, dy) + 0.4;
        const f = (2.2 * b.mass) / (d * 0.5 + 0.5);
        b.applyImpulse(new CANNON.Vec3((dx / d) * f, (dy / d) * f, 0));
        b.angularVelocity.x += (Math.random() - 0.5) * 4;
        b.angularVelocity.y += (Math.random() - 0.5) * 4;
      });
    }
    p.burst = false;

    // Small fixed sub-steps keep collisions stable.
    world.step(1 / 120, dt, 8);

    bodies.forEach((b, i) => {
      const it = ITEMS[i];
      const m = it.kind === "cube" ? it.size * 0.78 : it.size * 0.5;
      // Elastic bounce off the view edges so nothing is ever clipped by the canvas.
      const maxX = halfW - m, maxY = halfH - m;
      if (b.position.x > maxX) { b.position.x = maxX; b.velocity.x = -Math.abs(b.velocity.x) * 0.92; }
      if (b.position.x < -maxX) { b.position.x = -maxX; b.velocity.x = Math.abs(b.velocity.x) * 0.92; }
      if (b.position.y > maxY) { b.position.y = maxY; b.velocity.y = -Math.abs(b.velocity.y) * 0.92; }
      if (b.position.y < -maxY) { b.position.y = -maxY; b.velocity.y = Math.abs(b.velocity.y) * 0.92; }
      b.position.z = 0;
      b.velocity.z = 0;
      const w = b.angularVelocity.length();
      if (w > MAX_SPIN) b.angularVelocity.scale(MAX_SPIN / w, b.angularVelocity);
      // Keep things drifting (no friction in space) but never racing.
      const sp = Math.hypot(b.velocity.x, b.velocity.y);
      if (sp > MAX_SPEED) { b.velocity.x *= MAX_SPEED / sp; b.velocity.y *= MAX_SPEED / sp; }
      else if (sp < MIN_SPEED) {
        const k = sp > 0.01 ? MIN_SPEED / sp : 0;
        if (k) { b.velocity.x *= 1 + (k - 1) * Math.min(1, dt * 1.5); b.velocity.y *= 1 + (k - 1) * Math.min(1, dt * 1.5); }
        else b.velocity.set(Math.random() - 0.5, Math.random() - 0.5, 0);
      }
      const mesh = meshes.current[i];
      if (!mesh) return;
      mesh.position.set(b.position.x, b.position.y, 0);
      mesh.quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w);
    });

    // Violet light follows the cursor and rakes across the metal.
    if (light.current) {
      light.current.position.set(c.x, c.y, 3);
      light.current.intensity = THREE.MathUtils.lerp(light.current.intensity, p.active ? 45 : 0, Math.min(1, dt * 6));
    }
  });

  return (
    <>
      <pointLight ref={light} color="#b98cff" intensity={0} distance={8} decay={1.6} />
      {ITEMS.map((it, i) => (
        <mesh
          key={i}
          ref={(el) => void (meshes.current[i] = el)}
          geometry={it.kind === "cube" ? cubeGeo : sphereGeo}
          material={it.kind === "cube" ? cubeMat : sphereMat}
          scale={it.size}
          position={[0, 0, -50]}
        />
      ))}
    </>
  );
}

export default function CubesScene({ paused = false }: CubesSceneProps) {
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 12], fov: 32 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ background: "transparent", touchAction: "pan-y" }}
      aria-hidden="true"
    >
      <NeonEnvironment />
      <Cubes paused={paused} />
    </Canvas>
  );
}
