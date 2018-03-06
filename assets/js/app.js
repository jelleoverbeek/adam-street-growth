var sparqlquery = `
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
LIMIT 100`;

// more fun dc:types: 'affiche', 'japonstof', 'tegel', 'herenkostuum'
// more fun dc:subjects with Poster.: 'Privacy.', 'Pop music.', 'Music.', 'Squatters movement.'

var encodedquery = encodeURIComponent(sparqlquery);

var queryurl = 'https://api.data.adamlink.nl/datasets/AdamNet/all/services/endpoint/sparql?default-graph-uri=&query=' + encodedquery + '&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on';

fetch(queryurl)
    .then((resp) => resp.json()) // transform the data into json
    .then(function(data) {

        rows = data.results.bindings; // get the results
        imgdiv = document.getElementById('images');
        console.log(rows);

        for (i = 0; i < rows.length; ++i) {

            var img = document.createElement('img');
            img.src = rows[i]['img']['value'];
            img.title = rows[i]['title']['value'];
            imgdiv.appendChild(img);

        }
    })
    .catch(function(error) {
        // if there is any error you will catch them here
        console.log(error);
    });