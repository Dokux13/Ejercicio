console.log("Script actualizado");

// Crear mapa
var map = L.map('map', {
    center: [-44.3682743,-74.4359215],
    zoom: 13,
    zoomControl: false
});


// Capas base
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 5,
    maxZoom: 14
}).addTo(map);


var Esri_WorldImagery = L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
        attribution: 'Tiles &copy; Esri'
    }
);


var baseLayers = {
    'osm': osm,
    'esri': Esri_WorldImagery
};


L.control.layers(baseLayers).addTo(map);


// Controles del mapa
L.control.zoom({
    position: 'topleft',
    zoomInText: '+',
    zoomOutText: '-',
    zoomInTitle: 'Acercar',
    zoomOutTitle: 'Alejar'
}).addTo(map);


L.control.scale({
    maxWidth: 200,
    metric: true,
    imperial: true,
    position: 'bottomleft'
}).addTo(map);



// Cargar GeoJSON
fetch('data/puntos.geojson')
.then(response => response.json())
.then(data => {

    const puntosLayer = L.geoJSON(data, {

       pointToLayer: function(feature, latlng) {

    let biomasa = Number(feature.properties.Total_biom) || 100;

    let radio = Math.sqrt(biomasa) / 15;


    return L.circleMarker(latlng, {

        radius: radio,
        color: '#e1e0ec',
        weight: 2,
        fillColor: '#F05100',
        fillOpacity: 1

    });

},

        onEachFeature: function(feature, layer) {

            let contenido = `
                <table class="popup-table">
            `;


            for (let campo in feature.properties) {

                contenido += `
                    <tr>
                        <td><b>${campo}</b></td>
                        <td>${feature.properties[campo]}</td>
                    </tr>
                `;

            }


            contenido += `
                </table>
            `;


            layer.bindPopup(contenido);

        }

    });
var legend = L.control({
    position: 'bottomright'
});


legend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend');

    div.innerHTML += '<h4>Biomasa</h4>';

    var valores = [
        {valor: 100, texto: '100 ton'},
        {valor: 500, texto: '500 ton'},
        {valor: 1000, texto: '1000 ton'}
    ];


    valores.forEach(function(item) {

        var radio = Math.sqrt(item.valor) / 15;


        div.innerHTML +=
        '<div class="legend-item">' +

            '<span style="' +
            'display:inline-block;' +
            'width:' + radio * 2 + 'px;' +
            'height:' + radio * 2 + 'px;' +
            'background:#F05100;' +
            'border:2px solid #e1e0ec;' +
            'border-radius:50%;' +
            'margin-right:10px;' +
            'vertical-align:middle;">' +

            '</span>' +

            item.texto +

        '</div>';

    });


    return div;
};


legend.addTo(map);

    // Agregar puntos al mapa
    puntosLayer.addTo(map);


    // Ajustar vista
    map.fitBounds(puntosLayer.getBounds());


})
.catch(error => {

    console.error(
        "Error al cargar el GeoJSON:",
        error
    );

});
