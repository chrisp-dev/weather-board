$(document).ready(function () {
    // enter code here
    let weatherApiKey = 'c36ac4ee2ac54475c59bef266d011a17';

    const API_URL = 'https://api.openweathermap.org/data/2.5/weather?appid=c36ac4ee2ac54475c59bef266d011a17&';
    const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast?appid=c36ac4ee2ac54475c59bef266d011a17&';
    const API3 = 'https://api.openweathermap.org/data/2.5/uvi?appid=c36ac4ee2ac54475c59bef266d011a17&'

    let searchResults = JSON.parse(localStorage.getItem('cache')) || {};
    let cities = ['Albuquerque', 'Baltimore', 'Chicago', 'Minneapolis', 'New York', 'Seattle', 'Shanghai'];


    // full width of page
    let container = $('<div class="p-2 m-auto">');

    // full width of container
    let row = $('<div class="sm:flex w-full p-3">');

    // 2/3 of container
    let col8 = $('<div class="sm:w-2/3 text-xl">');

    // 1/3 of container
    let col4 = $('<div class="">');

    // create search input
    let searchInput = $('<input class="border rounded-lg p-2 mb-2" type=text id=search placeholder=City...>');
    let searchLabel = $('<label for=search>');
    searchLabel.text("Search for a city:");

    // search input should be half of top of paaaaage
    col4.append(searchLabel, searchInput);
    $('body').prepend(container);

    let jumbo = $('<div id=resultDisplay class="p-10 text-lg text-bolder bg-blue-200">');
    jumbo.text("Select a City");
    col8.append(jumbo);
    row.append(col4, col8);
    container.append(row);

    // create timer obj
    var tOut;

    // search event handler on keyup
    searchInput.on('keyup', search)
    let searchTerm;

    function search(event) {
        searchTerm = searchInput.val().toLowerCase()

        // clear timer obj
        if (tOut) clearTimeout(tOut);

        if (!searchInput.val() || searchInput.val().length < 3) return;
        tOut = setTimeout(function () {
            // repeated search - get from cache
            if (searchResults[searchTerm]) {
                renderCurrentWeather(searchResults[searchTerm][0]);
                renderForecast(searchResults[searchTerm][1]);
            } else {
                // fresh request
                geet(searchTerm);
            }
        }, 350)
    }

    function geet(searchTerm) {
        $.when(
            $.get(`${API_URL}q=${searchInput.val()}`),
            $.get(`${FORECAST_API_URL}q=${searchInput.val()}`))
            .done(function (api1, api2) {
                let lat = api1[0].coord.lat;
                let lon = api1[0].coord.lon;

                $.get(`${API3}lat=${lat}&lon=${lon}`)
                    .then(function (data) {
                        api1[0].uv = data.value;

                        responseToQuery(api1, api2);
                    });
            });
    }

    function getByLatLon(searchQuery) {
        $.when(
            $.get(`${API_URL}${searchQuery}`),
            $.get(`${FORECAST_API_URL}${searchQuery}`),
            $.get(`${API3}${searchQuery}`))
            .done(responseToQuery);
    }

    function responseToQuery(dataCurrent, dataForecast) {
        let allData = [dataCurrent[0], dataForecast[0]];
        searchResults[searchTerm] = allData;

        renderWeatherData(searchTerm);

        localStorage.setItem('cache', JSON.stringify(searchResults));
    }

    // creating the clear button
    let clear = $('<button id=clear class="border border-gray-300 hover:bg-gray-500 hover:text-white rounded-lg w-1/3 p-2">Clear Cache</button>');

    $(clear).on('click', clearCache);

    function clearCache() {
        $("#search").val("");
        searchResults = {};
        localStorage.removeItem('cache');
    }

    // attach clear button to the container
    container.append(clear);

    // this renders the history of the last 8 or so cities
    function renderCities() {
        let ul = $("<ul class='w-full'>");

        cities.forEach(city => {
            let li = $('<li class="bg-blue-500 m-1 p-2 sm:w-1/2 rounded-lg m-auto mb-3 text-center hover:text-red-500 text-white br-4">');
            li.text(city);
            li.attr('style', 'list-style-type: none;cursor:pointer;box-shadow:2px 2px lightblue;')

            li.on('click', function () {
                searchInput.val(city);
                search();
            });
            ul.append(li);
        });

        col4.append(ul);
    }

    function renderForecast(data) {
        let forecastDisplay = $('#forecast');
        forecastDisplay.html("");
        for (let i = 4; i < 37; i += 8) {
            let div = $('<div class="w-full text-center border border-red-500">');
            div.attr('style', 'background:lightblue;')

            // day - description icon - temp F - humidity
            let day = $('<div class="">');
            let icon = $('<img class="m-auto">');
            let temp = $('<div>');
            let humidity = $('<div>');

            day.text(moment(data.list[i].dt_txt).format('l'));
            day.attr('style', 'font-weight:bolder;');
            icon.attr('src', 'http://openweathermap.org/img/wn/' + data.list[i].weather[0].icon + '.png');
            temp.text('Temp: ' + kToF(data.list[i].main.temp) + '°F');
            humidity.text('Humidity: ' + data.list[i].main.humidity + '%')

            div.append(day, icon, temp, humidity);
            forecastDisplay.append(div);
        }
    }

    function geo() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (loc) {

                searchTerm = `lat=${loc.coords.latitude}&lon=${loc.coords.longitude}`;

                getByLatLon(searchTerm);
            });
        }
    }

    function renderWeatherData(searchTerm) {
        let data = searchResults[searchTerm];

        renderCurrentWeather(data[0]);
        renderForecast(data[1]);
    }
    function renderCurrentWeather(data) {
        $("#resultDisplay").text("");
        let h1 = $("<h1 class='text-3xl font-bold'>");
        h1.text(data.name);
        let ul = $('<ul class="w-full p-4 text-xl font-semibold bg-blue-300">');
        let li1 = $('<li>');
        let li2 = $('<li>');
        let li3 = $('<li>');
        let li4 = $('<li>');
        let li5 = $('<li>');

        li1.text(`Humidity: ${data.main.humidity}%`);
        li2.text(`Weather: ${data.weather[0].main}`);
        li3.text(`UV Index: ${data.uv}`);
        li4.text(`Temperature: ${kToF(data.main.temp)}°F`);
        li5.text(`Wind: ${data.wind.speed}mph`);

        ul.append(li1, li2, li3, li4, li5);
        $("#resultDisplay").append(h1, ul);
    }

    function kToF(k) {
        // (27K − 273.15) × 9/5 + 32
        return ((k - 273.15) * (9 / 5) + 32).toFixed();
    }

    renderCities();
    geo();
});