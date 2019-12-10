$(document).ready(function () {
    // enter code here
    let weatherApiKey = 'c36ac4ee2ac54475c59bef266d011a17';

    const API_URL = 'https://api.openweathermap.org/data/2.5/weather?appid=c36ac4ee2ac54475c59bef266d011a17&q=';
    const FORECAST_API_URL = 'https://api.openweathermap.org/data/2.5/forecast?appid=c36ac4ee2ac54475c59bef266d011a17&q=';

    let searchResults = JSON.parse(localStorage.getItem('cache')) || {};

    let container = $('<div class=container>');
    let row = $('<div class=row>');
    let col8 = $('<div class=col-8>');
    let col4 = $('<div class=col-4>');

    let searchInput = $('<input class=form-control type=text id=search placeholder=City...>');
    let searchLabel = $('<label>');
    searchLabel.text("Search for a city:");

    col4.append(searchLabel, searchInput);
    $('body').prepend(container);

    let jumbo = $('<div class=jumbotron>').append($('<h1 id=resultDisplay>').text("Select a City"));
    col8.append(jumbo);
    row.append(col4, col8);
    container.append(row);

    // create timer obj
    var tOut;
    searchInput.on('keyup', search)

    function search(event) {
        let searchTerm = searchInput.val().toLowerCase()

        // clear timer obj
        if (tOut) clearTimeout(tOut);

        if (!searchInput.val() || searchInput.val().length < 3) return;
        tOut = setTimeout(function () {
            // repeated search - get from cache
            if (searchResults[searchTerm]) {
                // just render using the searchResults[searchTerm]
                console.log('Old request');
                render(searchResults[searchTerm][0]);
                renderForecast(searchResults[searchTerm][1]);
            } else {
                // fresh request
                console.log('New request');
                $.when($.get(`${API_URL}${searchInput.val()}`), $.get(`${FORECAST_API_URL}${searchInput.val()}`))
                    .done(function (dataCurrent, dataForecast) {
                        let allData = [dataCurrent[0], dataForecast[0]];
                        searchResults[searchTerm] = allData;

                        render(allData[0]);
                        renderForecast(allData[1]);

                        localStorage.setItem('cache', JSON.stringify(searchResults));
                    });
                // $.get(`${API_URL}${searchInput.val()}`, function (data) {
                //     // store data in cache object
                //     searchResults[searchTerm] = data;

                //     // render the data on the page
                //     render(data);

                //     // store entire searchResults object in cache localStorage
                //     localStorage.setItem('cache', JSON.stringify(searchResults))
                // })
            }
        }, 350)
    }

    let clear = $('<button id=clear>Clear Cache</button>');

    $(clear).on('click', clearCache);

    function clearCache() {
        $("#search").val("");
        searchResults = {};
        localStorage.removeItem('cache');
    }

    container.prepend(clear);

    function renderCities() {
        let cities = ['Atlanta', 'Baltimore', 'Chicago', 'Minneapolis', 'New York', 'Seattle', 'Shanghai'];
        let ul = $("<ul>");

        cities.forEach(city => {
            let li = $('<li>');
            li.text(city);
            li.attr('style', 'list-style-type: none;cursor:pointer;padding:10px;box-shadow:2px 2px lightgrey;float:left;')

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
            let div = $('<div class=col>');
            div.attr('style', 'background:lightblue;')
            console.log(data);

            console.log(data.list[i]);

            // day - description icon - temp F - humidity
            let day = $('<div>');
            let icon = $('<img>');
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

    function render(data) {
        $("#resultDisplay").text(data.name);
        let ul = $('<ul>');
        for (let i = 0; i < 5; i++) {
            let li = $('<li>');
            switch (i) {
                case (0):
                    li.text(`Humidity: ${data.main.humidity}%`);
                    break;
                case (1):

                    li.text(`Weather: ${data.weather[0].main}`);
                    break;

                case (2):

                    li.text(`Detail: ${data.weather[0].description}`);
                    break;

                case (3):

                    li.text(`Temperature: ${kToF(data.main.temp)}°F`);
                    break;

                default:
                    li.text(`Wind: ${data.wind.speed}mph`);
                    break;
            }
            ul.append(li);
        }
        $("#resultDisplay").append(ul);
    }

    function kToF(k) {
        // (27K − 273.15) × 9/5 + 32
        return ((k - 273.15) * (9 / 5) + 32).toFixed();
    }

    renderCities();
});