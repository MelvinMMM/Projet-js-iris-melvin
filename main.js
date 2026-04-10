import * as THREE from 'three';
import Globe from 'globe.gl';
import i18next from './components/i18n.js';
import { loadCountries, loadData, initSearch, updateDOMTranslation } from './components/app.js';
import LocationInfoBoxComponent from './components/locationInfoBox.js';

const earthDiv = document.getElementById('globe');
const locationInfoBoxElement = document.getElementById('location-info-box');
const loadingElement = document.getElementById('loading');

function getGlobeSize() {
    return {
        width: earthDiv.clientWidth || window.innerWidth,
        height: earthDiv.clientHeight || window.innerHeight
    };
}  // Permet d'obtenir la taille du globe en fonction de la taille de la fenêtre

function isMobileViewport() {
    return window.matchMedia('(max-width: 767px)').matches;
} // Permet de détecter si l'utilisateur est sur un appareil mobile

// Création du globe
const earth = Globe()(earthDiv, { animateIn: false })
    .globeImageUrl('assets/earth-blue-marble.jpg')
    .bumpImageUrl('assets/earth-topology.png')
    .backgroundImageUrl('assets/night-sky.png')
    .width(getGlobeSize().width) 
    .height(getGlobeSize().height);
// Permet de créer le globe avec les bonnes dimensions dès le départ

window.addEventListener('resize', () => {
    const { width, height } = getGlobeSize();
    earth.width(width);
    earth.height(height);
});// Permet de redimensionner le globe lorsque la fenêtre est redimensionnée

earth.controls().autoRotate = true;
earth.controls().autoRotateSpeed = 0.35;

// On mobile, start a bit farther from the globe so it appears smaller.
requestAnimationFrame(() => {
    earth.pointOfView({ lat: 0, lng: 0, altitude: isMobileViewport() ? 3.9 : 2.8 }, 0);
});// Permet de positionner le globe à une altitude plus élevée sur mobile pour qu'il soit plus petit et mieux adapté à l'écran

// Les nuages
new THREE.TextureLoader().load('./assets/clouds.png', cloudsTexture => {
    const clouds = new THREE.Mesh(
        new THREE.SphereGeometry(earth.getGlobeRadius() * (1 + 0.001), 75, 75),
        new THREE.MeshPhongMaterial({ map: cloudsTexture, transparent: true })
    );
    earth.scene().add(clouds);

    (function rotateClouds() {
        clouds.rotation.y += -0.005 * Math.PI / 180;
        requestAnimationFrame(rotateClouds);
    })();
});



// Global click handler to close location info box when clicking outside
window.addEventListener('click', (e) => {
    if (!locationInfoBoxElement.classList.contains('open')) return;
    if (!locationInfoBoxElement.contains(e.target)) {
        locationInfoBoxElement.classList.remove('open');
    }
});

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
movement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
</svg>
`;
movement.addEventListener('click', () => {
    earth.controls().autoRotate = !earth.controls().autoRotate;
    const Rotating = earth.controls().autoRotate;
    movement.innerHTML = Rotating ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
</svg>
` : `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />

</svg>
`;
});

// Quand on click sur le boutton, on dézoome sur le globe
const zoomOut = document.getElementById('zoomOut');
zoomOut.addEventListener('click', () => {
    earth.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
});

earth.onPointClick((point) => {
    locationInfoBoxElement.innerHTML = LocationInfoBoxComponent({
        id: point.id,
        name: point.label,
        title: point.label,
        type: point.category,
        lat: point.lat,
        lng: point.lng,
    });
    locationInfoBoxElement.classList.add('open');
    console.log("Point cliqué :", point);
});

Promise.all([loadCountries(earth), loadData(earth)])
    .then(([countriesData, eventsData]) => {
        initSearch(earth, countriesData, eventsData);

        loadingElement.classList.add('opacity-0');
        setTimeout(() => {
            loadingElement.classList.add('hidden');
        }, 1000);
    })
    .catch(error => {
        console.error("Erreur lors du chargement des données :", error);
        loadingElement.innerHTML = "<h1>Failed to load data. Please try again later.</h1>";
    });

updateDOMTranslation(earth);