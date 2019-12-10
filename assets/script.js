$(document).ready(function () {
    // enter code here
    let weatherApiKey = 'c36ac4ee2ac54475c59bef266d011a17';

    const API_URL = 'https://api.openweathermap.org/data/2.5/weather?appid=c36ac4ee2ac54475c59bef266d011a17&q=';
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

    var tOut;
    searchInput.on('keyup', search)

    function search(event) {
        let searchTerm = searchInput.val().toLowerCase()

        if (tOut) clearTimeout(tOut);

        if (!searchInput.val()) return;
        tOut = setTimeout(function () {
            if (searchResults[searchTerm]) {
                console.log('Old request');
                render(searchResults[searchTerm]);
            } else {
                console.log('New request');
                $.get(`${API_URL}${searchInput.val()}`, function (data) {
                    console.log(data);
                    searchResults[searchTerm] = data;
                    console.log("TCL: tOut -> searchResults[searchTerm]", searchResults[searchTerm])

                    render(data);
                    
                    localStorage.setItem('cache', JSON.stringify(searchResults))
                })
            }
        }, 450)
    }

    function renderCities() {
        let cities = ['Atlanta', 'Baltimore', 'Chicago', 'Minneapolis', 'New York', 'Seattle', 'Shanghai'];
        let ul = $("<ul>");

        cities.forEach(city => {
            let li = $('<li>');
            li.text(city);
            li.attr('style', 'list-style-type: none;cursor:pointer;padding:10px;box-shadow:2px 2px lightgrey;float:left;')

            li.on('click', function() {
                searchInput.val(city);
                search();
            });
            ul.append(li);
        });

        col4.append(ul);
    }

    function render(data) {
        $("#resultDisplay").text(data.name);
        let ul = $('<ul>');
        for (let i = 0; i < 5; i++) {
            let li = $('<li>');
            switch (i) {
                case (0):
                    li.text(`Humidity: ${data.main.humidity}`);
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
                    li.text(`Wind: ${data.wind.speed}`);
                    break;
            }
            ul.append(li);
        }
        $("#resultDisplay").append(ul);
    }

    function kToF(k) {
        // (27K − 273.15) × 9/5 + 32
        return ((k - 273.15) * (9/5) + 32).toFixed();
    }

    renderCities();
});