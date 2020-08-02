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
    .attr("transform", "translate(" + 10 + "," + -20 + ")");

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
    .style("fill", "white")
    .text(function(d) { return formatDateIntoMonth(d); });

var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

var label = slider.append("text")  
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .style("fill", "white")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")
    .attr("color", "white")


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
            if(((data[i].Race.includes('White'))===true)){
                temp++;
                police_brut_data.unshift(data[i]);
                continue;
            }
            if((data[i].Race.includes('Black'))===true){
                temp++;
                police_brut_data.unshift(data[i]);
                continue;
            }
            //temp++;
            //police_brut_data.unshift(data[i]);
        }

        d3.tsv("zipcodes.tsv").then(function(zip) {
            zip_tsv = zip;
            //(zip.length);
        });
        //console.log(police_brut_data);
        move_slider();
    });
    //Old code
    /*d3.json("us.json").then(function(us) {
        svg.append("path")
            .attr("class", "states")
            .datum(topojson.feature(us, us.objects.states))
            .attr("d", path);    
    });*/
    //New Attempt at map code
    console.log("HI");
    d3.json("us-states.json").then(function(json) {
        console.log("HI");
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("class", "states")
    });
    console.log("HI")

    //----------LEGEND CODE---------//
    var color1 = d3.scaleLinear().domain([1,2]).range(["red", "yellow"])
    var legendText = ["Black", "White"];
    var legend = svg.append("g")
            .attr("id", "legend");

    var legenditem = legend.selectAll(".legenditem")
        .data(d3.range(2))
        .enter()
        .append("g")
            .attr("class", "legenditem")
            .attr("transform", function(d, i) { return "translate(" + i * 41 + ",65)"; })



    legenditem.append("rect")
        .attr("x", width - 280)
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
        .attr("x", width - 275)
        .attr("y", -10)
        .style("text-anchor", "right")
        .style("font-size", "13px")
        .style("font-weight","400")
        .style("fill", "white")
        .text(function(d, i) { return legendText[i]; });
}




function move_slider() {
    moving = true;
    timer = setInterval(step, 1000);
    console.log("Slider moving: " + moving);
}

function step() {
    update_slider(x.invert(currentValue));
    currentValue = currentValue + (targetValue/90);
    if (currentValue > targetValue) {
        moving = false;
        currentValue = 0;
        clearInterval(timer);
        // timer = 0;
        console.log("Slider moving: " + moving);
    }
}

//This is to get the data in from csv/tsv files

var currentVictm;
function update_slider(date) {
    // update position and text of label according to slider scale
    handle.attr("cx", x(date));
    label
      .attr("x", x(date))
      .text(formatDate(date));

    actual_zips = [];
    zipcodes = [];
    actual_zips = [];
    //console.log(date);
    var daysFromInput = d3.timeDay.count(date, endDate);
    //console.log(parseDate(police_brut_data[40].date))
    for(var i = 0; i < police_brut_data.length; i++){
        var daysFromCurr = d3.timeDay.count(parseDate(police_brut_data[i].date), endDate );
        if(daysFromCurr < 1){
            continue;
        }
        //console.log((police_brut_data[i].date)+ "  " + daysFromCurr + "    " + daysFromInput);
        if((daysFromCurr<daysFromInput)){
            break;
        }
        currentVictm = police_brut_data[i];
        zipcodes.push(police_brut_data[i].Zipcode)
    }
    for(var i = 0; i < zipcodes.length; i++){
        var curr = zip_tsv[zip_tsv.findIndex(x => x.zip === zipcodes[i])]
        //console.log(curr);
        if(curr == undefined){
            continue;
        }
        actual_zips.push(curr);
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
            .attr("r", 4)
            .attr("transform", 
                function(d) {
                    return "translate(" + projection([
                        d.lon,
                        d.lat
                    ]) + ")";
            })
            .attr('fill', function(d, i){
                if(police_brut_data[i].Race === "White"){
                    return "yellow";
                }
                if(police_brut_data[i].Race === "Black"){
                    return "red";
                }
                return "black";
            })
            .attr('opacity', function(d){
                //Added this for the one null element that pops up!
                if(projection([d.lon,d.lat]) === null){
                    return 0;
                }
                return 1
                ;
            })
            .on("mouseover", mouseover )
            .on("mousemove", mousemove )
            .on("mouseleave", mouseleave )
}

var timer1 = setInterval(test, 1000);
var counter = 0;
function test(){
    tooltip
      .style("opacity", 1)
    var name = "<p style='font-size:20px'><u>" + police_brut_data[counter].Name + "</u></p>\n";
    var age = "<p style='font-size:15px'> Age: " + police_brut_data[counter].Age + "</p>\n";
    var address = "<p style='font-size:15px'>Address of death: " + police_brut_data[counter].Address + "</p>\n";
    var cause_death = "<p style='font-size:15px'> Cause of death: " + police_brut_data[counter].cause_death + "</p>\n";
    var race = "<p style='font-size:15px'> Race: " + police_brut_data[counter].Race + "</p>\n";
    var url_img = "<img src='" + police_brut_data[counter].url_image + "'onload='javascript:(function(o){o.style.height=o.contentWindow.document.body.scrollHeight+'px';}(this));' style='height:200px;width:200px;border:none;overflow:hidden;'/>";
    if(police_brut_data[counter].url_image===""){
        url_img = "<p style='font-size:15px'>**IMG Unavalable**</p>\n";
    }
    console.log(race)
    tooltip
      .html(name + age + address + cause_death + race + url_img);
    counter++;
}

//----------VICTIM INFO---------//
var tooltip = d3.select("#vis")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "black")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "25px")
    .style("float","left")
    .style("position", "relative")
    .style("display", "inline-block")
    .style("margin-left", "70px;")
    .style("opacity", 1)
    

tooltip.html("")

var mouseover = function(d) {
    //console.log("mouseover");
    tooltip.style("opacity", 1)
    clearInterval(timer1);
}

var mousemove = function(d, i) {
    var name = "<p style='font-size:20px;text-align:center;'>" + police_brut_data[i].Name + "</p>\n";
    var age = "<p style='font-size:15px'> Age: " + police_brut_data[i].Age + "</p>\n";
    var address = "<p style='font-size:20px'>Address of death: " + police_brut_data[i].Address + "</p>\n";
    var cause_death = "<p style='font-size:20px'> Cause of death: " + police_brut_data[i].cause_death + "</p>\n";
    var race = "<p style='font-size:15px'> Race: " + police_brut_data[i].Race + "</p>\n";
    var url_img = "<img src='" + police_brut_data[i].url_image + "'onload='javascript:(function(o){o.style.height=o.contentWindow.document.body.scrollHeight+'px';}(this));' style='height:200px;width:200px;border:none;overflow:hidden;'/>";
    if(police_brut_data[i].url_image===""){
        url_img = "IMG Unavil";
    }
    tooltip
        .html(name + age + address + cause_death + race + url_img)
        //.attr("x", (d3.mouse(this)[0]+90) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
        //.attr("y", (d3.mouse(this)[1]) + "px")
}

// A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
var mouseleave = function(d) {
    //console.log("mouseleave");
    tooltip
        .transition()
        .duration(200)
        .style("opacity", 1)
    timer1 = setInterval(test, 1000);
}