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
        
        ORDER BY ?date
        LIMIT 100`,
    queryUrl: function () {
        return 'https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=' + encodeURIComponent(this.sparqlQuery) + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on'
    },
    setData: function (dataObj) {
        fetch(this.queryUrl())
            // transform the data into json
            .then((resp) => resp.json())
            .then(function(data) {
                dataObj = data.results.bindings;
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
    render: function () {
        console.log('render');
    }
};

const app = {
    init: function () {
        api.setData(content.streets);
    }
};

app.init();