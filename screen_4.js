var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1000 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom,
    height1 = height-2;


// setup x 
var xValue = function(d) { 
        var value = d.afro_american_percent;
        value = value.replace('%', ''); 
        return value;
    }, // data -> value
    xScale = d3.scaleLinear().range([0, width]), // value -> display
    xMap = function(d) { return xScale(xValue(d));}, // data -> display
    xAxis = d3.axisBottom(xScale)

// setup y
var yValue = function(d) { 
        var value = d.black_victms
        value = value.replace('%', ''); 
        return value;
    }, // data -> value
    yScale = d3.scaleLinear().range([height, 0]), // value -> display
    yMap = function(d) { return yScale(yValue(d));}, // data -> display
    yAxis = d3.axisLeft(yScale);

// add the graph canvas to the body of the webpage
var svg = d3.select("#vis").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .style('fill','white')

// add the tooltip area to the webpage
var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.csv("kill_state.csv").then(function(data) {
    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([0,50]);
    yScale.domain([0,50]);

    var filtered_data = [];
    for(var i = 0; i < data.length; i++){
        var current_victm = data[i].black_victms;
        current_victm = current_victm.replace('%', ''); 
        if(current_victm === '0'){
            continue;
        }
        filtered_data.push(data[i]);
    }
    
    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("African American Population (%)")
            .style('fill', 'white')
            .style('font-size', '20px');
    
    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Black Victms (%)")
            .style('fill', 'white')
            .style('font-size', '20px');
    
        svg.append("circle")
            .attr("r", 200)
            .attr("cx", 250)
            .attr("cy", 190)
            .attr('fill-opacity', 0.2)
    
        svg.append("line")
            .attr("stroke", "grey")
            .style("stroke-width", 3)
            .attr("x1", 440)
            .attr("y1", 250)
            .attr("x2", 500)
            .attr("y2", 350); 
    
        svg.append("text")
            .attr("x", 500)
            .attr("y", 350)
            .html("Most of the states follow the trend of being "+ "<br/>" +"almost double the deaths to population")

    // draw dots
    svg.selectAll(".dot")
        .data(filtered_data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("r", 5)
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", "red")
        .on("mouseover", function(d) {
            tooltip.transition()
                 .duration(200)
                 .style("opacity", .9);
            tooltip.html(d.State + "<br/> (" + xValue(d) 
              + ", " + yValue(d) + ")")
                 .style("left", (d3.event.pageX + 5) + "px")
                 .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                 .duration(500)
                 .style("opacity", 0);
        });

    

        
});