import { useFrame, useThree, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import React from 'react';

function getPoints({ numStars = 4500, texture }: { numStars?: number, texture?: THREE.Texture } = {}) {
  // ... (randomSpherePoint logic remains same)
  function randomSpherePoint() {
    const radius = Math.random() * 25 + 25;
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.sin(phi) * Math.sin(theta);
    const z = radius * Math.cos(phi);
    const rate = Math.random() * 1;
    const prob = Math.random();
    const light = Math.random();
    function update(t: number) {
      const lightness = prob > 0.8 ? light + Math.sin(t * rate) * 1 : light;
      return lightness;
    }
    const hue = Math.random() * 1.0;
    return { pos: new THREE.Vector3(x, y, z), rate, prob, light, update, minDist: radius, hue };
  }

  const verts: number[] = [];
  const positions: any[] = [];
  const colors: number[] = [];
  for (let i = 0; i < numStars; i += 1) {
    const p = randomSpherePoint();
    const { pos, hue } = p;
    positions.push(p);
    verts.push(pos.x, pos.y, pos.z);
    const col = new THREE.Color().setHSL(hue, 0.2, Math.random());
    colors.push(col.r, col.g, col.b);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    map: texture,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geo, mat);

  function update(t: number) {
    points.rotation.y -= 0.0002;
    const cols: number[] = [];
    for (let i = 0; i < numStars; i += 1) {
      const p = positions[i];
      const { update } = p;
      const bright = update(t);
      const col = new THREE.Color().setHSL(0.6, 0.2, bright);
      cols.push(col.r, col.g, col.b);
    }
    geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    geo.attributes.color.needsUpdate = true;
  }

  (points as any).userData = { update };
  return points;
}

export default function Starfield() {
  const ref = React.useRef<THREE.Points | null>(null);
  const texture = useLoader(THREE.TextureLoader, '/textures/circle.png');
  const points = React.useMemo(() => getPoints({ numStars: 4500, texture }), [texture]);
  const { camera } = useThree();

  useFrame((state) => {
    const { clock } = state;
    if (ref.current && (ref.current as any).userData) {
      (ref.current as any).userData.update(clock.elapsedTime);
    }
    // Keep stars centered on the camera so they appear infinitely distant
    if (ref.current) {
      ref.current.position.copy(camera.position);
      // ensure they are not frustum culled
      (ref.current as any).frustumCulled = false;
    }
  });

  return <primitive object={points} ref={ref} />;
}
