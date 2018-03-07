// ORDER BY DESC(?date)
// ORDER BY ?date

const api = {
    loading: true,
    checkLoading: function () {
        const preloader = document.querySelector(".preloader");

        if(!this.loading) {
            preloader.classList.add("hidden");
        } else {
            preloader.classList.remove("hidden");
        }
    },
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
        
        ORDER BY ?date
        `,
    queryUrl: function () {
        return 'https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=' + encodeURIComponent(this.sparqlQuery) + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on'
    },
    setData: function () {
        fetch(this.queryUrl())
            // transform the data into json
            .then((resp) => resp.json())
            .then((data) => {
                content.streets = data.results.bindings;
                content.render();
                this.loading = false;
                this.checkLoading();
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
            map.lines.push(Terraformer.WKT.parse(item.wkt.value));
            let html = this.createTemplate(item.date.value, item.label.value);
            document.querySelector(".streets").insertAdjacentHTML('beforeend', html);
        });

        map.filterLines();
        map.addLines();
    },
    render: function () {
        this.renderStreets();
    }
};

const map = {
    canvas: "",
    lineStyle: {
        "fillColor": "#FF4343",
        "color": "#FF4343",
        "weight": 3,
    },
    lines: [],
    filterLines: function () {
        this.lines = this.lines.filter(function (item) {
            if (item.type !== "Point") {
                return item
            }
        });
    },
    addLines: function () {
        this.lines.forEach((item) => {
            L.geoJSON(item).addTo(this.canvas);
        });

        this.setLineStyle();
    },
    setLineStyle: function () {
        L.geoJSON(this.lines, {
            style: this.lineStyle
        }).addTo(this.canvas);
    },
    init: function () {
        this.canvas = L.map('map', {
            center: [52.29, 4.91],
            zoom: 12
        });

        let Stamen_TonerLite = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        }).addTo(this.canvas);
    }
}


const app = {
    init: function () {
        api.setData();
        map.init();
    }
};

app.init();