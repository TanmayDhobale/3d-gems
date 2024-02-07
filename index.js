import * as THREE from "three";
import { SubsurfaceScatteringShader } from "https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/shaders/SubsurfaceScatteringShader.js";
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.131/examples/jsm/controls/OrbitControls.js';
const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 20;
const renderer = new THREE.WebGLRenderer({ alpha: true});
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);

 // Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

const texLoader = new THREE.TextureLoader();
function getSSSMaterial() {
  const hue = Math.random() < 0.1 ? 0 : Math.random() * 0.3 + 0.4;
  const color = new THREE.Color().setHSL(hue, 1.0, 0.5);
  const { r, g, b } = color;
  const shader = SubsurfaceScatteringShader;
  const imgTexture = texLoader.load( './assets/white.jpg' );
  const thicknessTexture = texLoader.load( './assets/noise-bw.jpg' );
  const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
  uniforms['map'].value = imgTexture;
  uniforms["diffuse"].value = new THREE.Vector3(0, 0, 0);
  uniforms["shininess"].value = 0;
  uniforms['thicknessMap'].value = thicknessTexture;
  uniforms["thicknessColor"].value = new THREE.Vector3(r, g, b);
  uniforms["thicknessDistortion"].value = 0.1;
  uniforms["thicknessAmbient"].value = 0.1;
  uniforms["thicknessAttenuation"].value = 0.05;
  uniforms["thicknessPower"].value = 2.0;
  uniforms["thicknessScale"].value = 16.0;

  const material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: shader.vertexShader,
    fragmentShader: shader.fragmentShader,
    lights: true,
  });
  material.extensions.derivatives = true;
  return material;
}

function getBall() {
  const scale = 0.8 + Math.random() * 1.2;
  const geometry = new THREE.IcosahedronGeometry(scale, 2);
  const material = getSSSMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  const timeMult = 0.0005 + Math.random() * 0.0005;
  const radius = 6;
  const axies = ['x','y','z'];
  const axis = axies[Math.floor(Math.random() * axies.length)];
  const rotationRate = Math.random() * 0.01 + 0.01;
  function update (t) {
    mesh.position.x = Math.cos(t * timeMult) * radius * 2;
    mesh.position.y = Math.sin(t * timeMult * 2) * radius;
    mesh.rotation[axis] += rotationRate;
  }
  const obj = new THREE.Object3D();
  obj.rotation.z = Math.random() * Math.PI * 2;
  obj.add(mesh);
  return { obj, update };
}

function getLight() {
  const point = new THREE.PointLight(0xffffff, 1);
  point.intensity = 0.9;
  point.position.set(0, 0, 0);
  const timeMult = 0.0005 + Math.random() * 0.0005;
  const radius = 6;
  function update (t) {
    point.position.x = Math.cos(t * timeMult) * radius * 2;
    point.position.y = Math.sin(t * timeMult * 2) * radius;
  }
  const obj = new THREE.Object3D();
  obj.rotation.z = Math.random() * Math.PI * 2;
  obj.add(point);
  return { obj, update };
}

const meshes = [];
const numMeshes = 12;
for (let i = 0; i < numMeshes; i += 1) {
  let ball = getBall();
  meshes.push(ball);
  scene.add(ball.obj);
}

const lights = [];
const numLights = 12;
for (let i = 0; i < numLights; i += 1) {
  let light = getLight();
  lights.push(light);
  scene.add(light.obj);
}

const sunlight = new THREE.DirectionalLight(0xffffff, 2);
sunlight.position.set(0, 1, 1);  
scene.add(sunlight);

function animate(t) {
  requestAnimationFrame(animate);
  meshes.forEach( m => m.update(t));
  lights.forEach( l => l.update(t));
  renderer.render(scene, camera);
  controls.update();
}

animate(0);

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);