import * as THREE from 'three';
import { useEffect } from 'react';
import RollingBox from './components/RollingBox';
import './App.css'
import ClippingObject from './components/ClippingObject';

function App() {
  useEffect(() => {
    const boxScene = new RollingBox('myThreeJsCanvas');
    boxScene.initialize();
    boxScene.animate();

    // Add a cube to the scene
    const geometry = new THREE.BoxGeometry(5, 5, 5, 4, 4, 4);
    const material = new THREE.MeshLambertMaterial({ vertexColors: true });
    const positionAttribute = geometry.getAttribute( 'position' );
		
		const colors = [];
		const color = new THREE.Color();
		
		for ( let i = 0; i < positionAttribute.count; i += 3 ) {
		
			color.set( Math.random() * 0xffffff );
			
			colors.push( color.r, color.g, color.b );
			colors.push( color.r, color.g, color.b );
		
		}
		
		geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 2 ) );
    const light1 = new THREE.HemisphereLight( 0xffffff, 0x00ff00, 1);
    const light2 = new THREE.HemisphereLight( 0x333fff, 0xff0000, 2);
    const light3 = new THREE.HemisphereLight( 0xfff666, 0xf80820, 3);
    const light4 = new THREE.HemisphereLight( 0xff44ff, 0x6868f0, 4);

    const material2 = new THREE.MeshDepthMaterial({
      side : THREE.FrontSide,
      transparent: false,
      depthTest: true,
      depthWrite: true,
      alphaTest: 0,
      wireframe: false,

    });
    const cube = new THREE.Mesh(geometry, material);

    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 16, 16),
      material2
    );
    sphere.position.x = -5.5;
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
    plane.position.y = 4.7;
    const torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.3, 0.2, 16, 32),
      material
    );
    torus.position.x = 3.5;

    const clock = new THREE.Clock();
    const tick = () =>
    {
        const elapsedTime = clock.getElapsedTime()
        // Update objects
        sphere.rotation.y = 0.1 * elapsedTime
        plane.rotation.y = 0.1 * elapsedTime
        torus.rotation.y = 0.1 * elapsedTime
        sphere.rotation.x = 0.15 * elapsedTime
        plane.rotation.x = 0.15 * elapsedTime
        torus.rotation.x = 0.15 * elapsedTime
        // ...
    }
    tick();

    boxScene.scene.add(cube, sphere, plane, torus);
    boxScene.scene.add(light1);

    const clippingScene = new ClippingObject('myThreeJsCanvas');
    clippingScene.initialize();
    clippingScene.animate();
  }, []);
  return (
    <>
      <div>
        <canvas id="myThreeJsCanvas" />
      </div>
    </>
  );
  
}

export default App
