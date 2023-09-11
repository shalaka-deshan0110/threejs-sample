import * as THREE from "three";

import Stats from "three/addons/libs/stats.module.js";
import { GUI } from "three/addons/libs/lil-gui.module.min.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

class PropsLocal {
  clippingObject: ClippingObject;
  constructor(clippingObject: ClippingObject) {
    this.clippingObject = clippingObject;
  }
  get Enabled(): boolean {
    console.log("globalclipping",this.clippingObject.renderer.localClippingEnabled)
    return this.clippingObject.renderer.localClippingEnabled;
  }
  set Enabled(v: boolean) {
    this.clippingObject.renderer.localClippingEnabled = v;
  }

  get Shadows(): boolean {
    return this.clippingObject.material.clipShadows;
  }
  set Shadows(v: boolean) {
    this.clippingObject.material.clipShadows = v;
  }

  get Plane(): number {
    console.log("plan", this.clippingObject.localPlane.constant)
    return this.clippingObject.localPlane.constant;
  }
  set Plane(v: number) {
    this.clippingObject.localPlane.constant = v;
  }
}

class PropsGlobal {
  clippingObject: ClippingObject;
  constructor(clippingObject: ClippingObject) {
    this.clippingObject = clippingObject;
  }
  get Enabled(): boolean {
    return (
      this.clippingObject.renderer.clippingPlanes !== this.clippingObject.Empty
    );
  }
  set Enabled(v: boolean) {
    this.clippingObject.renderer.clippingPlanes = v
      ? this.clippingObject.globalPlanes
      : this.clippingObject.Empty;
  }

  get Plane(): number {
    return this.clippingObject.globalPlane.constant;
  }
  set Plane(v: number) {
    this.clippingObject.globalPlane.constant = v;
  }
}

export default class ClippingObject {
  camera: any;
  scene: any;
  renderer: THREE.WebGLRenderer;
  controls: any;
  startTime: number;
  object: any;
  stats: any;
  canvasID: any;
  ambientLight: any;
  spotLight: any;
  dirLight: any;
  localPlane: THREE.Plane;
  globalPlane: THREE.Plane;
  material: any;
  geometry: any;
  ground: any;
  globalPlanes: THREE.Plane[];
  Empty: THREE.Plane[];
  propsLocal: PropsLocal;
  propsGlobal: PropsGlobal;

  constructor(canvasID: string) {
    this.camera = undefined;
    this.scene = undefined;
    this.renderer = new THREE.WebGLRenderer();
    this.controls = undefined;
    this.startTime = Date.now();
    this.object = undefined;
    this.stats = undefined;
    this.canvasID = canvasID;
    this.ambientLight = undefined;
    this.spotLight = undefined;
    this.dirLight = undefined;
    this.localPlane = new THREE.Plane;
    this.globalPlane = new THREE.Plane;
    this.globalPlanes = [];
    this.material = undefined;
    this.geometry = undefined;
    this.ground = undefined;
    this.Empty = [] as THREE.Plane[];
    this.propsLocal = new PropsLocal(this);
    this.propsGlobal = new PropsGlobal(this);
    this.animate = this.animate.bind(this);
  }

  initialize() {
    this.camera = new THREE.PerspectiveCamera(
      36,
      window.innerWidth / window.innerHeight,
      0.25,
      16
    );
    this.camera.position.set(0, 1.3, 3);
    this.scene = new THREE.Scene();

    this.ambientLight = new THREE.AmbientLight(0xffffff);
    this.scene.add(this.ambientLight);

    this.spotLight = new THREE.SpotLight(0xffffff, 60);
    this.spotLight.angle = Math.PI / 5;
    this.spotLight.penumbra = 0.2;
    this.spotLight.position.set(2, 3, 3);
    this.spotLight.castShadow = true;
    this.spotLight.shadow.camera.near = 3;
    this.spotLight.shadow.camera.far = 10;
    this.spotLight.shadow.mapSize.width = 1024;
    this.spotLight.shadow.mapSize.height = 1024;
    this.scene.add(this.spotLight);

    this.dirLight = new THREE.DirectionalLight(0x55505a, 3);
    this.dirLight.position.set(0, 3, 0);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.camera.near = 1;
    this.dirLight.shadow.camera.far = 10;
    this.dirLight.shadow.camera.right = 1;
    this.dirLight.shadow.camera.left = -1;
    this.dirLight.shadow.camera.top = 1;
    this.dirLight.shadow.camera.bottom = -1;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.scene.add(this.dirLight);

    this.localPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0.8);
    this.globalPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0.1);

    this.material = new THREE.MeshPhongMaterial({
      color: 0x80ee10,
      shininess: 100,
      side: THREE.DoubleSide,

      clippingPlanes: [this.localPlane],
      clipShadows: true,
    });

    this.geometry = new THREE.TorusKnotGeometry(0.4, 0.08, 95, 20);

    this.object = new THREE.Mesh(this.geometry, this.material);
    this.object.castShadow = true;
    this.scene.add(this.object);

    this.ground = new THREE.Mesh(
      new THREE.PlaneGeometry( 9, 9, 9, 9),
      new THREE.MeshPhongMaterial({ color: 0xa0adaf, shininess: 150 })
    );

    this.ground.rotation.x = -Math.PI / 2;
    this.ground.recieveShadow = true;
    this.scene.add(this.ground);

    this.stats = new Stats();
    document.body.appendChild(this.stats.dom);

    this.renderer = new THREE.WebGL1Renderer();
    this.renderer.shadowMap.enabled = true;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    window.addEventListener("resize", this.onWindowResize);
    document.body.appendChild(this.renderer.domElement);

    this.globalPlanes = [this.globalPlane];
    this.Empty = [];

    this.renderer.clippingPlanes = this.Empty;
    this.renderer.localClippingEnabled = true;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1, 0);

    const gui = new GUI(),
      folderLocal = gui.addFolder("Local Clipping"),
      propsLocal = this.propsLocal,
      folderGlobal = gui.addFolder("Global Clipping"),
      propsGlobal = this.propsGlobal;

    folderLocal.add(propsLocal, "Enabled");
    folderLocal.add(propsLocal, "Shadows");
    folderLocal.add(propsLocal, "Plane", 0.9, 1.25);

    folderGlobal.add(propsGlobal, "Enabled");
    folderGlobal.add(propsGlobal, "Plane", -0.1, 5);
    
    console.log(gui);
    // Start

    this.startTime = Date.now();
    console.log(this.startTime );
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    const currentTime = Date.now();
    const startTimex = this.startTime;
    const time = (currentTime - startTimex) / 1000;

    requestAnimationFrame(this.animate);

    this.object.position.y = 0.5;
    this.object.rotation.x = time * 0.5;
    this.object.rotation.y = time * 0.2;
    this.object.scale.setScalar(Math.cos(time) * 0.125 + 0.875);

    this.stats.begin();
    this.renderer.render(this.scene, this.camera);
    this.stats.end();
  }
}
