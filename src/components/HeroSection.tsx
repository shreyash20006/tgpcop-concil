import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { ArrowRight, HelpCircle } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    
    // CAMERA SETUP
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    // RENDERER SETUP
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc84b0e, 0.5); // Warm orange glow light
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // PALETTE
    const colors = [
      new THREE.Color('#0D1B3E'), // Deep Navy
      new THREE.Color('#C84B0E'), // Burnt Orange
      new THREE.Color('#F5A623'), // Gold Accent
    ];

    // FLOATABLE PARTICLE CLASS
    const particlesArray: {
      mesh: THREE.Group | THREE.Mesh;
      speedX: number;
      speedY: number;
      rotSpeedX: number;
      rotSpeedY: number;
      rotSpeedZ: number;
      baseY: number;
      floatOffset: number;
    }[] = [];

    // PHARMACY-THEMED 3D GEOMETRIES
    
    // 1. Medicine Capsule/Pill
    const pillGeo = new THREE.CapsuleGeometry(0.12, 0.35, 8, 16);
    
    // 2. Medicine Bottle
    const createMedicineBottle = (color: THREE.Color) => {
      const bottleGroup = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.9
      });
      
      // Bottle body
      const bodyGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.5, 16);
      const body = new THREE.Mesh(bodyGeo, material);
      bottleGroup.add(body);
      
      // Bottle neck
      const neckGeo = new THREE.CylinderGeometry(0.08, 0.15, 0.15, 16);
      const neck = new THREE.Mesh(neckGeo, material);
      neck.position.y = 0.325;
      bottleGroup.add(neck);
      
      // Cap
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xf5a623,
        roughness: 0.3,
        metalness: 0.7
      });
      const capGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16);
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.y = 0.44;
      bottleGroup.add(cap);
      
      return bottleGroup;
    };
    
    // 3. DNA Helix
    const createDNAHelix = (color: THREE.Color) => {
      const dnaGroup = new THREE.Group();
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.8
      });
      
      const sphereGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const segments = 12;
      
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 4;
        const y = (i / segments) * 0.8 - 0.4;
        
        // Strand 1
        const sphere1 = new THREE.Mesh(sphereGeo, material);
        sphere1.position.set(Math.cos(angle) * 0.15, y, Math.sin(angle) * 0.15);
        dnaGroup.add(sphere1);
        
        // Strand 2 (opposite)
        const sphere2 = new THREE.Mesh(sphereGeo, material);
        sphere2.position.set(Math.cos(angle + Math.PI) * 0.15, y, Math.sin(angle + Math.PI) * 0.15);
        dnaGroup.add(sphere2);
      }
      
      return dnaGroup;
    };
    
    // 4. Molecular Structure (Benzene Ring)
    const createMolecule = (color: THREE.Color) => {
      const moleculeGroup = new THREE.Group();
      const atomMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.8
      });
      const bondMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.4,
        metalness: 0.6
      });
      
      const atomGeo = new THREE.SphereGeometry(0.08, 12, 12);
      const bondGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.25, 8);
      
      // Create hexagonal ring
      const atoms = 6;
      const radius = 0.25;
      
      for (let i = 0; i < atoms; i++) {
        const angle = (i / atoms) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        // Atom
        const atom = new THREE.Mesh(atomGeo, atomMat);
        atom.position.set(x, 0, z);
        moleculeGroup.add(atom);
        
        // Bond to next atom
        const nextAngle = ((i + 1) / atoms) * Math.PI * 2;
        const bond = new THREE.Mesh(bondGeo, bondMat);
        bond.position.set(
          (x + Math.cos(nextAngle) * radius) / 2,
          0,
          (z + Math.sin(nextAngle) * radius) / 2
        );
        bond.rotation.z = angle + Math.PI / 2;
        moleculeGroup.add(bond);
      }
      
      return moleculeGroup;
    };
    
    // 5. Syringe
    const createSyringe = (color: THREE.Color) => {
      const syringeGroup = new THREE.Group();
      
      // Barrel
      const barrelMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.1,
        metalness: 0.7,
        transparent: true,
        opacity: 0.8
      });
      const barrelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 16);
      const barrel = new THREE.Mesh(barrelGeo, barrelMat);
      syringeGroup.add(barrel);
      
      // Plunger
      const plungerMat = new THREE.MeshStandardMaterial({
        color: 0xf5a623,
        roughness: 0.3,
        metalness: 0.6
      });
      const plungerGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.3, 16);
      const plunger = new THREE.Mesh(plungerGeo, plungerMat);
      plunger.position.y = 0.4;
      syringeGroup.add(plunger);
      
      // Needle
      const needleMat = new THREE.MeshStandardMaterial({
        color: 0xaaaaaa,
        roughness: 0.1,
        metalness: 0.95
      });
      const needleGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.25, 8);
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.y = -0.375;
      syringeGroup.add(needle);
      
      return syringeGroup;
    };
    
    // 6. Mortar & Pestle (Traditional Pharmacy Symbol)
    const createMortarPestle = (color: THREE.Color) => {
      const mortarGroup = new THREE.Group();
      
      // Bowl
      const bowlMat = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.2,
        metalness: 0.8,
        side: THREE.DoubleSide
      });
      const bowlGeo = new THREE.CylinderGeometry(0.25, 0.15, 0.2, 16, 1, true);
      const bowl = new THREE.Mesh(bowlGeo, bowlMat);
      mortarGroup.add(bowl);
      
      // Base
      const baseGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16);
      const base = new THREE.Mesh(baseGeo, bowlMat);
      base.position.y = -0.1;
      mortarGroup.add(base);
      
      // Pestle
      const pestleMat = new THREE.MeshStandardMaterial({
        color: 0xf5a623,
        roughness: 0.1,
        metalness: 0.9
      });
      const pestleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8);
      const pestle = new THREE.Mesh(pestleGeo, pestleMat);
      pestle.position.set(0.08, 0.05, 0);
      pestle.rotation.z = -Math.PI / 4;
      mortarGroup.add(pestle);
      
      return mortarGroup;
    };

    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      let particleMesh: THREE.Group | THREE.Mesh;
      const color = colors[i % colors.length];
      const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.15,
        metalness: 0.75,
      });

      // Distribute pharmacy-themed objects
      const geoType = i % 6;
      if (geoType === 0) {
        // Pills/Capsules
        particleMesh = new THREE.Mesh(pillGeo, material);
      } else if (geoType === 1) {
        // Medicine Bottles
        particleMesh = createMedicineBottle(color);
      } else if (geoType === 2) {
        // DNA Helix
        particleMesh = createDNAHelix(color);
      } else if (geoType === 3) {
        // Molecular Structures
        particleMesh = createMolecule(color);
      } else if (geoType === 4) {
        // Syringes
        particleMesh = createSyringe(color);
      } else {
        // Mortar & Pestle
        particleMesh = createMortarPestle(color);
      }

      // Random position
      particleMesh.position.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6
      );

      // Random scales
      const scale = 0.5 + Math.random() * 0.8;
      particleMesh.scale.set(scale, scale, scale);

      scene.add(particleMesh);

      particlesArray.push({
        mesh: particleMesh,
        speedX: (Math.random() - 0.5) * 0.005,
        speedY: (Math.random() - 0.5) * 0.005,
        rotSpeedX: (Math.random() - 0.5) * 0.015,
        rotSpeedY: (Math.random() - 0.5) * 0.015,
        rotSpeedZ: (Math.random() - 0.5) * 0.015,
        baseY: particleMesh.position.y,
        floatOffset: Math.random() * Math.PI * 2,
      });
    }

    // MOUSE PARALLAX HANDLER
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // RESIZE HANDLER
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    const animate = () => {
      requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Slow drift & rotation of 3D objects
      particlesArray.forEach((p) => {
        p.mesh.rotation.x += p.rotSpeedX;
        p.mesh.rotation.y += p.rotSpeedY;
        p.mesh.rotation.z += p.rotSpeedZ;

        // Floating hover motion
        p.mesh.position.y = p.baseY + Math.sin(elapsedTime * 0.5 + p.floatOffset) * 0.25;
        p.mesh.position.x += p.speedX;

        // Boundary looping
        if (p.mesh.position.x > 9) p.mesh.position.x = -9;
        if (p.mesh.position.x < -9) p.mesh.position.x = 9;
      });

      // Lerp mouse coordinate for smooth parallax camera shifting
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      camera.position.x = mouseRef.current.x * 1.5;
      camera.position.y = mouseRef.current.y * 1.5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      pillGeo.dispose();
      renderer.dispose();
    };
  }, []);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-navy-dark via-[#11234F] to-[#0A1430] overflow-hidden z-10">
      {/* Three.js canvas background container */}
      <div ref={containerRef} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />

      {/* Grid overlay for techy visual structure */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(13,27,62,0.6)_80%)] z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25 z-0 pointer-events-none" />

      {/* Foreground Hero Contents */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center"
        >
          {/* Logo container tag */}
          <motion.div
            variants={itemVariants}
            className="mb-6 flex items-center space-x-2 bg-orange-burnt/10 border border-orange-burnt/30 px-4 py-1.5 rounded-full backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-orange-burnt animate-pulse" />
            <span className="text-orange-burnt text-xs font-semibold tracking-widest uppercase font-display">
              Tulsiramji Gaikwad Patil College of Pharmacy
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white font-display leading-[1.1] mb-6 drop-shadow-xl"
          >
            TGPCOP <br className="sm:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-burnt to-gold-accent">
              Student Council
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-2xl text-white/90 font-medium max-w-2xl mx-auto mb-10 tracking-wide font-sans drop-shadow-md"
          >
            Your Voice. Our Future. <br className="sm:hidden" />
            <span className="hidden sm:inline"> | </span>
            <span className="text-gold-accent font-semibold">Together Towards Excellence</span>
          </motion.p>

          {/* Call to Actions (CTA) */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full max-w-md mx-auto"
          >
            <Link
              to="/ask"
              className="group flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-4 bg-orange-burnt hover:bg-orange-burnt/90 text-white font-display font-semibold rounded-lg shadow-lg hover:shadow-orange-burnt/25 hover:translate-y-[-2px] transition-all duration-300"
            >
              <span>Ask a Question</span>
              <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </Link>
            <Link
              to="/notices"
              className="group flex items-center justify-center space-x-2 w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-display font-semibold rounded-lg shadow-lg backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300"
            >
              <span>Notice Board</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating anchor to scroll down */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden sm:block">
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1.5 backdrop-blur-sm"
        >
          <div className="w-1.5 h-3 bg-orange-burnt rounded-full" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
