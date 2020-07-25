var width = 1000,
height = 1000;

var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");

var startDate = new Date("2004-11-01"),
    endDate = new Date("2017-04-01");



//----------MAP---------//
var actual_zips = [];
var zipcodes = [];
init();
async function init() {

    var projection = d3.geoAlbersUsa();
    var path = d3.geoPath()
        .projection(projection);

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append('g')
        .attr("transform", "translate(" + 30 + "," + height/10 + ")");;

    d3.json("us.json", function(error, us) {
        svg.append("path")
            .attr("class", "states")
            .datum(topojson.feature(us, us.objects.states))
            .attr("d", path);    
    });

    var actual_zips = [];
    d3.csv("police_brut.csv",function(data) {
        for(var i = 0; i < data.length; i++){
            if(data[i].date.includes("/20") === false){
                continue;
            }
            zipcodes.push(data[i].Zipcode)
        }
        d3.select("#mySlider").on("change", function(d){
            selectedValue = this.value
            updateChart(selectedValue)
        })
        d3.tsv("zipcodes.tsv", function(error, zip) {
            for(var i = 0; i < zip.length; i++){
                if(zipcodes.includes(zip[i].zip) === true){
                    actual_zips.push(zip[i]);
                }
            }

            svg.selectAll(".pin")
                .data(actual_zips)
                .enter()
                .append("circle")
                    .attr("r", 5)
                    .attr("transform", 
                        function(d) {
                            return "translate(" + projection([
                                d.lon,
                                d.lat
                            ]) + ")";
                    })
                    .attr('fill', 'red')
                    .attr('opacity', function(d){
                        //Added this for the one null element that pops up!
                        if(projection([d.lon,d.lat]) === null){
                            return 0;
                        }
                        return 1;
                    })
        });
    });
    console.log(actual_zips)

}

//--------SLIDER--------//
var moving = false;
var currentValue = 0;
var targetValue = width;

var playButton = d3.select("#play-button");
    
var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, targetValue])
    .clamp(true);

var slider = d3.select('svg').append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + 30 + "," + height/20 + ")");

slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() {
          currentValue = d3.event.x;
          update(x.invert(currentValue)); 
        })
    );

slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
  .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatDateIntoYear(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")
