"use strict"

var dawaAutocomplete2 = require('dawa-autocomplete2')
  , dawautil = require('dawa-util');

function selected(map) {
  return function (event) {
    fetch(event.data.href).then( function(response) {
      response.json().then( function ( adgangsadresse ) {
        var x= adgangsadresse.adgangspunkt.koordinater[1]
          , y= adgangsadresse.adgangspunkt.koordinater[0];
        var marker= L.circleMarker(L.latLng(x, y), {color: 'red', fillColor: 'red', stroke: true, fillOpacity: 1.0, radius: 4, weight: 2, opacity: 1.0}).addTo(map);//defaultpointstyle);
        var popup= marker.bindPopup(L.popup().setContent("<a target='_blank' href='https://dawa.aws.dk/adgangsadresser?id="+adgangsadresse.id+"'>" + dawautil.formatAdgangsadresse(adgangsadresse) + "</a>"),{autoPan: true});
        if (adgangsadresse.vejpunkt) {
          var vx= adgangsadresse.vejpunkt.koordinater[1]
            , vy= adgangsadresse.vejpunkt.koordinater[0];
          var vpmarker= L.circleMarker(L.latLng(vx, vy), {color: 'blue', fillColor: 'blue', stroke: true, fillOpacity: 1.0, radius: 4, weight: 2, opacity: 1.0}).addTo(map);//defaultpointstyle);
          vpmarker.bindPopup(L.popup().setContent("<a target='_blank' href='https://dawa.aws.dk/adgangsadresser?id="+adgangsadresse.id+"'>" + dawautil.formatAdgangsadresse(adgangsadresse) + "</a>"),{autoPan: true});
        }
        map.setView(L.latLng(x, y),12);
        popup.openPopup();
      });
    });
  }
}

L.Control.Search = L.Control.extend({
  options: {
    // topright, topleft, bottomleft, bottomright
    position: 'topright',
    placeholder: 'vejnavn husnr, postnr',
    selected: selected
  },
  initialize: function (options /*{ data: {...}  }*/) {
    // constructor
    L.Util.setOptions(this, options);
  },
  onAdd: function (map) {
    // happens after added to map
    var container = L.DomUtil.create('div', '');
    this.form = L.DomUtil.create('form', '', container);
    var group = L.DomUtil.create('div', '', this.form);
    this.input = L.DomUtil.create('input', 'searchbox', group);
    this.input.type = 'search';
    this.input.placeholder = this.options.placeholder;
    dawaAutocomplete2.dawaAutocomplete(this.input, {
        select: this.options.selected(map),        
        adgangsadresserOnly: true
      }
    );
    //this.results = L.DomUtil.create('div', 'list-group', group);
    //L.DomEvent.addListener(this.form, 'submit', this.submit, this);
    L.DomEvent.disableClickPropagation(container);
    return container;
  },
  onRemove: function (map) {
    // when removed
    L.DomEvent.removeListener(form, 'submit', this.submit, this);
  },
  submit: function(e) {
    L.DomEvent.preventDefault(e);
  }
});

exports.search = function(id, options) {
  return new L.Control.Search(id, options);
}