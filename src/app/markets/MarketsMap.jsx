
// src/app/markets/MarketsMap.jsx
'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function MarketsMap({ assets, theme }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;

    renderer.setSize(window.innerWidth * 0.9, window.innerHeight * 0.5);
    renderer.setClearColor(theme === 'industrial' || theme === 'dark' ? 0x1a202c : 0xf7fafc);
    mountRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // Add ground plane
    const planeGeometry = new THREE.PlaneGeometry(500, 500);
    const planeMaterial = new THREE.MeshBasicMaterial({ color: theme === 'industrial' || theme === 'dark' ? 0x4a5568 : 0xe2e8f0, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = Math.PI / 2;
    scene.add(plane);

    // Add assets as 3D objects
    assets.forEach(asset => {
      const geometry = new THREE.SphereGeometry(1.5 + asset.marketCap / 1000000000000, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: asset.change >= 0 ? 0x10b981 : 0xf59e0b
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(asset.coordinates.x, asset.coordinates.z, asset.coordinates.y);
      mesh.userData = { assetId: asset.id, ticker: asset.ticker };
      scene.add(mesh);

      // Add label
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: new THREE.TextureLoader().load(
            `data:image/canvas;base64,${(() => {
              const canvas = document.createElement('canvas');
              canvas.width = 128;
              canvas.height = 32;
              const ctx = canvas.getContext('2d');
              ctx.fillStyle = theme === 'industrial' || theme === 'dark' ? '#1a202c' : '#ffffff';
              ctx.fillRect(0, 0, 128, 32);
              ctx.fillStyle = theme === 'industrial' || theme === 'dark' ? '#e5e7eb' : '#374151';
              ctx.font = '16px Arial';
              ctx.fillText(`${asset.ticker} ($${asset.price.toFixed(2)})`, 10, 20);
              return canvas.toDataURL();
            })()}`
          )
        })
      );
      sprite.position.set(asset.coordinates.x, asset.coordinates.z + 2, asset.coordinates.y);
      sprite.scale.set(5, 1.25, 1);
      scene.add(sprite);
    });

    // Camera position
    camera.position.set(0, 100, 200);
    camera.lookAt(0, 0, 0);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [assets, theme]);

  return <div ref={mountRef} className="w-full h-96 rounded-lg overflow-hidden" />;
}
