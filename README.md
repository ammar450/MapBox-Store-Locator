# Store Locator Web Map

This project implements a web-based store locator using Mapbox GL JS. Users can search for stores within a specified location and view them on a map. The application fetches store data from the Mapbox Geocoding API by dividing the specified location into multiple bounding boxes and fetching stores without worrying about the limit. You can adjust the size of bounding boxes according to your need . It then displays the stores on the map with custom markers

## Features

- Search for stores by location and store name
- Display stores on the map with custom markers
- Click on markers to view store details
- Filter stores based on location and store name

## Getting Started

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/store-locator-web-map.git
    ```

2. Navigate to the project directory:

    ```bash
    cd store-locator-web-map
    ```

3. Open the `index.html` file in your web browser.

4. Enter a location and store name in the search bar and click "Search" to find stores.

## Usage

- Enter a location (e.g., city or country) in the "Enter location" input field.
- Enter a store name in the "Enter store name" input field (optional).
- Click the "Search" button to search for stores within the specified location.
- Click on a store in the sidebar to fly to its location on the map.

## Dependencies

- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
- [jQuery](https://jquery.com/)
- [Turf.js](https://turfjs.org/)

## API Key

To use this application, you need a Mapbox access token. You can obtain one by signing up at [Mapbox](https://www.mapbox.com/). Once you have an access token, replace `'YOUR_MAPBOX_ACCESS_TOKEN'` in the `main.js` file with your actual access token.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
