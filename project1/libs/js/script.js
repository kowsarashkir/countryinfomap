$(document).ready(function () {
  // Initialize DataTable on page load
  let countriesData = [];

  // Fetch countries and populate the select dropdown
  function fetchCountries() {
    return new Promise(function (resolve, reject) {
      $.ajax({
        url: "libs/php/getCountriesInfo.php",
        type: "GET",

        success: function (result) {
          countriesData = result;
          console.log({ countriesData });

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

  // Fetch countries on page load
  fetchCountries();

  // hide all easybutton before country select

  function hideEasyButtons() {
    $(".easy-button-button leaflet").hide();
  }
  hideEasyButtons();
  $("#selCountry").on("change", function () {
    console.log({ countriesData });
    const country = $(this).val();

    console.log({ country });
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
            //   due to other neccesary data not available in opencagedata api, I have made additional request to restCountry APi

            // here, we make a call to openweather map
            getCountryWeather(res.data)
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
  });

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

  function getCountryWeather(data) {
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

            displayCountryWeather(result.data);
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

  var map = L.map("map").setView([54.7023545, -3.2765753], 15);
  // Leaflet tileLayer

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
  var hybridLayer = L.layerGroup([streetLayer, satelliteLayer]);

  // Add the default street layer to the map
  streetLayer.addTo(map);

  var baseLayers = {
    "Street Map": streetLayer,
    "Satellite Map": satelliteLayer,
    "Hybrid Map": hybridLayer,
  };

  L.control.layers(baseLayers).addTo(map);

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

  function displayCountryInfo(data, selectedCountry) {
    console.log("AAAA");
    console.log({ selectedCountry });
    const { rest } = selectedCountry;
    $("#infoModal #countryName").text(
      `Country Information for ${data.country}`
    );

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

  function displayCountryWeather(data) {
    $("#weatherModal #countryName").text("Current Waether for: ");

    $("#weatherModal #txtTemp").text(`${data.current.temp}  degrees`);
    $("#weatherModal #txtHummidity").text(`${data.current.humidity}  degrees`);
    $("#weatherModal #txtPressure").text(`${data.current.pressure}  Pa`);
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

  //append leaflet easyButtons

  L.easyButton("fa-circle-info", function (btn, map) {
    $("#infoModal").modal("show");
  }).addTo(map);

  L.easyButton("fas fa-sun", function (btn, map) {
    $("#weatherModal").modal("show");
  }).addTo(map);

  L.easyButton("fas fa-sun", function (btn, map) {
    $("#currencyModal").modal("show");
  }).addTo(map);
});
