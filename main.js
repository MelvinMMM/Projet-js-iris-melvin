import * as THREE from 'https://esm.sh/three';

const earth = new Globe(document.getElementById('globe'), { animateIn: false })
    .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png');

earth.controls().autoRotate = true;
earth.controls().autoRotateSpeed = 0.35;

const cloudsUrl = './assets/clouds.png';
const CLOUDS_ALT = 0.004;
const cloudSpeedRotation = -0.006; // deg/frame

new THREE.TextureLoader().load(cloudsUrl, cloudsTexture => {
    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(earth.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
    );
    earth.scene().add(clouds);

    (function rotateClouds() {
        clouds.rotation.y += cloudSpeedRotation * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
    })();
});

// Arrêter la rotation quand on clique/touche le globe
window.addEventListener("mousedown", () => {
    controls.autoRotate = false;
}, false);

window.addEventListener("mouseup", () => {
    controls.autoRotate = true;
}, false);

const mouvement = document.getElementById('mouvement');
mouvement.addEventListener('click', () => {
    earth.controls().autoRotate = !earth.controls().autoRotate;
});
