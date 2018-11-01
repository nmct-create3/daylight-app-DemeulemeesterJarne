// _ = helper functions
let _calculateTimeDistance = (startTime, endTime) => {
	// Bereken hoeveel tijd er tussen deze twee periodes is.
	// Tip: werk met minuten.
	let start = new Date('0001-01-01 ' + startTime);
	let end = new Date('0001-01-01 ' + endTime);
	let diff = (end - start) / 60000
	return diff;
}

// Deze functie kan een am/pm tijd omzetten naar een 24u tijdsnotatie, deze krijg je dus al. Alsjeblieft, veel plezier ermee.
let _convertTime = (t) => {
	/* Convert 12 ( am / pm ) naar 24HR */
	let time = new Date('0001-01-01 ' + t);
	let formatted = time.getHours() + ':' + ('0' + time.getMinutes()).slice(-2);
	return formatted;
}

// 5 TODO: maak updateSun functie
function updateSun(sun, procent) {
	sun.style.left = procent * 100 + '%';
	if (procent <= 0.5) {
		sun.style.bottom = procent * 200 + '%';
	} else {
		sun.style.bottom = 100 - (procent * 100) + '%';
	}
}

function updatePage(sun, lbltimeleft, sunriseminutes, totalMinutes) {
	let currenttime = new Date();
	let currenttimeminutes = currenttime.getMinutes() + (60 * currenttime.getHours());
	let timeup = currenttimeminutes - sunriseminutes;
	let procent = timeup / totalMinutes;
	updateSun(sun, procent);
	lbltimeleft.innerHTML = totalMinutes - timeup;
	sun.setAttribute('data-time', currenttime.getHours() + ':' + ('0' + currenttime.getMinutes()).slice(-2));
	if (timeup > totalMinutes) {
		document.querySelector('html').classList.add('is-night');
	}
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	// Bepaal het aantal minuten dat de zon al op is.
	let lbltimeleft = document.querySelector('.js-time-left');
	let sun = document.querySelector('.js-sun');
	let currenttime = new Date();
	let sunrisetime = new Date('0001-01-01 ' + sunrise);
	let currenttimeminutes = currenttime.getMinutes() + (60 * currenttime.getHours());
	let sunriseminutes = sunrisetime.getMinutes() + (60 * sunrisetime.getHours())
	let timeup = currenttimeminutes - sunriseminutes;

	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	// Vergeet niet om het resterende aantal minuten in te vullen.
	let procent = timeup / totalMinutes;
	updateSun(sun, procent);
	lbltimeleft.innerHTML = totalMinutes - timeup;
	sun.setAttribute('data-time', currenttime.getHours() + ':' + ('0' + currenttime.getMinutes()).slice(-2));

	document.querySelector('body').classList.add('is-loaded');

	// Nu maken we een functie die de zon elke minuut zal updaten
	// Bekijk of de zon niet nog onder of reeds onder is
	if (timeup > totalMinutes) {
		document.querySelector('html').classList.add('is-night');
	}

	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
	setInterval(function () { updatePage(sun, lbltimeleft, sunriseminutes, totalMinutes) }, 60000);
}

// 3 Met de data van de API kunnen we de app opvullen
let showResult = (queryResponse) => {
	// We gaan eerst een paar onderdelen opvullen
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	let results = queryResponse.query.results.channel;
	let city = results.location.city;
	let country = results.location.country;
	let sunrise = results.astronomy.sunrise;
	let sunset = results.astronomy.sunset;

	let lbllocation = document.querySelector('.js-location');
	let lblsunrise = document.querySelector('.js-sunrise');
	let lblsunset = document.querySelector('.js-sunset');

	lbllocation.innerHTML = city + ' ' + country;
	lblsunrise.innerHTML = _convertTime(sunrise);
	lblsunset.innerHTML = _convertTime(sunset);

	// Hier gaan we een functie oproepen die de zon een bepaalde postie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	placeSunAndStartMoving(_calculateTimeDistance(sunrise, sunset), sunrise);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = (lat, lon) => {
	// Eerst bouwen we onze url op
	// en doen we een query met de Yahoo query language
	let query = 'select astronomy,location from weather.forecast where woeid in (SELECT woeid FROM geo.places WHERE text="(' + lat + ',' + lon + ')")';
	let url = 'https://query.yahooapis.com/v1/public/yql?q=' + query + '&format=json';

	// Met de fetch API- proberen we de data op te halen.
	fetch(url)
		.then(data => data.json())
		.then(json => showResult(json))
		.catch(error => console.error(error));
}

function getPosition(pos) {
	getAPI(pos.coords.latitude, pos.coords.longitude);
}

document.addEventListener('DOMContentLoaded', function () {
	// 1 We will query the API with longitude and latitude.
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getPosition);
	} else {
		alert("Geolocation is not supported by this browser.");
	}
});
