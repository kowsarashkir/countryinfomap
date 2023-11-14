$(document).ready(function () {
  // Initialize DataTable on page load

  // Fetch countries and populate the select dropdown
  function fetchCountries() {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: "libs/php/getCountriesInfo.php",
        type: "GET",

        success: function (result) {
          console.log({ result });

          let country_options = "<option default> Select country</option>";
          result.map(function (country) {
            country_options += `<option value='${country.name}'> ${country.name}</option>`;
          });

          $("#selCountry").html(country_options);
          resolve(result);
          if (result.data) {
            const others = result.data.others;

            // not all information is available on opencaged api  so I used restcountriesapi as well
          } else {
            console.log("Data object not found in the response.");
          }
        },
        error: function (err) {
          reject(err);
          // Handle error here
        },
      });
    });
  }

  // Fetch countries on page load
  fetchCountries();

  // hide all easybutton before country select

  function hideEasyButtons() {
    $(".easy-button-button leaflet").hide();
  }
  hideEasyButtons();
  $("#selCountry").on("change", function () {
    const country = $(this).val();
    console.log({ country });

    getCountryInfo(country)
      .then((res) => console.log({ res }))
      .catch((err) => console.log({ err }));
  });

  function getCountryInfo(countryName) {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: "libs/php/countryInfo.php",
        type: "POST",
        dataType: "json",
        data: {
          countryName: countryName,
        },
        success: function (result) {
          console.log({ result });
          resolve(result);
          if (result.data) {
            const others = result.data.others;

            displayCountryInfo(result.data);

            let lat = result.data.lat;
            let lon = result.data.lng;
            map.setView([lat, lon], 6);

            // not all information is available on opencaged api  so I used restcountriesapi as well
          } else {
            console.log("Data object not found in the response.");
          }
        },
        error: function (err) {
          reject(err);
          // Handle error here
        },
      });
    });
  }

  // Leaflet tileLayer
  var streets = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
    }
  );

  var satellite = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution:
        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    }
  );

  var basemaps = {
    Streets: streets,
    Satellite: satellite,
  };

  map = L.map("map", {
    layers: [streets],
  }).setView([54.7023545, -3.2765753], 6);

  var layerControl = L.control.layers(basemaps).addTo(map);

  var geojsonData = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {
          "city ": "Glasgow",
          region: "north lanakshire",
        },
        geometry: {
          coordinates: [-4.255901553292944, 55.87424672838188],
          type: "Point",
        },
        id: 0,
      },
    ],
  };
  function displayCountryInfo(data) {
    // save current currency code in local storage

    // let currencyCode = Object.keys(data.others.currencies)[0];

    // select the countryInfo modal
    // set continentInfo

    $("#modal1 #countryName").text(data.country);

    $("#modal1 #txtContinent").text(data.others.components.continent);

    $("#modal1 #txtCurrency").text(data.others.annotations.currency.name);

    $("#modal1 #txtTimezone").text(data.others.annotations.timezone.name);

    $("#modal1 #countryName").text(data.others.components.country);

    $("#modal1 #txtcoord").text(
      " Latitude: " +
        data.others.annotations.DMS.lat +
        " Longitude: " +
        data.others.annotations.DMS.lng
    );
  }

  // Get the current location using the Geolocation API
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        var lat = position.coords.latitude;
        var lon = position.coords.longitude;

        // Create a marker for the current location
        https: var streets = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
          {
            attribution:
              "Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012",
          }
        );

        map.setView([lat, lon], 15);
        // Set the map view to the current location
      },
      function (error) {
        console.error("Error getting geolocation:", error);
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }

  //append leaflet easyButtons

  L.easyButton("fa-circle-info", function (btn, map) {
    $("#modal1").modal("show");
  }).addTo(map);
});
