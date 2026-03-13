import * as THREE from 'https://esm.sh/three';

// URL de la texture des nuages et paramètres de rotation
const cloudsUrl = './assets/clouds.png';
const CLOUDS_ALT = 0.004;
const cloudSpeedRotation = -0.006;

// Création de la Terre avec les textures et le relief
const earth = new Globe(document.getElementById('globe'), { animateIn: true })
    .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png');

earth.controls().autoRotate = true;
earth.controls().autoRotateSpeed = 0.35;

// Ajout des nuages
new THREE.TextureLoader().load(cloudsUrl, cloudsTexture => {
    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(earth.getGlobeRadius() * (1 + CLOUDS_ALT), 75, 75),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
    );
    earth.scene().add(clouds);
// Animation de la rotation des nuages
    (function rotateClouds() {
        clouds.rotation.y += cloudSpeedRotation * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
    })();
});

// Lorsque l'on clique sur la Terre, la caméra se déplace vers le point cliqué et la rotation automatique s'active  
earth.onGlobeClick(({ lat, lng }, event) => {
    earth.pointOfView({ lat, lng, altitude: 0.4 }, 1000);
    earth.controls.autoRotate = true;
});

// Lorsque l'on clique sur la souris, la rotation automatique s'arrête, et lorsqu'on relâche le click, elle reprend
window.addEventListener("mousedown", () => {
    earth.controls.autoRotate = false;
}, false);

window.addEventListener("mouseup", () => {
    earth.controls.autoRotate = true;
}, false);

// Lorsque l'on clique sur le bouton "mouvement", la rotation automatique s'arrête ou reprend
const mouvement = document.getElementById('mouvement');
mouvement.addEventListener('click', () => {
    earth.controls().autoRotate = !earth.controls().autoRotate;
});
