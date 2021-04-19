import "../assets/sass/main.scss";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import "tailwindcss/tailwind.css";

window.addEventListener("load", () => {
  getStoredData();
  loadHomeView();
});

const app = document.querySelector(".app");
mapboxgl.accessToken = "pk.eyJ1IjoiY2FybG9zYXBhIiwiYSI6ImNqbmxtdGNtaDFmNGczcXRhZ2dmOGR5ZXIifQ.xUQuy5ED3QD0neNNglnWgw";
const appid = "b92eb8a2e5fe79e7ea0cfcf4ebb3d1b8";
let map;
let data;
let storedData;
let lastLocation;

const getStoredData = () => {
  if (localStorage.getItem("storedData")) {
    storedData = JSON.parse(localStorage.getItem("storedData"));
  } else {
    storedData = [];
    localStorage.setItem("storedData", JSON.stringify(storedData));
  }
};

const loadHomeView = () => {
  homeHeader();
  homeMainMap();
  homeFooter();
};

const homeHeader = () => {
  const header = app.querySelector(".header");
  header.innerHTML = `
        <h3>Welcome to Weather app...</h3>
    `;
};

const homeMainMap = () => {
  const main = app.querySelector(".main");
  main.innerHTML = `<div id="map"></div>`;

  map = new mapboxgl.Map({
    container: "map", // container id
    style: "mapbox://styles/mapbox/dark-v10", // style URL
    center: lastLocation ? lastLocation : [-74.5, 40], // starting position [lng, lat]
    zoom: 9, // starting zoom
  });

  storedData.forEach((sData) => {
    console.log(sData.coord);
    const marker = new mapboxgl.Marker().setLngLat([sData.coord.lon, sData.coord.lat]).addTo(map);
  });

  map.on("click", (ev) => {
    getClosePlace(ev.lngLat);
  });
};

const homeFooter = () => {
  const footer = app.querySelector(".footer");
  footer.innerHTML = `
        <button class="check_location px-4 py-2 bg-blue-600 text-white rounded-full text-sm mr-4 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <span class="fa fa-crosshairs mr-2"></span>
            <span>Check location</span>
        </button>
        <button class="clear_locations px-4 py-2 border-2 text-gray-700 border-blue-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-400">
            <span class="fa fa-ban mr-2"></span>
            <span>Clear locations</span>
        </button>
    `;
  footer.querySelector(".check_location").addEventListener("click", () => {
    app.querySelector(".spinner").classList.add("active");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      map.flyTo({
        center: [coords.longitude, coords.latitude],
      });
      app.querySelector(".spinner").classList.remove("active");
    });
  });

  footer.querySelector(".clear_locations").addEventListener("click", () => {
    storedData = [];
    localStorage.setItem("storedData", JSON.stringify(storedData));
    homeMainMap();
  });
};

const getClosePlace = async ({ lat, lng }) => {
  loadFetchingView();
  lastLocation = { lat, lng };
  window.setTimeout(async () => {
    data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${appid}&units=metric`)
      .then((d) => d.json())
      .then((d) => d);
    loadSingleView();
  }, 1500);
};

const loadFetchingView = () => {
  fetchHeader();
  fetchMain();
  fetchFooter();
};

const fetchHeader = () => {
  const header = app.querySelector(".header");
  header.innerHTML = ``;
};

const fetchMain = () => {
  const main = app.querySelector(".main");
  main.innerHTML = `fetching....`;
};

const fetchFooter = () => {
  const footer = app.querySelector(".footer");
  footer.innerHTML = ``;
};

const loadSingleView = () => {
  singleHeader();
  singleMain();
  singleFooter();
};

const singleHeader = () => {
  const header = app.querySelector(".header");
  header.innerHTML = `
    <div class="single_header flex items-center">
        <span class="fa fa-arrow-left mr-4"></span>
        <span class="lab">Get back</span>
    </div>
  `;
  header.querySelector(".single_header").addEventListener("click", () => {
    loadHomeView();
  });
};

const singleMain = () => {
  const main = app.querySelector(".main");
  main.innerHTML = `fetching....`;
};

const singleFooter = () => {
  const footer = app.querySelector(".footer");
  footer.innerHTML = `
          <button class="footer_action px-4 py-2 bg-blue-600 text-white rounded-full text-sm mr-4 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <span class="fa fa-save"></span>
              <span>Save location</span>
          </button>
      `;
  footer.querySelector(".footer_action").addEventListener("click", () => {
    saveLocation();
  });
};

const saveLocation = () => {
  storedData.push(data);
  localStorage.setItem("storedData", JSON.stringify(storedData));
  loadHomeView();
};
