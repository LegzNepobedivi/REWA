mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/streets-v12", // style URL
  center: stan.geometry.coordinates, // starting position [lng, lat]
  zoom: 4, // starting zoom
});

new mapboxgl.Marker()
  .setLngLat(stan.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${stan.title}</h3><p>${stan.location}</p>`
    )
  )
  .addTo(map);
