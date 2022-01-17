"use strict";

var dawautil= require('dawa-util')
  , URLSearchParams = require('url-search-params')  
  , dawaois= require('./dawa-ois-koder.js');

proj4.defs([
  [
    'EPSG:4326',
    '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
  [
      'EPSG:25832',
      '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs'
  ]
]);

var maxBounds= [
  [58.4744, 17.5575],
  [53.015, 2.47833]
];

exports.maxBounds= maxBounds;

exports.beregnCenter= function() {
  var x= (maxBounds[0][0]-maxBounds[1][0])/2+maxBounds[1][0]+0.5,
      y= (maxBounds[0][1]-maxBounds[1][1])/2+maxBounds[1][1];
  return L.latLng(x,y);
};

var token = 'd902ac31b1c3ff2d3e7f6aa7073c6c67';

exports.viskort = function(id,token,options) {
	var crs = new L.Proj.CRS('EPSG:25832',
    '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs', 
    {
        resolutions: [1638.4, 819.2, 409.6, 204.8, 102.4, 51.2, 25.6, 12.8, 6.4, 3.2, 1.6, 0.8, 0.4, 0.2, 0.1]
    }
  );

  if (typeof options === 'undefined') {
    options= {};
  }
  options.crs= crs;
  options.minZoom= 2;
  options.maxZoom= 14;
  options.maxBounds= maxBounds;

  var map = new L.Map(id, options);

  function danKort(service,layer,styles,transparent) {
		return L.tileLayer.wms('https://api.dataforsyningen.dk/' + service, 
			{
				format: 'image/png',
				maxZoom: 14,
				minZoom: 2,
				token: token,
				servicename: service,
	  		attribution: 'Data</a> fra <a href="https://dawadocs.dataforsyningen.dk">DAWA</a> | Map data &copy;  <a href="http://sdfe.dk">SDFE</a>',
	  		layers: layer,
	  		styles: styles,
	  		transparent: transparent,
	  		tiled: false
	 		}
 		);
	}

 	var skaermkort= danKort('topo_skaermkort', 'dtk_skaermkort', 'default', false)
    , skaermkortdaempet= danKort('topo_skaermkort', 'dtk_skaermkort_daempet', 'default', false)
    //, skaermkortgraa= danKort('topo_skaermkort', 'dtk_skaermkort_graa', 'default', false)
 		, ortofoto= danKort('orto_foraar', 'orto_foraar', 'default', false)
 	//	, quickortofoto= danKort('orto_foraar_temp', 'quickorto_2017_10cm', 'default', false)
    , historisk1842til1899= danKort('topo20_hoeje_maalebordsblade', 'dtk_hoeje_maalebordsblade', 'default', false)
    , historisk1928til1940= danKort('topo20_lave_maalebordsblade', 'dtk_lave_maalebordsblade', 'default', false)
 		, matrikelkort= danKort('mat', 'Centroide,MatrikelSkel,OptagetVej','sorte_centroider,sorte_skel,default','true')
 		, postnrkort= danKort('dagi', 'postdistrikt', 'default','true')
 		, kommunekort= danKort('dagi', 'kommune', 'default','true');

  var adressekort = L.tileLayer.wms('https://kort.aws.dk/geoserver/aws4_wms/wms', {
      transparent: true,
      layers: 'adgangsadresser',
      format: 'image/png',
      continuousWorld: true
    });
  var vejpunktkort = L.tileLayer.wms('https://kort.aws.dk/geoserver/aws4_wms/wms', {
      transparent: true,
      layers: 'vejpunkter',
      format: 'image/png',
      continuousWorld: true
    });
  var vejpunktlinjekort = L.tileLayer.wms('https://kort.aws.dk/geoserver/aws4_wms/wms', {
      transparent: true,
      layers: 'vejpunktlinjer',
      format: 'image/png',
      continuousWorld: true
    }); 
  var vejnavnelinjer = L.tileLayer.wms('https://kort.aws.dk/geoserver/aws4_wms/wms', {
      transparent: true,
      layers: 'vejnavnelinjer',
      format: 'image/png',
      continuousWorld: true
    });
  var vejnavneomraader = L.tileLayer.wms('https://kort.aws.dk/geoserver/aws4_wms/wms', {
      transparent: true,
      layers: 'vejnavneomraader',
      format: 'image/png',
      continuousWorld: true
    });
  var vejtilslutningspunkter = L.tileLayer.wms('https://kort.aws.dk/geoserver/aws4_wms/wms', {
      transparent: true,
      layers: 'vejtilslutningspunkter',
      format: 'image/png',
      continuousWorld: true
    });

 	 var baselayers = {
    "Skærmkort": skaermkort,
    "Skærmkort - dæmpet": skaermkortdaempet,
   // "Skærmkort - gråt": skaermkortgraa,
    "Ortofoto": ortofoto,
   // "Quick ortofoto": quickortofoto,
    "Historisk 1842-1899": historisk1842til1899,
    "Historisk 1928-1940": historisk1928til1940
  };

  var overlays = {
   	"Matrikler": matrikelkort,
   	"Kommuner": kommunekort,
   	"Postnumre": postnrkort,
    "Adresser": adressekort,
    "Vejpunkter": vejpunktkort,
    "Vejpunktlinjer": vejpunktlinjekort,
    "Vejnavnelinjer": vejnavnelinjer,
    "Vejnavneområder": vejnavneomraader,
    "Vejtilslutningspunkter": vejtilslutningspunkter
  };


  if (typeof options.baselayer === 'undefined') {
    options.baselayer= "Skærmkort";
  }
  baselayers[options.baselayer].addTo(map);


  L.control.layers(baselayers, overlays, {position: 'bottomleft'}).addTo(map);

  map.on('baselayerchange', function (e) {
    if (e.name === 'Skærmkort' ||
    		e.name === "Skærmkort - dæmpet" ||
        e.name === "Historisk 1842-1899"||
        e.name === "Historisk 1928-1940") {
        matrikelkort.setParams({
            styles: 'sorte_centroider,sorte_skel,default'
        });
        postnrkort.setParams({
            styles: 'default'
        });
        kommunekort.setParams({
            styles: 'default'
        });
    } else if (e.name === 'Flyfoto') {
        matrikelkort.setParams({
            styles: 'gule_centroider,gule_skel,Gul_OptagetVej,default'
        });
        postnrkort.setParams({
            styles: 'yellow'
        });
        kommunekort.setParams({
            styles: 'yellow'
        });
    }
  });

	map.fitBounds(maxBounds);

	return map;
};

exports.etrs89towgs84= function(x,y) {
	  return proj4('EPSG:25832','EPSG:4326', {x:x, y:y});  
};

exports.geojsontowgs84= function(geojson) {
  return L.Proj.geoJson(geojson);
};


exports.nærmesteAdgangsadresse= function(getMap) {
  return function(e) {
    fetch(dawautil.danUrl("https://api.dataforsyningen.dk/adgangsadresser/reverse",{x: e.latlng.lng, y: e.latlng.lat, medtagugyldige: true}))
    .catch(function (error) {
      alert(error.message);
    })
    .then(function(response) {
      if (response.status >=400 && response.status <= 499) {
        response.json().then(function (object) {
          alert(object.type + ': ' + object.title);
        });
      }
      else if (response.status >= 200 && response.status <=299 ){
        return response.json();
      }
    }) 
    .then( function ( adgangsadresse ) { 

      var x= adgangsadresse.adgangspunkt.koordinater[1]
        , y= adgangsadresse.adgangspunkt.koordinater[0];
      var marker= L.circleMarker(L.latLng(x, y), {color: 'red', fillColor: 'red', stroke: true, fillOpacity: 1.0, radius: 4, weight: 2, opacity: 1.0}).addTo(getMap());//defaultpointstyle);
      var popup= marker.bindPopup(L.popup().setContent("<a href='https://info.dataforsyningen.dk/adgangsadresser?id="+adgangsadresse.id+"'>" + dawautil.formatAdgangsadresse(adgangsadresse) + "</a>"),{autoPan: true});
      if (adgangsadresse.vejpunkt) {
        var vx= adgangsadresse.vejpunkt.koordinater[1]
          , vy= adgangsadresse.vejpunkt.koordinater[0];
        var vpmarker= L.circleMarker(L.latLng(vx, vy), {color: 'blue', fillColor: 'blue', stroke: true, fillOpacity: 1.0, radius: 4, weight: 2, opacity: 1.0}).addTo(getMap());//defaultpointstyle);
        vpmarker.bindPopup(L.popup().setContent("<a href='https://info.dataforsyningen.dk/adgangsadresser?id="+adgangsadresse.id+"'>" + dawautil.formatAdgangsadresse(adgangsadresse) + "</a>"),{autoPan: true});
      }

      getMap().setView(L.latLng(x, y),12);
      popup.openPopup();

    });
  };
};

exports.nærmesteBygning= function(getMap) {
  return function(e) {
    var params = new URLSearchParams();
    params.set('format','json');
    params.set('x', e.latlng.lng);
    params.set('y', e.latlng.lat);
    params.set('medtagugyldige', true);
    var url= '/oisbygninger?'+params.toString();
    fetch(url)
    .catch(function (error) {
      alert(error.message);
    })
    .then(function(response) {
      if (response.status >=400 && response.status <= 499) {
        response.text().then(function (text) {
          alert(text);
        });
      }
      else if (response.status >= 200 && response.status <=299 ){
        return response.json();
      }
    }) 
    .then( function ( bygninger ) {
      var bygning= bygninger[0];
      var punkt=  L.latLng(bygning.bygningspunkt.koordinater[1], bygning.bygningspunkt.koordinater[0]);
      var marker= L.circleMarker(punkt, {color: 'blue', fillColor: 'blue', stroke: true, fillOpacity: 1.0, radius: 4, weight: 2, opacity: 1.0}).addTo(getMap());//defaultpointstyle);
      var popup= marker.bindPopup(L.popup().setContent("<a href='" + url.replace('dawa','info') + "'>" + dawaois.anvendelseskoder[bygning.BYG_ANVEND_KODE] + " fra " + bygning.OPFOERELSE_AAR + "</a>"),{autoPan: true});
      
      getMap().setView(punkt,12);
      popup.openPopup();
    //  map.fitBounds(geojsonlayer.getBounds());
    });
  };
};

exports.nærmesteVejstykke= function(getMap) {
  return function(e) {
    fetch(dawautil.danUrl("https://api.dataforsyningen.dk/vejstykker/reverse",{format: 'geojson', x: e.latlng.lng, y: e.latlng.lat}))
    .catch(function (error) {
      alert(error.message);
    })
    .then(function(response) {
      if (response.status >=400 && response.status <= 499) {
        response.json().then(function (object) {
          alert(object.type + ': ' + object.title);
        });
      }
      else if (response.status >= 200 && response.status <=299 ){
        return response.json();
      }
    }) 
    .then( function ( vejstykke ) { 
      var layer= L.geoJSON(vejstykke).addTo(getMap());
      var popup= layer.bindPopup("<a href='https://info.dataforsyningen.dk/vejstykker?kode="+vejstykke.properties.kode+"&kommunekode="+vejstykke.properties.kommunekode+"'>" + vejstykke.properties.navn + " (" + vejstykke.properties.kode + ")" + "</a>");
      popup.openPopup();
    });
  };
};

exports.nærmesteNavngivneVej= function(getMap) {
  return function(e) {
    fetch(dawautil.danUrl("https://api.dataforsyningen.dk/navngivneveje",{format: 'geojson', geometri: 'begge', x: e.latlng.lng, y: e.latlng.lat}))
    .catch(function (error) {
      alert(error.message);
    })
    .then(function(response) {
      if (response.status >=400 && response.status <= 499) {
        response.json().then(function (object) {
          alert(object.type + ': ' + object.title);
        });
      }
      else if (response.status >= 200 && response.status <=299 ){
        return response.json();
      }
    }) 
    .then( function ( navngivenveje ) {       
      var navngivenvej= navngivenveje.features[0];
      var layer= L.geoJSON(navngivenvej).addTo(getMap());
      var popup= layer.bindPopup("<a href='https://info.dataforsyningen.dk/navngivneveje?id="+navngivenvej.properties.id+"'>" + navngivenvej.properties.navn + "</a>");
      popup.openPopup();
    });
  };
};

exports.hvor= function(getMap) {
  return function(e) {
    var antal= 0;
    var promises= [];

    // jordstykke
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/jordstykker/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatjordstykke;
    antal++;

    // sogn
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/sogne/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatdata("Sogn", 'sogne');
    antal++;

    // postnummer
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/postnumre/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatpostnummer;
    antal++;

    // kommune
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/kommuner/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatdata("Kommune", 'kommuner');
    antal++;

    // region
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/regioner/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatdata("Region",'regioner');
    antal++;

    // retskreds
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/retskredse/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatdata("Retskreds", 'retskredse');
    antal++;

    // politikreds
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/politikredse/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatdata("Politikreds", 'politikredse');
    antal++;

    // afstemningsområde
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/afstemningsomraader/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatafstemningsområde;
    antal++;

    // opstillingskreds
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/opstillingskredse/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatdata("Opstillingskreds", 'opstillingskredse');
    antal++;

    // storkreds
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/storkredse/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatstorkreds;
    antal++;

    // valglandsdel
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/valglandsdele/reverse",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatvalglandsdel;
    antal++;

    // stednavne
    promises.push(fetch(dawautil.danUrl("https://api.dataforsyningen.dk/stednavne",{x: e.latlng.lng, y: e.latlng.lat})));
    promises[antal].format= formatstednavne;
    antal++;

    Promise.all(promises) 
    .catch(function (error) {
      alert(error.message);
    })
    .then(function(responses) {      
      for (var i= responses.length-1; i>=0; i--) {
        if (responses[i].ok) {
          responses[i]= responses[i].json();
        }
        else {
          responses.splice(i, 1);
          promises.splice(i, 1);
        }
      }
      return Promise.all(responses);
    })
    .then(function(data) {
      if (data.length === 0) return;
      let tekst= '<small><ul>';
      for(let i=0; i<data.length; i++) {
        tekst= tekst + promises[i].format(data[i]);
      } 
      tekst= tekst + "</ul></small>";     
      var punkt=  e.latlng;
      var popup = L.popup()
      .setLatLng(punkt)
      .setContent(tekst)
      .openOn(getMap());
    });
  };
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function formatpostnummer(data) {
  return "<li>Postnummer: <a href='https://info.dataforsyningen.dk/postnumre/"+data.nr+"'>" +  data.nr + " " + data.navn + "</a></li>";
}

function formatafstemningsområde(data) {
  return "<li>Afstemningsområde: <a href='https://info.dataforsyningen.dk/afstemningsomraader/"+data.kommune.kode+"/"+data.nummer+"'>" + data.navn + " (" +data.nummer + ")" + "</a></li>";
}

function formatstorkreds(data) {
  return "<li>Storkreds: <a href='https://info.dataforsyningen.dk/storkredse/"+data.nummer+"'>" + data.navn + " (" + data.nummer + ")" + "</a></li>";
}

function formatvalglandsdel(data) {
  return "<li>Valglandsdel: <a href='https://info.dataforsyningen.dk/valglandsdele/"+data.bogstav+"'>" + data.navn + " (" + data.bogstav + ")" + "</a></li>";
}

function formatjordstykke(data) {
  return "<li>Jordstykke: <a href='https://info.dataforsyningen.dk/jordstykker/"+data.ejerlav.kode+"/"+data.matrikelnr+"'>" + (data.ejerlav.navn?data.ejerlav.navn+" ":"") + data.ejerlav.kode + " " +data.matrikelnr + "</a></li>";
}

function formatstednavne(data) {
  let tekst= '';
  for (var i= 0; i<data.length;i++) {
    tekst= tekst + "<li>" + capitalizeFirstLetter(data[i].undertype)+": <a href='https://info.dataforsyningen.dk/stednavne/"+data[i].id+"'>" + data[i].navn + "</a></li>";
  }
  return tekst;
}

function formatdata(titel,id) {
  return function (data) { return "<li>" + titel + ": <a href='https://info.dataforsyningen.dk/"+id+"/"+data.kode+"'>" + data.navn + " (" + data.kode + ")" + "</a></li>";};
}
