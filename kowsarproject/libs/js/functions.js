// Fetch countries and populate the select dropdown

var streetLayer = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "© OpenStreetMap contributors",
  }
);

var satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

// Create a layer group with both tile layers
var hybridLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

const overlays = L.markerClusterGroup();

var map = L.map("map", {
  center: [54.5, -4],
  zoom: 4,
  minZoom: 2,
  zoomControl: true,

  layers: [streetLayer, overlays],
});

// Add the default street layer to the map
streetLayer.addTo(map);

var baseLayers = {
  "Street Map": streetLayer,
  "Satellite Map": satelliteLayer,
  "Hybrid Map": hybridLayer,
};

// L.control.layers(baseLayers).addTo(map);

L.easyButton({
  states: [
    {
      stateName: "custom-button",
      icon: "fa-circle-info",
      title: "Country Info",
      onClick: function (control) {
        $("#infoModal").modal("show");
      },
    },
  ],
  className: "custom-button btn btn-lg ", // Add your custom class here
}).addTo(map);

L.easyButton({
  states: [
    {
      stateName: "custom-button",
      icon: "fas fa-cloud",
      title: "Weather Information",
      onClick: function (control) {
        $("#weatherModal").modal("show");
      },
    },
  ],
  className: "custom-button btn btn-lg ", // Add your custom class here
}).addTo(map);

L.easyButton({
  states: [
    {
      stateName: "custom-button",
      icon: "fas fa-cloud",
      title: "Currency Information",
      onClick: function (control) {
        $("#currencyModal").modal("show");
      },
    },
  ],
  className: "custom-button btn btn-lg ", // Add your custom class here
}).addTo(map);

L.easyButton({
  states: [
    {
      stateName: "custom-button",
      icon: "fas fa-cloud",
      title: "Timezone Information",
      onClick: function (control) {
        $("#populationModal").modal("show");
      },
    },
  ],
  className: "custom-button btn btn-lg ", // Add your custom class here
}).addTo(map);

L.easyButton({
  states: [
    {
      stateName: "custom-button",
      icon: "fas fa-cloud",
      title: "Wikipedia Information",
      onClick: function (control) {
        $("#wikiModal").modal("show");
      },
    },
  ],
  className: "custom-button btn btn-lg ", // Add your custom class here
}).addTo(map);

function fetchCountries() {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "libs/php/getCountriesInfo.php",
      type: "GET",

      success: function (result) {
        countriesData = result;

        let country_options = "<option default> Select country</option>";
        result.map(function (country) {
          country_options += `<option value='${country.name}'> ${country.name}</option>`;
        });

        $("#selCountry").html(country_options);
        resolve(result);
      },
      error: function (err) {
        reject(err);
        // Handle error here
      },
    });
  });
}

function hideEasyButtons() {
  $(".easy-button-button leaflet").hide();
}

function currencyConverter(base = "USD", pair, rates) {
  console.log({ pair });
  let selected_rate = rates[pair];

  console.log({ selected_rate });
  return selected_rate;
}
function getCountryInfo(countryName, selectedCountry) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "libs/php/countryInfo.php",
      type: "POST",
      dataType: "json",
      data: {
        countryName: countryName,
        getCountryInfo: 1,
      },
      success: function (result) {
        console.log({ result });
        resolve(result);
        if (result.data) {
          const others = result.data.others;

          displayCountryInfo(result.data, selectedCountry);

          displayCountryPopulation(result.data, selectedCountry);

          let lat = result.data.lat;
          let lon = result.data.lng;
          map.setView([lat, lon]);

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

function getCountryWeather(data, country) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "libs/php/countryInfo.php",
      type: "POST",
      dataType: "json",
      data: {
        lng: data.lng,
        lat: data.lat,
        getCountryWeather: 1,
      },
      success: function (result) {
        resolve(result);

        //   return;
        if (result.data) {
          const { data } = result;

          displayCountryWeather(result.data, country);
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

function getCountryRestData(country) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "libs/php/countryInfo.php",
      type: "POST",
      dataType: "json",
      data: {
        getCountryRestData: 1,
        countryName: country,
      },
      success: function (result) {
        resolve(result);
      },
      error: function (err) {
        reject(err);
        // Handle error here
      },
    });
  });
}

function getCountryCurrency(country) {
  console.log("Currencysddddd", country);

  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "libs/php/countryInfo.php",
      type: "POST",
      dataType: "json",
      data: {
        getCountryCurrency: 1,
      },
      success: function (result) {
        resolve(result);

        //   return;
        if (result.status.code === "200") {
          const { rates } = result.data;

          console.log({ rates });

          let selected = Object.keys(country.rest[0].currencies)[0];
          console.log({ selected });

          const conversion = currencyConverter(
            (base = "USD"),
            (pair = selected),
            rates
          );

          displayCountryCurrency(country, conversion);

          // displayCountryWeather(result.data);
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

function getCountryWiki(lat, lng) {
  console.log({ lat, lng });
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "libs/php/countryInfo.php",
      type: "POST",
      dataType: "json",
      data: {
        getCountryWiki: 1,
        lat: lat,
        lng: lng,
      },
      success: function (result) {
        resolve(result);

        const { data } = result;
        console.log("RRRRRRRRRRRRRRRRRRR");
        console.log({ result });

        displayCountryWiki(data);
      },
      error: function (err) {
        reject(err);
        // Handle error here
      },
    });
  });
}

function getCountryLayers(code) {
  countryCode = code.data.properties.iso_a2;

  let layer = {
    type: "FeatureCollection",
  };

  $.when(
    $.ajax({
      url: "libs/php/countryInfo.php",
      method: "POST",
      data: {
        countryCode: countryCode,
        requestType: "airport",
        getCountryLayers: 1,
      },
    }),

    $.ajax({
      url: "libs/php/countryInfo.php",
      method: "POST",
      data: {
        countryCode: countryCode,
        requestType: "hotels",
        getCountryLayers: 1,
      },
    }),

    $.ajax({
      url: "libs/php/countryInfo.php",
      method: "POST",
      data: {
        countryCode: countryCode,
        requestType: "restaurant",
        getCountryLayers: 1,
      },
    })
  )
    .done(function (
      response1,
      response2,
      response3 /*, additional responses */
    ) {
      console.log({ response1, response2, response3 });
      // Handle responses here
      const features = [];

      var airportData = response1[0].data;
      var hotelData = response2[0].data;

      var restaurantData = response3[0].data;

      airportData.forEach(function (item) {
        const data = {
          type: "Feature",
          properties: { name: item.name },
          geometry: {
            type: "Point",
            coordinates: [item.lng, item.lat],
          },
        };

        console.log({ data });

        features.push(data);
      });
      // hotelData.forEach(function (item) {
      //   const data = {
      //     type: "Feature",
      //     properties: { name: item.name },
      //     geometry: {
      //       type: "Point",
      //       coordinates: [item.lat, item.lng],
      //     },
      //   };
      //   console.log({ data });

      //   features.push(data);
      // });
      // restaurantData.forEach(function (item) {
      //   const data = {
      //     type: "Feature",
      //     properties: { name: item.name },
      //     geometry: {
      //       type: "Point",
      //       coordinates: [item.lat, item.lng],
      //     },
      //   };
      //   console.log({ data });

      //   features.push(data);
      // });
      // Process data as needed

      layer = {
        ...layer,
        ...features,
      };

      var markerGroup = L.layerGroup();

      // var airportIcon = L.ExtraMarkers.icon({
      //   prefix: "fa",
      //   icon: "fa-plane",
      //   iconColor: "black",
      //   markerColor: "red",
      //   shape: "square",
      // });

      // let hotelIcon = L.ExtraMarkers.icon({
      //   prefix: "fa",
      //   icon: "fa-bed",
      //   iconColor: "green",
      //   markerColor: "red",
      //   shape: "square",
      // });

      // let restaurantIcon = L.ExtraMarkers.icon({
      //   prefix: "fa",
      //   icon: " fa-cutlery",
      //   iconColor: "green",
      //   markerColor: "red",
      //   shape: "square",
      // });

      // markerGroup.addTo(map);

      var airportsLayer = L.geoJSON(features, {
        onEachFeature: function (feature, layer) {
          layer.bindPopup(feature.properties.name);
        },
      });

      // var hotelsLayer = L.geoJSON(features, {
      //   onEachFeature: function (feature, layer) {
      //     layer.bindPopup(feature.properties.name);
      //   },
      // });

      // var restaurantsLayer = L.geoJSON(features, {
      //   onEachFeature: function (feature, layer) {
      //     layer.bindPopup(feature.properties.name);
      //   },
      // });

      const overlayMaps = {
        airports: airportsLayer,
      };

      L.control.layers(baseLayers, overlayMaps).addTo(map);
    })
    .fail(function (error) {
      // Handle errors here
      console.error("Error:", error);
    });
}

function markBorders(geometry) {
  const { type, coordinates } = geometry;
  const defaultStyle = {
    weight: 3,
    opacity: 0.3,
    color: "red",
    fillOpacity: 0.3,
  };

  const coordinates_data = [];
  coordinates.map((c) => {
    coordinates_data.push(...c);
  });

  if (type === "MultiPolygon") {
    countryBorder = L.geoJson({
      type: "Polygon",
      coordinates: coordinates_data,
    })
      .setStyle(defaultStyle)
      .addTo(map);
  } else {
    countryBorder = L.geoJson({
      type: "Polygon",
      coordinates: [coordinates_data],
    })
      .setStyle(defaultStyle)
      .addTo(map);
  }

  map.fitBounds(countryBorder.getBounds());
}

let borderJSON = markBorders;

function displayCountryInfo(data, selectedCountry) {
  console.log("AAAA");
  console.log({ selectedCountry });
  const { rest } = selectedCountry;
  $("#infoModal #countryName").text(`Country Information for ${data.country}`);

  $("#infoModal #txtContinent").text(data.others.components.continent);

  $("#infoModal #txtCurrency").text(data.others.annotations.currency.name);

  $("#infoModal #txtTimezone").text(data.others.annotations.timezone.name);

  $("#infoModal #countryName").text(data.others.components.country);

  $("#infoModal #txtcoord").text(
    " Latitude: " +
      data.others.annotations.DMS.lat +
      " Longitude: " +
      data.others.annotations.DMS.lng
  );

  $("#infoModal #txtCapital").text(`${rest[0].capital}`);

  $("#infoModal #txtPopulation").text(`${rest[0].population}`);
}

function displayCountryWeather(data, country) {
  $("#weatherModal #countryName").text("Current Weather for: " + country);

  $("#weatherModal #txtTemp").text(`${data.current.temp}  degrees`);
  $("#weatherModal #txtHummidity").text(`${data.current.humidity}  %`);
  $("#weatherModal #txtPressure").text(`${data.current.pressure}  Pa`);
}

function displayCountryPopulation(data, selectedCountry) {
  const { rest } = selectedCountry;

  $("#populationModal #countryName").text(
    "Showing population data for: " + selectedCountry.name
  );

  $("#populationModal #txtPopulation").text(
    `${formatNumber(rest[0].population)}`
  );
}

function displayCountryWiki(data) {
  const { geonames } = data;

  let wiki_content = "";

  geonames.map((item) => {
    wiki_content += `<p>${item.title}  </p> <p>${item.summary}  </p>  <p><a class="text-info" target="_blank" href='https://${item.wikipediaUrl}'>Read More</a>  </p>`;
  });

  $("#wikiModal #countryName").text("Showing Wikipedia Info for: ");

  $("#wikiModal #wikiInfo").html(wiki_content);
}

function formatDecimalNumber(number, decimalPlaces) {
  // Check if the input is a valid number
  if (isNaN(number)) {
    return "Invalid number";
  }

  // Use toFixed to format the number with the specified decimal places
  var formattedNumber = parseFloat(number).toFixed(decimalPlaces);

  // Remove trailing zeros
  formattedNumber = formattedNumber.replace(/\.?0+$/, "");

  return formattedNumber;
}

function formatNumber(number) {
  // Convert the number to a string
  let numStr = number.toString();

  // Split the string into integer and decimal parts (if any)
  let parts = numStr.split(".");

  // Add commas to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Join the integer and decimal parts back together
  return parts.join(".");
}
function displayCountryCurrency(data, conversion) {
  console.log({ data });

  let countryName = data.rest[0].name.common;
  let currency_values = Object.values(data.rest[0].currencies);

  console.log({ currency_values });

  let currency_display = "";

  currency_values.map((item) => {
    currency_display += `<p>${item.name}  <span>${item.symbol} </span></p>`;
  });
  $("#currencyModal #currencyName").text(
    "Currency Information for: " + countryName
  );

  $("#currencyModal #txtCurrency").html(currency_display);

  $("#currencyModal #txtConversion").text(
    `${formatDecimalNumber(conversion, 1)}  Per USD`
  );
}

function removeAllLayers() {
  map.eachLayer(function (layer) {
    console.log({ layer });

    // Check if the layer is not the tile layer (assuming tile layer is added first)
    if (layer !== map._layers[L.stamp(map._container)]) {
      map.removeLayer(layer);
    }
  });
}

function selectCountry() {
  // removeAllLayers();
  const country = $(this).val();

  let selectedCountry;

  countriesData.map(function (item) {
    if (item.name === country) {
      selectedCountry = item;
      const geometry = item.data.geometry;

      markBorders(geometry);
    }
  });

  getCountryRestData(country)
    .then((res) => {
      selectedCountry = {
        ...selectedCountry,
        rest: res.data,
      };

      getCountryInfo(country, selectedCountry)
        .then((res) => {
          getCountryWeather(res.data, country)
            .then((weather) => {
              console.log({ weather });
            })
            .catch((err) => console.log({ err }));

          getCountryWiki(
            selectedCountry.rest[0].latlng[0],
            selectedCountry.rest[0].latlng[1]
          )
            .then((weather) => {
              console.log({ weather });
            })
            .catch((err) => console.log({ err }));

          // next, we get currency data

          console.log({ selectedCountry });

          getCountryCurrency(selectedCountry)
            .then((currency) => {
              console.log({ currency });
            })
            .catch((err) => console.log({ err }));
        })
        .catch((err) => console.log({ err }));
    })
    .catch((err) => console.log({ err }));

  getCountryLayers(selectedCountry);
}
