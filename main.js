import * as THREE from 'three';
import Globe from 'globe.gl';

const earthDiv = document.getElementById('globe');

// Création du globe
const earth = Globe()(earthDiv, {animateIn: false})
    .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg')
    .bumpImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-topology.png')
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
    { lat: 40.7128, lng: -74.0060, size: 0.001, color: 'blue', label: 'New York' },
];

earth.pointsData(data)
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


// Récupérér les données de l'API et les afficher sur le globe
async function loadData() {
    const data = await fetchData();
    console.log("Données récupérées :", data);

//     const data = [
//     { lat: 48.8566, lng: 2.3522, size: 0.001, color: 'red', label: 'Paris' },
//     { lat: 40.7128, lng: -74.0060, size: 0.001, color: 'blue', label: 'New York' },
// ];


    const fireData = data.events
        .filter(event => event.categories[0].id === 8)
        .map(event => {
            return {
                lat: event.geometries[0].coordinates[1], // Latitude
                lng: event.geometries[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#ff4500', // Orange pour les feux
                label: event.title,
                id: event.id,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });

    const seaData = data.events
        .filter(event => event.categories[0].id === 15)
        .map(event => {
            return {
                lat: event.geometries[0].coordinates[1], // Latitude
                lng: event.geometries[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#1e90ff', // Bleu pour les tempêtes en mer
                label: event.title,
                id: event.id,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });
        const volcaData = data.events
        .filter(event => event.categories[0].id === 12)
        .map(event => {
            return {
                lat: event.geometries[0].coordinates[1], // Latitude
                lng: event.geometries[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#ffde21', // Jaune pour les volcans
                label: event.title,
                id: event.id,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });
    const markersData = [...fireData, ...seaData, ...volcaData];

    earth.pointsData(markersData)
        .pointAltitude(0.01) // Rayon visuel 1.01, évite le z-fighting
        .pointRadius(0.2)
        .pointColor('color');

    earth.ringsData(markersData)
        .ringColor('color')
        .ringMaxRadius(1.2)
        .ringPropagationSpeed(0.7)
        .ringRepeatPeriod('pulsePeriod');



    console.log("Données formatées pour les tempêtes en mer :", seaData);
    console.log("Données formatées pour les feux :", fireData);
    console.log("Données formatées pour les volcans :", volcaData);
    

}

loadData();