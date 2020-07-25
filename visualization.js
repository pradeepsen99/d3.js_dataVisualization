var width = 1000,
height = 1000;

var formatDateIntoMonth = d3.timeFormat("%B");
var formatDate = d3.timeFormat("%b %Y");
var parseDate = d3.timeParse("%m/%d/%y");
var formatSeconds = d3.timeFormat(".%L");

var startDate = new Date("2019-01-01"),
    endDate = new Date("2020-01-01");

var playButton = d3.select("#play-button");

//This is to make the slider work better
var svg = d3.select("#vis").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append('g')
    .attr("transform", "translate(" + 30 + "," + height/10 + ")");;

//--------SLIDER--------//
var moving = false;
var currentValue = 0;
var targetValue = width-50;

var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, targetValue])
    .clamp(true);

var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + 10 + "," +-50 + ")");

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
          update_slider(x.invert(currentValue)); 
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
    .text(function(d) { return formatDateIntoMonth(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")


//----------MAP---------//
//Modified data vars
var actual_zips = [];
var zipcodes = [];
var actual_zips = [];

//Actual data vars
var zip_tsv;
var police_brut_data = [];

init();
async function init() {
    d3.csv("police_brut.csv",function(data) {
        for(var i = 0; i < data.length; i++){
            //To make sure only 2019 results show up from data - Pre-filtered before hand.
            if((data[i].date.includes('/19')===false)){
                continue;
            }
            police_brut_data.unshift(data[i]);
        }

        d3.tsv("zipcodes.tsv", function(error, zip) {
            zip_tsv = zip;
        });
    });
}




var projection = d3.geoAlbersUsa();
var path = d3.geoPath()
    .projection(projection);

d3.json("us.json", function(error, us) {
    svg.append("path")
        .attr("class", "states")
        .datum(topojson.feature(us, us.objects.states))
        .attr("d", path);    
});

playButton.on("click", function() {
    var button = d3.select(this);
    if (button.text() == "Pause") {
        moving = false;
        clearInterval(timer);
        // timer = 0;
        button.text("Play");
    } else {
        moving = true;
        timer = setInterval(step, 1000);
        button.text("Pause");
    }
    console.log("Slider moving: " + moving);
})

function step() {
    drawNodes(x.invert(currentValue));
    currentValue = currentValue + (targetValue/20);
    if (currentValue > targetValue) {
        moving = false;
        currentValue = 0;
        clearInterval(timer);
        // timer = 0;
        playButton.text("Play");
        console.log("Slider moving: " + moving);
    }
}

//This is to get the data in from csv/tsv files

function update_slider(date) {
    // update position and text of label according to slider scale
    handle.attr("cx", x(date));
    label
      .attr("x", x(date))
      .text(formatDate(date));

    actual_zips = [];
    zipcodes = [];
    actual_zips = [];
    console.log(date);
    var daysFromInput = d3.timeDay.count(date, endDate);
    //console.log(parseDate(police_brut_data[40].date))
    for(var i = 0; i < police_brut_data.length; i++){
        var daysFromCurr = d3.timeDay.count(parseDate(police_brut_data[i].date), endDate );
        if(daysFromCurr < 1){
            continue;
        }
        console.log((police_brut_data[i].date)+ "  " + daysFromCurr + "    " + daysFromInput);
        if((daysFromCurr<daysFromInput)){
            break;
        }
        zipcodes.push(police_brut_data[i].Zipcode)
    }
    for(var i = 0; i < zip_tsv.length; i++){
        if(zipcodes.includes(zip_tsv[i].zip) === true){
            actual_zips.push(zip_tsv[i]);
        }
    }

    svg.selectAll("circle")
        .data(actual_zips)
        .exit()
        .remove()
  
    drawNodes(actual_zips);
  }

function drawNodes(zips){
    //console.log(d3.timeDay.count(date, endDate));


    svg.selectAll(".pin")
        .data(zips)
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
                return 1
                ;
            })
}

