import { useRef, useEffect, Suspense } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import * as THREE from "three";

function CameraSetup() {
  const { camera } = useThree();
  useEffect(() => {
    camera.lookAt(0, 1.3, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  return null;
}

function RemyModel({ speaking }) {
  const idleFbx = useLoader(FBXLoader, "/models/Remy@Breathing Idle.fbx");
  const talkFbx = useLoader(FBXLoader, "/models/Remy@Talking.fbx");

  const mixerRef = useRef(null);
  const idleActionRef = useRef(null);
  const talkActionRef = useRef(null);
  const speakingRef = useRef(speaking);

  useEffect(() => {
    idleFbx.scale.setScalar(0.01);
    idleFbx.position.set(0, -0.9, 0);

    const mixer = new THREE.AnimationMixer(idleFbx);
    mixerRef.current = mixer;

    if (idleFbx.animations[0]) {
      idleActionRef.current = mixer.clipAction(idleFbx.animations[0]);
    }
    if (talkFbx.animations[0]) {
      talkActionRef.current = mixer.clipAction(talkFbx.animations[0]);
    }

    idleActionRef.current?.reset().play();

    return () => mixer.stopAllAction();
  }, [idleFbx, talkFbx]);

  useEffect(() => {
    speakingRef.current = speaking;
    if (!idleActionRef.current) return;

    if (speaking) {
      idleActionRef.current.fadeOut(0.3);
      talkActionRef.current?.reset().fadeIn(0.3).play();
    } else {
      talkActionRef.current?.fadeOut(0.3);
      idleActionRef.current.reset().fadeIn(0.3).play();
    }
  }, [speaking]);

  useFrame((_, delta) => {
    mixerRef.current?.update(delta);
  });

  return <primitive object={idleFbx} />;
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshStandardMaterial color="#ff4d00" wireframe />
    </mesh>
  );
}

export default function RemyAvatar({ speaking, accentColor = "#ff4d00" }) {
  return (
    <Canvas
      camera={{ position: [0, 1.4, 5.5], fov: 45 }}
      style={{ position: "absolute", inset: 0 }}
    >
      <CameraSetup />
      <ambientLight intensity={0.8} />
      <directionalLight position={[2, 4, 2]} intensity={1.2} />
      <directionalLight position={[-1, 2, -1]} intensity={0.4} color={accentColor} />
      <Suspense fallback={<LoadingFallback />}>
        <RemyModel speaking={speaking} />
      </Suspense>
    </Canvas>
  );
}
