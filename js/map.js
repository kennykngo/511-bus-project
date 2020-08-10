function initMap() {
  // Create the map.
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: 37.7749, lng: -122.4194 }, // SF
  });
}

// function initMap() {
//   const directionsService = new google.maps.DirectionsService();
//   const directionsRenderer = new google.maps.DirectionsRenderer();
//   const map = new google.maps.Map(document.getElementById("map"), {
//     zoom: 7,
//     center: {
//       lat: 41.85,
//       lng: -87.65,
//     },
//   });
//   directionsRenderer.setMap(map);

//   const onChangeHandler = function () {
//     calculateAndDisplayRoute(directionsService, directionsRenderer);
//   };

//   onChangeHandler();
// }

// function calculateAndDisplayRoute(directionsService, directionsRenderer) {
//   var start = new google.maps.LatLng(41.850033, -87.6500523);
//   var end = new google.maps.LatLng(37.7749, -122.4194);
//   directionsService.route(
//     {
//       origin: start,
//       destination: end,
//       travelMode: google.maps.TravelMode.DRIVING,
//     },
//     (response, status) => {
//       if (status === "OK") {
//         directionsRenderer.setDirections(response);
//       } else {
//         window.alert("Directions request failed due to " + status);
//       }
//     }
//   );
// }
