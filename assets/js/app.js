const api = {
    sparqlQuery: `
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX hg: <http://rdf.histograph.io/>
        PREFIX sem: <http://semanticweb.cs.vu.nl/2009/11/sem/>
        PREFIX geo: <http://www.opengis.net/ont/geosparql#>
        
        SELECT ?straat ?label ?date ?wkt WHERE {
          ?straat rdf:type hg:Street .
          ?straat rdfs:label ?label .
          ?straat sem:hasEarliestBeginTimeStamp ?date .
          ?straat geo:hasGeometry ?geo .
          ?geo geo:asWKT ?wkt .
        }
        
        ORDER BY DESC(?date)
        LIMIT 100`,
    queryUrl: function () {
        return 'https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=' + encodeURIComponent(this.sparqlQuery) + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on'
    },
    setData: function () {
        fetch(this.queryUrl())
            // transform the data into json
            .then((resp) => resp.json())
            .then(function(data) {
                content.streets = data.results.bindings;
                content.render();
            })
            .catch(function(error) {
                // if there is any error you will catch them here
                console.log(error);
            });
    }
};

const content = {
    streets: [],
    createTemplate: function (year, streetName) {
        return `<div class="timeline">
                    <div class="timeline-part">
                        <div class="timeline-graph"></div>
                        <div class="timeline-meta">
                            <h3>${year}</h3>
                            <p>${streetName}</p>
                        </div>
                    </div>
                </div>`
    },
    renderStreets: function () {
        this.streets.forEach((item) => {
            let html = this.createTemplate(item.date.value, item.label.value);
            document.querySelector(".streets").insertAdjacentHTML('beforeend', html);
        });
    },
    render: function () {
        this.renderStreets();
    }
};

const map = L.map('map', {
    center: [51.505, -0.09],
    zoom: 13
});

L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: config.mapbox_key
}).addTo(map);

const app = {
    init: function () {
        api.setData();
    }
};

app.init();