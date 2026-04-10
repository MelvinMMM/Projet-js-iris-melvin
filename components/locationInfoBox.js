const locationInfoBox = (info = {}) => {
    const cleanName = typeof info.name === 'string'
        ? info.name.replace(/\s+\d+$/, '').trim()
        : 'N/A';

    return `
        <div class="location-info">
            <h2>${cleanName}</h2>
            <ul>
                <li><strong>ID :</strong> ${info.id ?? 'N/A'}</li>
                <li><strong>Type :</strong> ${info.type ?? 'N/A'}</li>
                <li><strong>Latitude :</strong> ${typeof info.lat === 'number' ? info.lat.toFixed(4) : 'N/A'}</li>
                <li><strong>Longitude :</strong> ${typeof info.lng === 'number' ? info.lng.toFixed(4) : 'N/A'}</li>
            </ul>
            <!-- <button class="more-info"><a href="${info.url ?? '#'}" target="_blank" rel="noopener noreferrer">En savoir plus</a></button> -->
        </div>
    `;
};

export default locationInfoBox;





