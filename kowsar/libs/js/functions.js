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

var countryBorder;

// Initial GeoJSON layers
var airportGeoJSONLayer = null;
var hotelGeoJSONLayer = null;
var restaurantGeoJSONLayer = null;

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
  iconSize: [60, 60], // Adjust the size as needed
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
      icon: "fa-solid fa-dollar-sign",
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
      icon: "fas fa-smile",
      title: "Holiday Information",
      onClick: function (control) {
        $("#holidayModal").modal("show");
      },
    },
  ],
  className: "custom-button btn btn-lg ", // Add your custom class here
}).addTo(map);

L.easyButton({
  states: [
    {
      stateName: "custom-button",
      icon: "fas fa-wikipedia-w",
      title: "Wikipedia Information",
      onClick: function (control) {
        $("#wikiModal").modal("show");
      },
    },
  ],
  className: "custom-button btn btn-lg ", // Add your custom class here
}).addTo(map);

function formatNumberWithCommas(number) {
  // Convert the number to a string
  let numberString = number.toString();

  // Use a regular expression to add commas every three digits
  numberString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Add spaces for better readability if needed
  // Example: 10 304 955 905
  numberString = numberString.replace(/,/g, ",");

  return numberString;
}

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

function getCountryHolidays(data) {
  const country = data.data.properties.iso_a2;

  return new Promise(function (resolve, reject) {
    $.ajax({
      url: "libs/php/countryInfo.php",
      type: "POST",
      dataType: "json",
      data: {
        country: country,
        getCountryHolidays: 1,
      },
      success: function (result) {
        resolve(result);

        console.log("HOLIDAY", result);
        //   return;
        if (result.data) {
          const { data } = result;

          displayCountryHolidays(data);
          // displayCountryWeather(result.data, country);
        } else {
          console.log("Data object not found in the response.");
        }
      },
      error: function (err) {
        reject(err);
        console.log({ err });
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

          displayCountryCurrency(country, conversion, pair);

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

function getCountryWiki(lat, lng, country) {
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

        displayCountryWiki(data, country);
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
      const featuresR = [];
      const featuresH = [];

      // Function to create a Leaflet marker with a custom icon
      function createCustomMarker(feature, latlng) {
        const iconClass = feature.properties.icon || "fa-map-marker"; // Default icon class

        // Create an ExtraMarker
        const extraMarker = L.ExtraMarkers.icon({
          icon: iconClass,
          markerColor: feature.properties.color, // You can customize the marker color here
          shape: "circle",
          prefix: "fas",
        });

        // Create the marker with the custom icon
        return L.marker(latlng, { icon: extraMarker });
      }

      function updateLayers(newCountryData) {
        // Clear existing GeoJSON layers
        if (airportGeoJSONLayer) {
          map.removeLayer(airportGeoJSONLayer);
        }
        if (hotelGeoJSONLayer) {
          map.removeLayer(hotelGeoJSONLayer);
        }
        if (restaurantGeoJSONLayer) {
          map.removeLayer(restaurantGeoJSONLayer);
        }

        // Create new GeoJSON layers with the updated data
        airportGeoJSONLayer = L.geoJSON(newCountryData.airports, {
          pointToLayer: createCustomMarker,
          onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name);
          },
        });

        hotelGeoJSONLayer = L.geoJSON(newCountryData.hotels, {
          pointToLayer: createCustomMarker,
          onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name);
          },
        });

        restaurantGeoJSONLayer = L.geoJSON(newCountryData.restaurants, {
          pointToLayer: createCustomMarker,
          onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.name);
          },
        });

        // Create an object for the new layers control
        var overlayMaps = {
          Airports: airportGeoJSONLayer,
          Hotels: hotelGeoJSONLayer,
          Restaurants: restaurantGeoJSONLayer,
        };

        // Remove old layers control if it exists
        if (map.layersControl) {
          map.removeControl(map.layersControl);
        }

        // Create and add the new layers control to the map
        map.layersControl = L.control
          .layers(baseLayers, overlayMaps)
          .addTo(map);
      }

      // Create an ExtraMarker

      var airportData = response1[0].data;
      var hotelData = response2[0].data;
      var restaurantData = response3[0].data;

      airportData.forEach(function (item) {
        const data = {
          type: "Feature",
          properties: {
            name: item.name,
            icon: "fa-plane",
            color: "blue",
          },
          geometry: {
            type: "Point",
            coordinates: [item.lng, item.lat],
          },
        };

        features.push(data);
      });
      hotelData.forEach(function (item) {
        const data = {
          type: "Feature",
          properties: {
            name: item.name,
            icon: "fa-bed",
            color: "purple",
          },
          geometry: {
            type: "Point",
            coordinates: [item.lng, item.lat],
          },
        };

        featuresH.push(data);
      });
      restaurantData.forEach(function (item) {
        const data = {
          type: "Feature",
          properties: {
            name: item.name,
            icon: "fa-cutlery",
            color: "red",
          },
          geometry: {
            type: "Point",
            coordinates: [item.lng, item.lat],
          },
        };

        featuresR.push(data);
      });

      const countryGEOJSON = {
        airports: features,
        hotels: featuresH,
        restaurants: featuresR,
      };

      function onCountryChange(newCountryData) {
        updateLayers(newCountryData);
      }

      onCountryChange(countryGEOJSON);
    })
    .fail(function (error) {
      // Handle errors here
      console.error("Error:", error);
    });
}

function markBorders(geometry) {
  // Remove existing countryBorder if it exists
  if (countryBorder) {
    map.removeLayer(countryBorder);
  }

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

  $("#infoModal #txtPopulation").text(
    `${formatNumberWithCommas(rest[0].population)}`
  );
}

function displayCountryWeather(data, country) {
  console.log("WEATHER", data);
  $("#weatherModal #countryName").text("Current Weather for: " + country);

  $("#weatherModal #txtTemp").text(
    `${formatDecimalNumber(data.current.temp, 1)}  degrees`
  );

  const iconcode = data.current.weather[0].icon;

  var iconurl = "http://openweathermap.org/img/w/" + iconcode + ".png";

  const description = data.current.weather[0].description;
  const display = `<div class="">
  <img height="80px" width="auto" src="${iconurl}" />
  ${description}
  
  </div>`;

  $("#weatherModal #txtCurrentWeather").html(`${display}  `);

  $("#weatherModal #txtHummidity").text(`${data.current.humidity}  %`);
  $("#weatherModal #txtPressure").text(`${data.current.pressure}  Pa`);

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

function displayCountryWiki(data, country) {
  const { geonames } = data;

  let wiki_content = "";

  geonames.map((item) => {
    wiki_content += `<p>${item.title}  </p> <p>${item.summary}  </p>  <p><a class="text-info" target="_blank" href='https://${item.wikipediaUrl}'>Read More</a>  </p>`;
  });

  $("#wikiModal #countryName").text("Showing Wikipedia Info for: ", country);

  $("#wikiModal #wikiInfo").html(wiki_content);
}

function displayCountryHolidays(data, country) {
  let wiki_content = "";

  data.map((item) => {
    wiki_content += `<div class="border"><p>${item.name}  </p> <p>${item.type}  </p>  <p>${item.date}</p></div>`;
  });

  $("#holidayModal #countryName").text("Showing Holiday Info for: ", country);

  $("#holidayModal #wikiInfo").html(wiki_content);
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
function displayCountryCurrency(data, conversion, pair) {
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

  $("#currencyModal #txtConversionRate").val(conversion);

  $("#currencyModal #txtConversion").text(
    `${formatDecimalNumber(conversion, 1)}  Per USD`
  );

  $("#conversionRateBtn").on("click", function () {
    var amount = parseFloat($("#currencyModal #txtConversionAmount").val());

    const result = parseFloat(conversion) * amount;

    $("#txtConversionResult").html(
      `<h4>${formatDecimalNumber(
        result,
        2
      )} <span class="font-weight-bold"> ${pair}</span></h4>`
    );
    console.log("Result", conversion, amount);
  });
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
            selectedCountry.rest[0].latlng[1],
            country
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

  getCountryHolidays(selectedCountry, country)
    .then((res) => console.log({ res }))
    .catch((err) => console.log({ err }));
}
