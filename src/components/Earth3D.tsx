'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useLoader, extend } from '@react-three/fiber';
import Starfield from './Starfield';
// Nebula moved to CSS background for a static full-bleed effect (removed from 3D Canvas)
import * as THREE from 'three';

// Configuration constants for easy maintenance
const CONFIG = {
  globe: {
    radius: 2, // Reduced from 2.5 to 2 for better fit
    segments: 64
  },
  atmosphere: {
    radius: 2.15, // Adjusted proportionally
    color: '#00aaff',
    opacity: 0.6
  }
};

// Custom shaders were removed in favor of the repository-style ShaderMaterial created inside the AnimatedGlobe function.
// Atmosphere is rendered with a simpler additive mesh for a matching visual.

function AnimatedGlobe() {
  const sphereRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  const [radiusState, setRadiusState] = useState(CONFIG.globe.radius);

  // Adjust globe radius responsively
  useEffect(() => {
    function onResize() {
      const w = window.innerWidth;
      if (w < 640) setRadiusState(1.8); // Smaller for mobile
      else if (w < 1024) setRadiusState(1.9); // Smaller for tablet
      else setRadiusState(CONFIG.globe.radius);
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Use local high-res textures
  const [dayMap, nightMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth-daymap-4k.jpg',
    '/textures/earth-nightmap-4k.jpg',
    '/textures/earth-clouds-4k.jpg'
  ]);

  // Ensure correct color spaces
  useMemo(() => {
    dayMap.colorSpace = THREE.SRGBColorSpace;
    nightMap.colorSpace = THREE.SRGBColorSpace;
    cloudsMap.colorSpace = THREE.SRGBColorSpace;
    dayMap.anisotropy = 8;
    nightMap.anisotropy = 8;
  }, [dayMap, nightMap, cloudsMap]);

  // Create the shader material (adapted from repo)
  const material = useMemo(() => {
    const uniforms = {
      dayTexture: { value: dayMap },
      nightTexture: { value: nightMap },
      cloudsTexture: { value: cloudsMap },
      sunDirection: { value: new THREE.Vector3(-2, 0.5, 1.5).normalize() }
    } as any;

    const vs = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
        vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fs = `
      uniform sampler2D dayTexture;
      uniform sampler2D nightTexture;
      uniform sampler2D cloudsTexture;
      uniform vec3 sunDirection;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vPosition;

      void main() {
        vec3 viewDirection = normalize(vPosition - cameraPosition);
        vec3 normal = normalize(vNormal);

        float sunOrientation = dot(sunDirection, normal);
        float dayMix = smoothstep(-0.25, 0.5, sunOrientation);

        vec3 dayColor = texture2D(dayTexture, vUv).rgb;
        vec3 nightColor = texture2D(nightTexture, vUv).rgb;
        vec3 color = mix(nightColor, dayColor, dayMix);

        // Clouds
        vec2 specularCloudsColor = texture2D(cloudsTexture, vUv).rg;
        float cloudsMix = smoothstep(0.0, 1.0, specularCloudsColor.g);
        cloudsMix *= dayMix;
        color = mix(color, vec3(1.0), cloudsMix);

        // Specular highlight
        vec3 reflection = reflect(-sunDirection, normal);
        float specular = -dot(reflection, viewDirection);
        specular = max(specular, 0.0);
        specular *= specularCloudsColor.r;
        color += vec3(specular * 0.5);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vs,
      fragmentShader: fs,
    });

    return mat;
  }, [dayMap, nightMap, cloudsMap]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (sphereRef.current) {
      sphereRef.current.rotation.y = elapsed * 0.05;
    }

    // move sun slowly
    const sunX = Math.sin(elapsed * 0.1) * 2;
    const sunZ = Math.cos(elapsed * 0.1) * 2;
    if (material) {
      (material as any).uniforms.sunDirection.value = new THREE.Vector3(sunX, 0.0, sunZ).normalize();
    }
  });

  return (
    <group>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[radiusState, CONFIG.globe.segments, CONFIG.globe.segments]} />
        {/* @ts-ignore */}
        <primitive object={material} attach="material" />
      </mesh>

      {/* Atmosphere removed for seamless space black background (no blue rim) */}
      {/* If you want a subtle atmosphere later, we can add a faint, dark translucent layer here */}
    </group>
  );
}

export default function Earth3D() {
  return (
    <div className="w-full h-[350px] md:h-[500px] lg:h-[500px] relative">
      <Canvas 
        className="w-full h-full"
        camera={{ position: [0, 0, 7.5], fov: 45 }} // Moved camera back (from 6.5 to 7.5)
        dpr={[1, 2]} // Handle high DPI screens
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting is handled by the shader, but we keep ambient for other objects */}
        <ambientLight intensity={0.1} />

        <React.Suspense fallback={null}>
            {/* Starfield (custom) - Suspense required because it uses useLoader */}
            <Starfield />
            <AnimatedGlobe />
        </React.Suspense>

        {/* Custom OrbitControls (using drei) */}
        <OrbitControls 
          enableZoom={true} 
          enableRotate={true} 
          enablePan={false}
          minDistance={4}
          maxDistance={15}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          enableDamping={true}
          dampingFactor={0.07}
          rotateSpeed={0.8}
        />
      </Canvas>
      
      {/* Overlay Card: hide on small screens for cleaner hero */}
      <div className="hidden md:block absolute bottom-8 right-8 bg-white/6 backdrop-blur-md border border-white/12 p-3 rounded-none max-w-xs animate-fade-in-up z-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-3 h-3 bg-green-400 rounded-none animate-pulse"></div>
          <h3 className="text-white font-semibold text-sm">Global Impact</h3>
        </div>
        <p className="text-gray-300 text-xs leading-relaxed">
          Committed to reducing carbon footprint through sustainable manufacturing and eco-friendly materials.
        </p>
      </div>
    </div>
  );
}
