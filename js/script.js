console.log("Script actualizado");
//var map = L.map('map').setView([-16.495612, -68.133554], 13);
var map = L.map('map',{
    center: [-34.1688115,-70.7300904],
    zoom:13,
   
    zoomControl: false
})

// Añadimos dos capas de teselas para poder cambiar entre ellas
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: 5,
    maxZoom:14,
}).addTo(map);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var baseLayers={
    'osm': osm,
    'esri': Esri_WorldImagery
}
L.control.layers(baseLayers).addTo(map)

L.control.zoom({
    position:'topleft',
    zoomInText:'+',
    zoomOutText:'-',
    zoomInTitle: 'Acercar',
    zoomOutTitle:'Alejar'
}).addTo(map)

L.control.scale({
    maxWidth: 200,         // Ancho máximo
    metric: true,
    imperial:true,
    position:'bottomleft'
}).addTo(map)
L.control.layers(baseLayers).addTo(map);
var cluster = L.markerClusterGroup();
fetch('data/puntos.geojson')
    .then(response => response.json())
    .then(data => {

        const puntosLayer = L.geoJSON(data, {

            pointToLayer: function(feature, latlng) {

                // Obtener el valor del campo Total_biom
                let biomasa = feature.properties.Total_biom;

                // Convertir biomasa en tamaño del círculo
                let radio = Math.sqrt(biomasa) / 10;
				return L.marker(latlng, {
                icon: L.divIcon({
                    className: '',
                    html: `
                        <div style="
                            width:${radio * 2}px;
                            height:${radio * 2}px;
                            background:#F05100;
                            border:2px solid #e1e0ec;
                            border-radius:50%;">
                        </div>
                    `,
                    iconSize: [
                        radio * 2,
                        radio * 2
                    ]
                })
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

                contenido += "</table>";

                layer.bindPopup(contenido);
            }
		});
 cluster.addLayer(puntosLayer);

    map.addLayer(cluster);


    map.fitBounds(cluster.getBounds());


})
          
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

    valores.forEach(function(item){

        var radio = Math.sqrt(item.valor) / 5;

        div.innerHTML +=
        '<div class="legend-item">' +
            '<span style="' +
            'display:inline-block;' +
            'width:' + radio*2 + 'px;' +
            'height:' + radio*2 + 'px;' +
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
})
    .catch(error => {
        console.error("Error al cargar el GeoJSON:", error);
    });


