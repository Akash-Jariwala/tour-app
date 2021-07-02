/* eslint-disable */

export const displayMap = (locations) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiYWthc2hqYXJpd2FsYSIsImEiOiJja3AyamYwYnUxdW1mMm5xZ3lpZnoxczVtIn0.G97NQqz5HU9OXclTLy1ZZg';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        scrollZoom: false
    });
    
    
};
  