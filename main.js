import * as THREE from 'three';
import Globe from 'globe.gl';

const earthDiv = document.getElementById('globe');

// Création du globe
const earth = Globe()(earthDiv, {animateIn: false})
    .globeImageUrl('./assets/earth-blue-marble.jpg')
    .bumpImageUrl('./assets/earth-topology.png')
    .backgroundImageUrl('./assets/night-sky.png')
    .width(earthDiv.offsetWidth);

earth.controls().autoRotate = true;
earth.controls().autoRotateSpeed = 0.35;

// Les nuages
new THREE.TextureLoader().load('./assets/clouds.png', cloudsTexture => {
    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(earth.getGlobeRadius() * (1 + 0.005), 75, 75),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
    );
    earth.scene().add(clouds);

    (function rotateClouds() {
        clouds.rotation.y += -0.005 * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
    })();
});

// Coordonnées au pif pour tester
const data = [
    { lat: 48.8566, lng: 2.3522, size: 0.001, color: 'red', label: 'Paris' },
    { lat: 40.7128, lng: -74.0060, size: 0.001, color: 'yellow', label: 'New York' },
];

earth.pointsData(data)
    .pointColor('color')  // Couleur du marqueur
    .pointAltitude(0)    // On enlève de la hauteur (effet bâton/cône)
    .pointRadius(0.2);   // Diamètre du marqueur



// Quand on click sur le globe, on se déplace vers le point cliqué
earth.onGlobeClick(({ lat, lng }) => {
    earth.pointOfView({ lat, lng, altitude: 0.5 }, 1000);
});

// Quand on clique et maintient le clic, on arrête la rotation automatique du globe, et quand on relâche, on la redémarre
window.addEventListener("mousedown", () => {
    earth.controls.autoRotate = false;
}, false);

window.addEventListener("mouseup", () => {
    earth.controls.autoRotate = true;
}, false);


// quand on click sur le boutton, on arrête ou on démarre la rotation automatique du globe et on change le texte du bouton
const movement = document.getElementById('movement');
let textButton = "STOP";
movement.textContent = textButton;
movement.addEventListener('click', () => {
    earth.controls().autoRotate = !earth.controls().autoRotate;
    const Rotating = earth.controls().autoRotate;
    textButton = Rotating ? "STOP" : "START";
    movement.textContent = textButton;
});

// Quand on click sur le boutton, on dézoome sur le globe
const zoomOut = document.getElementById('zoomOut');
console.log(zoomOut);
zoomOut.addEventListener('click', () => {
    earth.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
});