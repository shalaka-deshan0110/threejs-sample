import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Stats from 'three/examples/jsm/libs/stats.module';

export default class RollingBox {
    scene:any;
    camera: any;
    renderer: any;
    fov:any;
    nearPlane:number;
    farPlane: number;
    canvasId;
    clock:any;
    stats:any;
    controls:any;
    ambientLight:any;
    directionalLight:any;

    constructor(canvasID: string) {
        this.scene = undefined;
        this.camera = undefined;
        this.renderer = undefined;

        this.fov = 45;
        this.nearPlane = 1;
        this.farPlane = 1000;
        this.canvasId = canvasID;

        this.clock = undefined;
        this.stats = undefined;
        this.controls = undefined;

        this.ambientLight = undefined;
        this.directionalLight = undefined;
    }

    initialize(){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            this.fov, window.innerWidth / (window.innerHeight),
            this.nearPlane , this.farPlane
        );
        this.camera.position.z = 45;

        const canvas = document.getElementById(this.canvasId);
        this.renderer = new THREE.WebGL1Renderer({
            canvas,
            antialias: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        this.clock = new THREE.Clock();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.stats = Stats();
        document.body.appendChild(this.stats.dom);

        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.ambientLight.castShadow = true;
        this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);

        window.addEventListener('resize', () => this.onWindowResize(), false);

    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));
        this.render();
        this.stats.update();
        this.controls.update();
      }
    
      render() {
        this.renderer.render(this.scene, this.camera);
      }
    
      onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
}

