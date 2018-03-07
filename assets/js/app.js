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
        LIMIT 500`,
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
                            <h3 class="year">${year}</h3>
                            <p>${streetName}</p>
                        </div>
                    </div>
                </div>`
    },
    renderStreets: function () {

        this.streets.forEach((item) => {

            map.lines.push({
                geoJSON: Terraformer.WKT.parse(item.wkt.value),
                year: item.date.value
            });

            let html = this.createTemplate(item.date.value, item.label.value);
            document.querySelector(".streets").insertAdjacentHTML('beforeend', html);
        });

        map.filterLines();
        // map.addLines();
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
    filteredLines: [],
    geoJSONlayer: null,
    filterLines: function () {
        this.lines = this.lines.filter(function (item) {
            if (item.geoJSON.type !== "Point") {
                return item
            }
        });
    },
    addLines: function () {

        this.filteredLines.forEach((item) => {
            this.geoJSONlayer = L.geoJSON(item.geoJSON).addTo(this.canvas);
        });

        this.setLineStyle();
    },
    filterLinesByYear: function (year) {
        this.filteredLines = this.lines.filter(function (item) {
            if (item.year < year) {
                return item
            }
        });

        console.log(this.filteredLines)
    },
    setLineStyle: function () {
        L.geoJSON(this.filteredLines, {
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
            minZoom: 0,
            maxZoom: 20,
            ext: 'png'
        }).addTo(this.canvas);
    }
};

const filter = {
    sidebar: document.querySelector("aside"),
    // https://gomakethings.com/detecting-when-a-visitor-has-stopped-scrolling-with-vanilla-javascript/
    checkVisbileYear: function () {
        let visibleParts = [];

        this.sidebar.querySelectorAll(".timeline-part").forEach((element) => {
            if(element.offsetTop <= this.sidebar.scrollTop + window.innerHeight) {
                visibleParts.push(element);
            }
        });

        return visibleParts[visibleParts.length-1].querySelector(".year").innerText;
    },
    init: function () {
        const _this = this;
        let isScrolling = false;

        this.sidebar.addEventListener('scroll', function(event) {
            // Clear our timeout throughout the scroll
            window.clearTimeout( isScrolling );

            // Set a timeout to run after scrolling ends
            isScrolling = setTimeout(function() {

                map.filterLinesByYear(_this.checkVisbileYear());
                map.addLines();

            }, 66);
        });
    }
};

const app = {
    init: function () {
        api.setData();
        map.init();
        filter.init();
    }
};

app.init();