$(document).ready(function () {
  // Initialize DataTable on page load
  let countriesData = [];

  // Fetch countries on page load
  fetchCountries();

  // hide all easybutton before country select

  hideEasyButtons();
  $("#selCountry").on("change", selectCountry);

  // Leaflet tileLayer

  // Get the current location using the Geolocation API
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        // Create a marker for the current location

        map.setView([lat, lon], 6);
        // Set the map view to the current location
      },
      function (error) {
        console.error("Error getting geolocation:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
});
