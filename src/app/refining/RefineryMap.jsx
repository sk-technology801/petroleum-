
// src/app/refining/RefineryMap.jsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const RefineryMap = ({ units, theme }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme === 'industrial' ? 0x1e3a8a : theme === 'dark' ? 0x111827 : theme === 'highContrast' ? 0x000000 : 0xf3f4f6);
    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / 400, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, 400);
    mountRef.current.appendChild(renderer.domElement);

    // Add units as 3D boxes
    units.forEach(unit => {
      const geometry = new THREE.BoxGeometry(20, 20, unit.coordinates.z / 500);
      const material = new THREE.MeshBasicMaterial({
        color: unit.status === 'operational' ? 0x10b981 : 0xf59e0b,
        opacity: 0.8,
        transparent: true
      });
      const cube = new THREE.Mesh(geometry, material);
      cube.position.set(unit.coordinates.x, unit.coordinates.y, unit.coordinates.z / 500);
      cube.userData = { name: unit.name, healthScore: unit.healthScore };
      scene.add(cube);
    });

    // Add lights
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(light);
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(200, 200, 200);
    scene.add(pointLight);

    // Camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(300, 300, 300);
    controls.update();

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = mountRef.current.clientWidth / 400;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, 400);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [units, theme]);

  return <div ref={mountRef} className="w-full h-[400px]" aria-label="3D Refinery Map" />;
};

export default RefineryMap;
