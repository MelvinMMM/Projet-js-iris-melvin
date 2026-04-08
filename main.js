import * as THREE from 'three';
import Globe from 'globe.gl';
import { fetchData, fetchCountry, restCountries } from './components/app.js';
import LocationInfoBoxComponent from './components/locationInfoBox.js';

const earthDiv = document.getElementById('globe');
const locationInfoBoxElement = document.getElementById('location-info-box');


// Création du globe
const earth = Globe()(earthDiv, { animateIn: false })
    .globeImageUrl('assets/earth-blue-marble.jpg')
    .bumpImageUrl('assets/earth-topology.png')
    .backgroundImageUrl('assets/night-sky.png')
    .width(earthDiv.offsetWidth);

window.addEventListener('resize', () => {
    earth.width(earthDiv.offsetWidth);
    earth.height(earthDiv.offsetHeight);
});

earth.controls().autoRotate = true;
earth.controls().autoRotateSpeed = 0.35;

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

const countryCache = {};

async function loadCountries() {
    const countriesData = await fetchCountry();
    let hoverD = null;

    earth.polygonsData(countriesData.features)
        .polygonAltitude(0.006)
        .polygonCapColor(d => d === hoverD ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0,0,0,0)')
        .polygonSideColor(() => 'rgba(0,0,0,0)')
        .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.1)') // Légères frontières
        .onPolygonHover(d => {
            hoverD = d;
            earth.polygonCapColor(earth.polygonCapColor());
            const infoCard = document.getElementById('countryInfoCard');
            if (!d) {
                infoCard.classList.remove('opacity-100');
                infoCard.classList.add('opacity-0');
                return;
            }
            infoCard.classList.remove('opacity-0');
            infoCard.classList.add('opacity-100');
            document.getElementById('countryName').textContent = d.properties.NAME || d.properties.ADMIN;

            document.getElementById('countryFlag').classList.add('hidden');
            document.getElementById('countryTime').textContent = "...";
            document.getElementById('countryLang').textContent = "...";
            document.getElementById('countryPop').textContent = "...";

            let isoCode = d.properties.ISO_A3;
            if (isoCode === '-99') {
                isoCode = d.properties.ADM0_A3; // Certains pays ont un code ISO_A3 invalide, on essaie avec ISO_A2
            }
            if (!isoCode || isoCode === '-99') return;

            updateCountryDetails(isoCode);
        })
        .polygonsTransitionDuration(300);
}

async function updateCountryDetails(isoCode) {
    let data;

    if (countryCache[isoCode]) {
        data = countryCache[isoCode];
    } else {
        try {
            const countryData = await restCountries(isoCode);
            if (!countryData || !countryData[0]) {
                console.error("Aucun détail trouvé pour le code ISO :", isoCode);
                return;
            }
            data = countryData[0];
            countryCache[isoCode] = data;
        } catch (error) {
            console.error("Erreur lors de la récupération des détails du pays :", error);
            return;
        }
    }
    if (data.flags && data.flags.png) {
        document.getElementById('countryFlag').src = data.flags.png;
        document.getElementById('countryFlag').classList.remove('hidden');
    }
    let timeDisplay = data.timezones && data.timezones.length > 0 ? data.timezones[0] : "N/A";

    if (data.timezones && data.timezones.length > 1) {
        if (data.cca3 === 'FRA') {
            timeDisplay = "UTC+01:00 (Métropole)";
        }
        else if (data.cca3 === 'GBR') {
            timeDisplay = "UTC+00:00 (Londres)";
        }
        else if (data.timezones.length > 3) {
            timeDisplay = `${data.timezones.length} fuseaux horaires`;
        }
        else {
            timeDisplay = data.timezones.join(', ');
        }
    }
    document.getElementById('countryTime').textContent = timeDisplay;
    document.getElementById('countryLang').textContent = Object.values(data.languages).join(', ');
    document.getElementById('countryPop').textContent = data.population.toLocaleString();
}
loadCountries();

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
zoomOut.addEventListener('click', () => {
    earth.pointOfView({ lat: 0, lng: 0, altitude: 2.5 }, 1000);
});


// Récupérér les données de l'API et les afficher sur le globe
async function loadData() {
    const data = await fetchData();
    console.log("Données récupérées :", data);

    const fireData = data.events
        .filter(event => event.categories[0].id === 'wildfires')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#ff4500', // Orange pour les feux
                label: event.title,
                id: event.id,
                category: event.categories[0].title,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });

    const seaData = data.events
        .filter(event => event.categories[0].id === 'seaLakeIce')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#1e90ff', // Bleu pour les tempêtes en mer
                label: event.title,
                id: event.id,
            category: event.categories[0].title,

                pulsePeriod: 1200 + Math.random() * 1000
            };
        });
    const volcaData = data.events
        .filter(event => event.categories[0].id === 'volcanoes')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#ff00ff', // Magenta pour les volcans
                label: event.title,
                id: event.id,
                category: event.categories[0].title,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });
    const stormData = data.events
        .filter(event => event.categories[0].id === 'severeStorms')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#f0f0f0', // blanc pour les tempêtes
                label: event.title,
                id: event.id,
                category: event.categories[0].title,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });

    const earthquakeData = data.events
        .filter(event => event.categories[0].id === 'earthquakes')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#ffd700', // jaune foncé pour les tremblements de terre
                label: event.title,
                id: event.id,
                category: event.categories[0].title,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });
    const floodsData = data.events
        .filter(event => event.categories[0].id === 'floods')
        .map(event => {
            return {
                lat: event.geometry[0].coordinates[1], // Latitude
                lng: event.geometry[0].coordinates[0], // Longitude
                size: 0.05,
                color: '#00ffff', // cyan pour les inondations
                label: event.title,
                id: event.id,
                category: event.categories[0].title,
                pulsePeriod: 1200 + Math.random() * 1000
            };
        });

    const markersData = {
        'wildfires': fireData,
        'seaLakeIce': seaData,
        'volcanoes': volcaData,
        'severeStorms': stormData,
        'earthquakes': earthquakeData,
        'floods': floodsData
    };

    function updateGlobeData() {
        let activeMarkers = [];
        const checkboxes = document.querySelectorAll('#filters-container input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                activeMarkers = activeMarkers.concat(markersData[checkbox.id]);
            }
        });

        
// feat: les ama de cercles en un unique point



        // Les points lumineux
        earth.pointsData(activeMarkers)
            .pointAltitude(0.01)
            .pointRadius(0.2)
            .pointColor('color')
            .pointLabel(d=> `
            <strong>${d.label}</strong><br/>
            <div style="font-size:11px;opacity:0.9;margin-top:4px;">
                Type: ${d.category ?? 'N/A'}<br/>
                Lat: ${d.lat.toFixed(2)}°<br/>
                Lng: ${d.lng.toFixed(2)}°
            </div>
        `);

        // Les anneaux de pulsation
        earth.ringsData(activeMarkers)
            .ringColor('color')
            .ringMaxRadius(1.2)
            .ringPropagationSpeed(0.7)
            .ringRepeatPeriod('pulsePeriod');
    }

    const checkboxes = document.querySelectorAll('#filters-container input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateGlobeData);
    });

    updateGlobeData();

    console.log("Données formatées pour les tempêtes en mer :", seaData);
    console.log("Données formatées pour les feux :", fireData);
    console.log("Données formatées pour les volcans :", volcaData);
    console.log("Données formatées pour les tempêtes :", stormData);
    console.log("Données formatées pour les tremblements de terre :", earthquakeData);
    



    const chartCanvas = document.getElementById('chart');
    new Chart(chartCanvas, {
        type: 'bar',
        data: {
            datasets: [
                { fill: 'origin' },      // 0: fill to 'origin'
                { fill: '+2' },          // 1: fill to dataset 3
                { fill: 1 },             // 2: fill to dataset 1
                { fill: false },         // 3: no fill
                { fill: '-2' },          // 4: fill to dataset 2
                { fill: { value: 25 } }    // 5: fill to axis value 25
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // --- 1. Regrouper les feux par année ---
    // On reprend les événements de type 'wildfires'
    const fireEvents = data.events.filter(event => event.categories[0].id === 'wildfires');

    // On crée un objet pour compter les feux par année (ex: { "2021": 15, "2022": 24 })
    const firesPerYear = {};

    fireEvents.forEach(event => {
        // On vérifie que la géométrie et la date existent
        if (event.geometry && event.geometry.length > 0 && event.geometry[0].date) {
            // On extrait l'année de la date de l'événement
            const year = new Date(event.geometry[0].date).getFullYear();

            // On ajoute +1 à cette année dans notre compteur
            if (firesPerYear[year]) {
                firesPerYear[year]++;
            } else {
                firesPerYear[year] = 1;
            }
        }
    });

    // --- 2. Préparer les données pour Chart.js ---
    // On récupère les années (les clés de l'objet) et on les trie dans l'ordre chronologique
    const years = Object.keys(firesPerYear).sort();

    // On récupère le nombre de feux correspondant à chaque année
    const fireCounts = years.map(year => firesPerYear[year]);

    // --- 3. Créer le graphique en courbe (Line Chart) ---
    const ctxLine = document.getElementById('fireLineChart').getContext('2d');

    // On détruit le graphique précédent s'il existe (utile lors du rechargement)
    if (window.fireChartInstance) {
        window.fireChartInstance.destroy();
    }

    window.fireChartInstance = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: years, // L'axe X : les années (ex: 2014, 2015 ... 2024)
            datasets: [{
                label: 'Number of forest fire incidents',
                data: fireCounts, // L'axe Y : le nombre de feux
                borderColor: '#ff4500', // La couleur de la ligne (Orange, comme sur ton globe)
                backgroundColor: 'rgba(255, 69, 0, 0.2)', // La couleur sous la courbe (Orange transparent)
                borderWidth: 2,
                pointBackgroundColor: '#ff4500',
                pointBorderColor: '#fff',
                pointRadius: 4,
                fill: true, // Remplit l'espace sous la courbe
                tension: 0.3 // Rend la courbe légèrement arrondie (0 = lignes droites)
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Evolution of forest fires by year',
                    font: { size: 16 }
                },
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of fires'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                }
            }
        }
    });
}

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

loadData();


