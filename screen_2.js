var width = 960,
height = 600

var formatDateIntoMonth = d3.timeFormat("%B");
var formatDate = d3.timeFormat("%d %b %Y");
var parseDate = d3.timeParse("%m/%d/%y");
var formatSeconds = d3.timeFormat(".%L");

var startDate = new Date("2019-01-02"),
    endDate = new Date("2020-01-01");

var playButton = d3.select("#play-button");

//This is to make the slider work better
var svg = d3.select("#vis").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')
    .attr("transform", "translate(" + 30 + "," + height/10 + ")");;

//----------MAP---------//
//Modified data vars
var actual_zips = [];
var zipcodes = [];
var actual_zips = [];

//Actual data vars
var zip_tsv;
var police_brut_data = [];

//Projection vars
var projection = d3.geoAlbersUsa();
var path = d3.geoPath().projection(projection);

//Map coloring
var color = d3.scaleLinear().domain([1,50])
  .range(["white", "red"])

init();
var temp = 0
function init() {
    d3.csv("police_brut.csv").then(function(data) {
        for(var i = 0; i < data.length; i++){
            //To make sure only 2019 results show up from data - Pre-filtered before hand.
            if((data[i].date.includes('/19')===false)){
                continue;
            }
            if((data[i].date.includes('/19/')===true) && temp > 50){
                continue;
            }
            temp++;
            police_brut_data.unshift(data[i]);
        }

        d3.tsv("zipcodes.tsv").then(function(zip) {
            zip_tsv = zip;
            //(zip.length);
        });
        //console.log(police_brut_data);
    });
    //Old code
    /*d3.json("us.json").then(function(us) {
        svg.append("path")
            .attr("class", "states")
            .datum(topojson.feature(us, us.objects.states))
            .attr("d", path);    
    });*/
    //New Attempt at map code
    d3.json("us-states.json").then(function(json) {
        d3.csv("kill_state.csv").then(function(data) {

            for (var i = 0; i < data.length; i++) {
                var dataState = data[i].State;
                var dataValue = data[i].black_victms;
                for (var j = 0; j < json.features.length; j++)  {
                    var jsonState = json.features[j].properties.name;            
                    if (dataState == jsonState) {
                        dataValue = dataValue.replace('%', ''); 
                        json.features[j].properties.victms = dataValue; 
                        break;
                    }
                }
            }

            svg.selectAll("path")
                .data(json.features)
                .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "states")
                .style("stroke", "black")
                .style("fill", function(d, i){
                    var value = d.properties.victms;
                    if(value === '0'){
                        return "rgb(213,222,217)";
                    }
                    if (value) {
                        //If value exists…
                        return color(value);
                    } else {
                        //If value is undefined…
                        return "rgb(213,222,217)";
                    }
                });

            //----------LEGEND CODE---------//
            var color1 = d3.scaleLinear().domain([1,5]).range(["white", "red"])
            var legendText = ["10%", "20%", "30%", "40%", "50%"];
            var legend = svg.append("g")
                    .attr("id", "legend");

            var legenditem = legend.selectAll(".legenditem")
                .data(d3.range(5))
                .enter()
                .append("g")
                    .attr("class", "legenditem")
                    .attr("transform", function(d, i) { return "translate(" + i * 41 + ",0)"; })


            legenditem.append("rect")
                .attr("x", width - 250)
                .attr("y", -7)
                .attr("width", 40)
                .attr("height", 6)
                .attr("class", "rect")
                .style("fill", 
                    function(d, i) {
                        console.log(color1(i+1)); 
                        return color1(i+1);
                    });

            legenditem.append("text")
                .attr("x", width - 240)
                .attr("y", -10)
                .style("text-anchor", "right")
                .style("fill", "white")
                .text(function(d, i) { return legendText[i]; });
                });
    });
}
