mapboxgl.accessToken = 'pk.eyJ1Ijoid2ludGVyc2FiIiwiYSI6ImNsc2EwN2ZjbjBlYWwyanBsM29iZWhoZmkifQ.n9laXFEUb0lFf3L7gLSNOg';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [0, 0],
    zoom: 1
});

map.addControl(new mapboxgl.NavigationControl());

let stores = []; // Array to store fetched store data
const CHUNK_SIZE = 10; // Number of stores to load at once

async function fetchAllStores(storeInput, bbox) {
    try {
        let allStores = [];
        let page = 1;
        let totalFeatures = Infinity;

        while (allStores.length < totalFeatures) {
            const response = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(storeInput)}.json?bbox=${bbox.join(',')}&types=poi&limit=${CHUNK_SIZE}&access_token=${mapboxgl.accessToken}&page=${page}`);
            const data = await response.json();

            // Filter out stores not within the bounding box
            const filteredFeatures = data.features.filter(feature => {
                const [lng, lat] = feature.geometry.coordinates;
                return lng >= bbox[0] && lng <= bbox[2] && lat >= bbox[1] && lat <= bbox[3];
            });

            allStores = allStores.concat(filteredFeatures);
            totalFeatures = data.features.length;

            page++;
        }

        return allStores;
    } catch (error) {
        console.error('Error fetching store data:', error);
        return [];
    }
}

async function searchStores() {
    const locationInput = document.getElementById('location-input').value;
    const storeInput = document.getElementById('store-input').value;

    console.log('Searching stores for location:', locationInput);
    console.log('Searching stores with name:', storeInput);

    // Clear existing markers and store list
    if (map.getSource('markers')) {
        map.removeLayer('markers');
        map.removeSource('markers');
    }
    stores = []; // Reset stores array
    updateStoreList(); // Clear store list in the side panel

    try {
        // Use Mapbox Search API to get coordinates and bounding box for the entered location (city or country)
        const locationResponse = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${locationInput}.json?access_token=${mapboxgl.accessToken}`);
        const locationData = await locationResponse.json();

        const coordinates = locationData.features[0].center;
        const bbox = locationData.features[0].bbox;

        console.log('Location coordinates:', coordinates);
        console.log('Bounding box:', bbox);

        // Calculate the bounding boxes within the city area
        const boundingBoxes = calculateBoundingBoxes(bbox);

        // Fetch stores in each bounding box
        for (let i = 0; i < boundingBoxes.length; i++) {
            const searchBbox = boundingBoxes[i];
            const chunkStores = await fetchAllStores(storeInput, searchBbox);
            stores = stores.concat(chunkStores);
            console.log('Stores after fetching:', stores.length); // Log the length of stores after each fetch
        }

        // Filter out stores that do not contain the city name in their place name property
        stores = stores.filter(store => store.place_name.toLowerCase().includes(locationInput.toLowerCase()));

        console.log('Fetched store data:', stores);

        // Add markers to the map
        addMarkersToMap(stores);

        updateStoreList(); // Update store list in the side panel
        if (stores.length > 0) {
            flyToFeature(stores[0]);
        }
    } catch (error) {
        console.error('Error fetching location or store data:', error);
    }
}

function addMarkersToMap(stores) {
    map.addSource('markers', {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: stores.map(store => ({
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: store.geometry.coordinates
                },
                properties: {
                    title: store.text,
                    description: store.place_name
                }
            }))
        }
    });

    map.loadImage(
        'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
        function (error, image) {
            if (error) throw error;
            if (!map.hasImage('custom-marker')) { // Check if image already exists
                map.addImage('custom-marker', image);
            }
            map.addLayer({
                id: 'markers',
                type: 'symbol',
                source: 'markers',
                layout: {
                    'icon-image': 'custom-marker',
                    'icon-size': 1,
                    'icon-allow-overlap': true
                }
            });
        }
    );
}

function updateStoreList() {
    const storeList = document.getElementById('store-list');
    storeList.innerHTML = '';

    stores.forEach(store => {
        const storeItem = document.createElement('div');
        storeItem.className = 'store-item';
        storeItem.innerHTML = `<strong>${store.text}</strong><br>${store.place_name}`;
        storeItem.onclick = function () {
            flyToFeature(store);
        };
        storeList.appendChild(storeItem);
    });
}

function calculateBoundingBoxes(bbox) {
    const [minX, minY, maxX, maxY] = bbox;
    const lngDistance = (maxX - minX) / 8; // Divide the longitude span into 10 parts
    const latDistance = (maxY - minY) / 8; // Divide the latitude span into 10 parts
    const boundingBoxes = [];
    
    // Create smaller bounding boxes within the city's boundaries
    for (let i = minX; i < maxX; i += lngDistance) {
        for (let j = minY; j < maxY; j += latDistance) {
            // Ensure the calculated bounding box does not extend beyond the city's maximum boundaries
            const subBox = [
                i, 
                j, 
                Math.min(i + lngDistance, maxX), // Prevent extending beyond maxX
                Math.min(j + latDistance, maxY)  // Prevent extending beyond maxY
            ];
            boundingBoxes.push(subBox);
        }
    }

    return boundingBoxes;
}

function flyToFeature(feature) {
    map.flyTo({
        center: feature.geometry.coordinates,
        zoom: 15
    });
}

map.on('load', function () {
    map.on('click', 'markers', function (e) {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const description = e.features[0].properties.description;

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(description)
            .addTo(map);
    });
});
