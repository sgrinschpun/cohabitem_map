//jQuery & Bootstrap 
var $ = require('jquery');
global.jQuery = require('jquery');
window.$ = $;
require('bootstrap');
require('bootstrap-table');

// require leaflet & plugins
var L = require('leaflet');
var esri = require('esri-leaflet');
var geocoding = require('esri-leaflet-geocoder');
require('leaflet-draw');
require('leaflet.locatecontrol');

// since leaflet is bundled into the browserify package it won't be able to detect where the images
// solution is to point it to where you host the the leaflet images yourself
//L.Icon.Default.imagePath = 'http://cdn.leafletjs.com/leaflet-0.7.3/images';
L.Icon.Default.imagePath = 'static/img/';


// require awesome markers
require('drmonty-leaflet-awesome-markers');


//*** Initial Configurations *** 
var config = {
	cartoDBusername : "sgrinschpun",
	cartoDBinsertfunction : "insert_crowd_mapping_data",
	cartoDBtablename : "mappeig_2",
	mapcenter: [41.396904, 2.120389],
	zoom: 15
};


//***  Define icons  ***/
// consider changing to fa, more icons

//from db
var house = L.AwesomeMarkers.icon({
	prefix: 'fa',
    icon: 'home',
    markerColor: 'blue',
    spin: false
});

var apartment = L.AwesomeMarkers.icon({
	prefix: 'fa',
    icon: 'clone',
    markerColor: 'blue',
    spin: false
});

var building = L.AwesomeMarkers.icon({
	prefix: 'fa',
    icon: 'building-o',
    markerColor: 'blue',
    spin: false
});

var solar = L.AwesomeMarkers.icon({
	prefix: 'fa',
    icon: 'square',
    markerColor: 'blue',
    spin: false
});


var add = L.AwesomeMarkers.icon({
	prefix: 'fa',
	icon: 'asterisk',
    markerColor: 'red',
    spin: false
});

//*** Function for animateddragging ***
L.Marker.prototype.animateDragging = function () {
      
      var iconMargin, shadowMargin;
      
      this.on('dragstart', function () {
        if (!iconMargin) {
          iconMargin = parseInt(L.DomUtil.getStyle(this._icon, 'marginTop'));
          shadowMargin = parseInt(L.DomUtil.getStyle(this._shadow, 'marginLeft'));
        }
      
        this._icon.style.marginTop = (iconMargin - 15)  + 'px';
        this._shadow.style.marginLeft = (shadowMargin + 8) + 'px';
      });
      
      return this.on('dragend', function () {
        this._icon.style.marginTop = iconMargin + 'px';
        this._shadow.style.marginLeft = shadowMargin + 'px';
      });
    };


//*** Draw map with data from Carto *** 

// Add Data from CartoDB using the SQL API
// Declare Variables
// Create Global Variable to hold CartoDB points
var cartoDBData = null;


// Write SQL Selection Query to be Used on CartoDB Table
var sqlQuery = "SELECT the_geom, address, address2, catastral, city, comment, email, name, postal, region, type FROM " + config.cartoDBtablename;


// Create Leaflet map object
var map = L.map('map', { center: config.mapcenter, zoom: config.zoom});


//var map = L.map('map').setView([41.396904, 2.120389], 15);

// Add Tile Layer basemap
// Find your own at https://leaflet-extras.github.io/leaflet-providers/preview/
var CartoDB_Positron = L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var OpenStreetMap_DE = L.tileLayer('https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var Esri_WorldStreetMap2 = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

Esri_WorldStreetMap.addTo(map);

//CartoDB_Positron.addTo(map);
//OpenStreetMap_DE.addTo(map)
/*L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);*/



//Leaflet.Locate
var lc = L.control.locate({
    position: 'topright',
    strings: {
        title: "Geolocalitza'm"
    },
    icon: 'fa fa-location-arrow'
}).addTo(map);


//Fetches
var getData = "https://" + config.cartoDBusername + ".cartodb.com/api/v2/sql?format=GeoJSON&q=" + sqlQuery;


function getGeoJSON() {
	$.getJSON(getData, function (data) {
		cartoDBData = L.geoJson(data, {
			pointToLayer: function(feature, latlng) {
				if (feature.properties.type == 'Pis'){
        		return new L.marker(latlng, {icon: apartment});
        		} else if (feature.properties.type == 'Casa'){
        		return new L.marker(latlng, {icon: house})
        		} else if (feature.properties.type == 'Edifici'){
        		return new L.marker(latlng, {icon: building})
        		}  else if (feature.properties.type == 'Solar'){
        		return new L.marker(latlng, {icon: solar})
        		}
    		},
			onEachFeature: function (feature, layer) {
				layer.bindPopup('<strong>' + feature.properties.type + '</strong>  a  ' + unescape(feature.properties.address) 
					+ '<br><br>Afegit per  ' + unescape(feature.properties.name) + '<br><br>' + unescape(feature.properties.comment));

			}
		}).addTo(map);
	});
}



getGeoJSON();


//*** GeoCoding Control + Reverse geocoding from ESRI ****
//https://github.com/Esri/esri-leaflet-browserify-example
//https://esri.github.io/esri-leaflet/examples/geocoding-control.html

var marker;



// add search control
var searchControl = geocoding.geosearch({
	position : 'topleft',
	zoomToResult: true,
	collapseAfterResult: false,
	expanded: true,
	allowMultipleResults: false,
	placeholder: 'Busca Adreces',
	title: 'Cercador d\'Adreces'
	}).addTo(map);

var results = L.layerGroup().addTo(map);

  searchControl.on('results', function(data){
  	if (marker) { // check
    map.removeLayer(marker); // remove
	}
    
    results.clearLayers();
    results.addLayer(L.marker(data.results[0].latlng, {icon: add,draggable: true}).animateDragging()  );
    //console.log(data.results[0]);
    $('#lat').val(data.results[0].latlng.lat);
	$('#lon').val(data.results[0].latlng.lng);
    $('#Address').val(data.results[0].properties.StAddr);
    $('#Postal').val(data.results[0].properties.Postal);
	$('#City').val(data.results[0].properties.City);
	$('#Region').val(data.results[0].properties.Region);
/*    for (var i = data.results.length - 1; i >= 0; i--) {
      results.addLayer(L.marker(data.results[i].latlng));
    }*/
  });

// reverse geocoding
//https://esri.github.io/esri-leaflet/examples/reverse-geocoding.html

var geocodeService = geocoding.geocodeService();

//*** Function for animateddragging ***
L.Marker.prototype.animateDragging = function () {
      
      var iconMargin, shadowMargin;
      
      this.on('dragstart', function () {
        if (!iconMargin) {
          iconMargin = parseInt(L.DomUtil.getStyle(this._icon, 'marginTop'));
          shadowMargin = parseInt(L.DomUtil.getStyle(this._shadow, 'marginLeft'));
        }
      
        this._icon.style.marginTop = (iconMargin - 15)  + 'px';
        this._shadow.style.marginLeft = (shadowMargin + 8) + 'px';
      });
      
      return this.on('dragend', function (e) {
        this._icon.style.marginTop = iconMargin + 'px';
        this._shadow.style.marginLeft = shadowMargin + 'px';
        geocodeService.reverse().latlng(e.target.getLatLng()).run(function(error, result) {
			 $('#lat').val(result.latlng.lat);
			 $('#lon').val(result.latlng.lng);
			 $('#Address').val(result.address.Address);
			 $('#Postal').val(result.address.Postal);
			 $('#City').val(result.address.City);
			 $('#Region').val(result.address.Region);
			map.removeLayer(marker);
		 	marker = L.marker(result.latlng, {icon: add, draggable: true})
	  			.addTo(map)
	  			.bindPopup(result.address.Match_addr)
	  			.openPopup()
	  			.animateDragging();
	});



      });
    };


map.on('click', function(e) {
	if (results) { // check
    	results.clearLayers(); // remove
	}
	if (marker) { // check
    	map.removeLayer(marker); // remove
	}
	geocodeService.reverse().latlng(e.latlng).run(function(error, result) {
		//console.log (result);
		 $('#lat').val(result.latlng.lat);
		 $('#lon').val(result.latlng.lng);
		 $('#Address').val(result.address.Address);
		 $('#Postal').val(result.address.Postal);
		 $('#City').val(result.address.City);
		 $('#Region').val(result.address.Region);
		 marker = L.marker(result.latlng, {icon: add, draggable: true})
		  			.addTo(map)
		  			.bindPopup(result.address.Match_addr)
		  			.openPopup()
		  			.animateDragging();
    });

});


//*** Send data to Carto ****
function setData() {
//Construct the geometry
var the_geom = {"type":"Point","coordinates":[$('#lon').val(),$('#lat').val()]}

//Construct the SQL query to insert data
		sql = "SELECT " + config.cartoDBinsertfunction + "(";
		sql += "'" + JSON.stringify(the_geom) + "'";
		sql += "," + "'" + escape($('#Address').val())+ "'";
		sql += "," + "'" + escape($('#address2').val())+ "'";
		sql += "," + "'" + escape($('#catastral').val())+ "'";
		sql += "," + "'" + escape($('#City').val())+ "'";
		sql += "," + "'" + escape($('#comment').val())+ "'";
		sql += "," + "'" + escape($('#email').val())+ "'";
		sql += "," + "'" + escape($('#name').val())+ "'";
		sql += "," + "'" + escape($('#Postal').val())+ "'";
		sql += "," + "'" + escape($('#Region').val())+ "'";
		sql += "," + "'" + escape($('#type').val())+ "'";
		sql += ");";

		//console.log(sql);

//Sending the data
		$.ajax({
			type: 'POST',
			url: 'https://' + config.cartoDBusername + '.cartodb.com/api/v2/sql',
			crossDomain: true,
			data: {"q": sql},
			dataType: 'json',
			success: function (responseData, textStatus, jqXHR) {
				console.log("Data saved");
					// refresh map
				//console.log('https://' + config.cartoDBusername + '.cartodb.com/api/v2/'+ sql);
				if (cartoDBData) { // check
					cartoDBData.clearLayers(); // remove
				}
				if (results) { // check
					results.clearLayers(); // remove
				}
				if (marker) { // check
					map.removeLayer(marker);// remove
				}

				getGeoJSON();
			},
			error: function (responseData, textStatus, errorThrown) {

				console.log("Problem saving the data");
			}
		});

}

$('#desa').click(function (e) {
	e.preventDefault();
	setData();
});

//////////bootstrap-table