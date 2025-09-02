import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    THREE: any;
  }
}

export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Load Three.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.min.js';
    script.onload = initThreeJS;
    document.head.appendChild(script);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      document.head.removeChild(script);
    };
  }, []);

  const initThreeJS = () => {
    if (!containerRef.current || !window.THREE) return;

    const THREE = window.THREE;
    
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Particle system for floating shapes
    const particleCount = 150;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Neon colors (purple, blue, green)
      const colorChoice = Math.random();
      if (colorChoice < 0.33) {
        colors[i * 3] = 0.545; // Purple
        colors[i * 3 + 1] = 0.361;
        colors[i * 3 + 2] = 0.965;
      } else if (colorChoice < 0.66) {
        colors[i * 3] = 0.024; // Blue
        colors[i * 3 + 1] = 0.714;
        colors[i * 3 + 2] = 0.831;
      } else {
        colors[i * 3] = 0.063; // Green
        colors[i * 3 + 1] = 0.725;
        colors[i * 3 + 2] = 0.506;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Add some geometric shapes
    const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const sphereGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    
    const shapes: any[] = [];
    for (let i = 0; i < 10; i++) {
      const geometry = Math.random() > 0.5 ? cubeGeometry : sphereGeometry;
      const material = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0x8b5cf6 : i % 3 === 1 ? 0x06b6d4 : 0x10b981,
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      });
      
      const shape = new THREE.Mesh(geometry, material);
      shape.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      shapes.push(shape);
      scene.add(shape);
    }

    camera.position.z = 10;
    sceneRef.current = scene;
    rendererRef.current = renderer;

    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Rotate particles
      particles.rotation.x += 0.001;
      particles.rotation.y += 0.002;

      // Animate shapes
      shapes.forEach((shape, index) => {
        shape.rotation.x += 0.01;
        shape.rotation.y += 0.01;
        shape.position.y += Math.sin(time + index) * 0.001;
      });

      // Update particle positions
      const positions = particles.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] += velocities[i * 3];
        positions[i * 3 + 1] += velocities[i * 3 + 1];
        positions[i * 3 + 2] += velocities[i * 3 + 2];

        // Wrap around boundaries
        if (Math.abs(positions[i * 3]) > 15) velocities[i * 3] *= -1;
        if (Math.abs(positions[i * 3 + 1]) > 15) velocities[i * 3 + 1] *= -1;
        if (Math.abs(positions[i * 3 + 2]) > 15) velocities[i * 3 + 2] *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  };

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      data-testid="three-background"
    />
  );
}
