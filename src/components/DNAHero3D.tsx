import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

function DNAStrand() {
  const group = useRef<THREE.Group>(null);

  // Helix ke points generate karo
  const pairs = useMemo(() => {
    const arr: { y: number; angle: number }[] = [];
    for (let i = 0; i < 24; i++) {
      arr.push({ y: (i - 12) * 0.42, angle: i * 0.55 });
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    // Slow auto-rotation + mouse parallax
    group.current.rotation.y = state.clock.elapsedTime * 0.25;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x, state.pointer.y * 0.25, 0.05
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z, state.pointer.x * 0.15, 0.05
    );
  });

  return (
    <group ref={group}>
      {pairs.map(({ y, angle }, i) => {
        const x1 = Math.cos(angle) * 1.4, z1 = Math.sin(angle) * 1.4;
        const x2 = -x1, z2 = -z1;
        return (
          <group key={i} position={[0, y, 0]}>
            {/* Backbone spheres */}
            <mesh position={[x1, 0, z1]}>
              <sphereGeometry args={[0.14, 24, 24]} />
              <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.6} roughness={0.2} />
            </mesh>
            <mesh position={[x2, 0, z2]}>
              <sphereGeometry args={[0.14, 24, 24]} />
              <meshStandardMaterial color="#a78bfa" emissive="#7c3aed" emissiveIntensity={0.6} roughness={0.2} />
            </mesh>
            {/* Base-pair rod */}
            <mesh position={[0, 0, 0]} rotation={[0, -angle, Math.PI / 2]}>
              <cylinderGeometry args={[0.035, 0.035, 2.8, 12]} />
              <meshStandardMaterial color="#e2e8f0" transparent opacity={0.55} roughness={0.35} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function DNAHeroContent() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 6]} intensity={1.2} color="#22d3ee" />
      <pointLight position={[-6, -4, -6]} intensity={0.8} color="#a78bfa" />
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.6}>
        <DNAStrand />
      </Float>
      <Environment preset="city" />
    </>
  );
}

export default function DNAHero3D() {
  // Check for mobile and reduced motion
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isMobile || prefersReducedMotion) {
    // Static gradient fallback for mobile and accessibility
    return (
      <div 
        className="hero-3d-fallback"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(34, 211, 238, 0.15) 0%, transparent 70%), radial-gradient(ellipse at top right, rgba(167, 139, 250, 0.12) 0%, transparent 60%)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />
    );
  }

  return (
    <div className="hero-3d" aria-hidden>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <Suspense fallback={null}>
          <DNAHeroContent />
        </Suspense>
      </Canvas>
    </div>
  );
}
