/*
* Data Visualization - Framework
* Copyright (C) University of Passau
*   Faculty of Computer Science and Mathematics
*   Chair of Cognitive sensor systems
* Maintenance:
*   2024, Alexander Gall <alexander.gall@uni-passau.de>
*
* All rights reserved.
*/

// TODO: File for Part 2
// TODO: You can edit this file as you wish - add new methods, variables etc. or change/delete existing ones.

// TODO: use descriptive names for variables
let chart1, chart2, chart3, chart4;

function initDashboard(_data) {

    // TODO: Initialize the environment (SVG, etc.) and call the nedded methods

    //  SVG container
    chart1 = d3.select("#chart1").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    //  SVG container
    chart2 = d3.select("#chart2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");


    //  SVG container
    chart3 = d3.select("#chart3").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");


    //  SVG container
    chart4 = d3.select("#chart4").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    document.getElementById('bubbleAttribute').addEventListener('change', createChart1);
    document.addEventListener('DOMContentLoaded', function() {
        createChart1();
    });
    createChart2();
    createChart3();
    createChart4();
}

function createChart1(){
    const svg = d3.select("#chart1 svg");

    const projection = d3.geoMercator()
        .center([0, 20])                // GPS of location to zoom on
        .scale(99)                      // This is like the zoom
        .translate([width / 2, height / 2]);

    // Get the selected attribute
    const attribute = document.getElementById('bubbleAttribute').value;

    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("country_wise_latest_with_lat_lon.csv") // Update with your actual path
    ]).then(function (initialize) {
        let dataGeo = initialize[0];
        let data = initialize[1];

        // Create a color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d[attribute])) // Adjust if needed
            .range(d3.schemePaired);

        // Add a scale for bubble size
        const valueExtent = d3.extent(data, d => +d[attribute]);
        const size = d3.scaleSqrt()
            .domain(valueExtent)  // What's in the data
            .range([1, 50]);  // Size in pixel

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(dataGeo.features)
            .join("path")
            .attr("fill", "#b8b8b8")
            .attr("d", d3.geoPath().projection(projection))
            .style("stroke", "none")
            .style("opacity", .3);

        // Add circles:
        svg.selectAll("myCircles")
            .data(data)
            .join("circle")
            .attr("cx", d => projection([+d.longitude, +d.latitude])[0])
            .attr("cy", d => projection([+d.longitude, +d.latitude])[1])
            .attr("r", d => size(+d[attribute]))
            .style("fill", d => color(d[attribute])) // Adjust if needed
            .attr("stroke", d => { if (d[attribute] > 2000) { return "black"; } else { return "none"; } })
            .attr("stroke-width", 1)
            .attr("fill-opacity", .4);

        // Add title and explanation
        svg.append("text")
            .attr("text-anchor", "end")
            .style("fill", "black")
            .attr("x", width - 10)
            .attr("y", height - 30)
            .attr("width", 90)
            .style("font-size", 14)
            .text("Covid Cases Chart");

        // Add legend: circles
        const valuesToShow = [100, 4000, 15000];
        const xCircle = 40;
        const xLabel = 90;
        svg.selectAll("legend")
            .data(valuesToShow)
            .join("circle")
            .attr("cx", xCircle)
            .attr("cy", d => height - size(d))
            .attr("r", d => size(d))
            .style("fill", "none")
            .attr("stroke", "black");

        // Add legend: segments
        svg.selectAll("legend")
            .data(valuesToShow)
            .join("line")
            .attr('x1', d => xCircle + size(d))
            .attr('x2', xLabel)
            .attr('y1', d => height - size(d))
            .attr('y2', d => height - size(d))
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'));

        // Add legend: labels
        svg.selectAll("legend")
            .data(valuesToShow)
            .join("text")
            .attr('x', xLabel)
            .attr('y', d => height - size(d))
            .text(d => d)
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle');
    });
}

function createChart2(){

}

function createChart3(){

}

function createChart4(){

}

// clear files if changes (dataset) occur
function clearDashboard() {

    chart1.selectAll("*").remove();
    chart2.selectAll("*").remove();
    chart3.selectAll("*").remove();
    chart4.selectAll("*").remove();
}

