# Event-Horizon : Globe Interactif des Incidents Mondiaux

**Event-Horizon** est une application web 3D interactive permettant de visualiser et de suivre les incidents et événements naturels à travers le monde (incendies, volcans, tempêtes, séismes, etc.). Construit avec **Globe.gl** et **Three.js**, le projet récupère des données en temps réel via les API de la NASA et de l'USGS.

🔗 **[Voir le projet en direct](https://melvinmmm.github.io/Projet-js-iris-melvin/)** *(Lien vers la GitHub Page)*

---

## Fonctionnalités

* **Visualisation 3D Interactive :** Naviguez sur un globe terrestre avec des contrôles de rotation, de zoom et une interface fluide (glassmorphism).
* **Suivi des Événements Naturels :** Affiche les feux de forêt, volcans, tempêtes, séismes, inondations et l'état des glaces grâce aux marqueurs animés.
* **Filtres Dynamiques :** Activez ou désactivez les catégories d'incidents selon vos préférences.
* **Recherche Intelligente :** Recherchez un pays ou un événement spécifique pour y centrer instantanément la caméra.
* **ℹ Informations Géopolitiques :** Survolez un pays pour afficher son drapeau, sa population, son heure locale et ses langues (via *RestCountries*).
* **Multilingue (i18n) :** L'interface est disponible en Français, Anglais, Espagnol, Allemand, Hindi et Chinois avec détection automatique de la langue.
* **Responsive :** Adapté aux écrans d'ordinateurs et aux appareils mobiles.

---

## Technologies Utilisées

* **Cœur 3D :** [Globe.gl](https://globe.gl/) & [Three.js](https://threejs.org/)
* **Framework / Bundler :** [Vite.js](https://vitejs.dev/)
* **Style :** [Tailwind CSS (v4)](https://tailwindcss.com/)
* **Internationalisation :** [i18next](https://www.i18next.com/)
* **API Sources :**
  * [NASA EONET (Earth Observatory Natural Event Tracker)](https://eonet.gsfc.nasa.gov/) (Incendies, Volcans, Tempêtes...)
  * [USGS Earthquake Hazards Program](https://earthquake.usgs.gov/) (Séismes)
  * [RestCountries](https://restcountries.com/) (Données des pays)

---

## Lancer le projet en local

Pour faire tourner le projet sur votre propre machine, suivez ces étapes :

### 1. Prérequis
Assurez-vous d'avoir installé **[Node.js](https://nodejs.org/)** (qui inclut le gestionnaire de paquets `npm`).

### 2. Cloner le dépôt
Ouvrez votre terminal et exécutez la commande suivante pour récupérer le code :
```bash
git clone https://github.com/MelvinMMM/Projet-js-iris-melvin.git
```

### 3. Installer les dépendances
Déplacez-vous dans le dossier du projet et installez les paquets requis :
```bash
cd Projet-js-iris-melvin
npm install
```

### 4. Démarrer le serveur de développement
Lancez l'environnement de développement Vite :
```bash
npm run dev
```

Le terminal affichera une adresse locale (généralement `http://localhost:5173/`). Cliquez dessus ou ouvrez-la dans votre navigateur pour voir le projet !

## Structure de Projet
* `index.html` : Point d'entrée de l'application et structure de l'interface (UI).

* `main.js` : Initialisation du Globe 3D, gestion de la caméra et des interactions globales.

* `components/app.js` : Fonctions principales (appels API, chargement des points, filtres, barre de recherche).

* `components/i18n.js` : Configuration du système multilingue.

* `style.css` : Configuration de TailwindCSS et styles personnalisés (UI, animations, scrollbars).

* `package.json` : Déclaration des dépendances et des scripts du projet.

## Scripts Disponibles

* `npm run dev` : Lance le serveur de développement local.

* `npm run build` : Compile le projet pour la production (génère le dossier `dist/`).

* `npm run preview` : Permet de prévisualiser localement la version buildée en production.

## Contribution
Les contributions sont les bienvenues ! Si vous souhaitez améliorer ce projet :

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/IncroyableFeature`)
3. Commitez vos changements (`git commit -m 'Ajout d'une IncroyableFeature`')
4. Poussez sur la branche (`git push origin feature/IncroyableFeature`)
5. Ouvrez une Pull Request