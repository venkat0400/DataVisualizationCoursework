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

// scatterplot axes

let xAxis, yAxis, xAxisLabel, yAxisLabel;
// radar chart axes
let radarAxes, radarAxesAngle;

let dimensions = [];
//*HINT: the first dimension is often a label; you can simply remove the first dimension with
// dimensions.splice(0, 1);

// the visual channels we can use for the scatterplot
let channels = ["scatterX", "scatterY", "size"];

// size of the plots
let margin, width, height, radius;
// svg containers
let scatter, radar, dataTable;

// Add additional variables
let objArr = []
let dimensionArr=[]

function init() {
    // define size of plots
    margin = {top: 20, right: 20, bottom: 20, left: 50};
    width = 600;
    height = 500;
    //Rescaled the radius to have the chart fit
    radius = Math.min(width, height) / 2 - Math.max(margin.top, margin.right, margin.bottom, margin.left);


    // Start at default tab
    document.getElementById("defaultOpen").click();

	// data table
	dataTable = d3.select('#dataTable');
 
    // scatterplot SVG container and axes
    scatter = d3.select("#sp").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");

    // radar chart SVG container and axes
    radar = d3.select("#radar").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height / 2) + ")");

    // read and parse input file
    let fileInput = document.getElementById("upload"), readFile = function () {

        // clear existing visualizations
        clear();

        let reader = new FileReader();
        reader.onloadend = function () {
            console.log("data loaded: ");
            //console.log(reader.result);

            // TODO: parse reader.result data and call the init functions with the parsed data!
            initVis(fileInput.files[0]);
            // TODO: possible place to call the dashboard file for Part 2
            initDashboard(null);
        };
        reader.readAsBinaryString(fileInput.files[0]);
    };
    fileInput.addEventListener('change', readFile);
}


async function initVis(_data){

    // TODO: parse dimensions (i.e., attributes) from input file

        const data=await d3.csv(_data.name);
            
        dimensionArr=Object.keys(data[0]);
        objArr=data;
            // init menu for the visual channels: Due to asynchronous execution, had to move this into the d3.csv loading process
            channels.forEach(function(c){
                initMenu(c, dimensionArr);
            });

            // refresh all select menus
            channels.forEach(function(c){
                refreshMenu(c);
            });
            // Moved radarChart function to have access to dimensions


    // y scalings for scatterplot
    // TODO: set y domain for each dimension
    let y = d3.scaleLinear()
        .range([height - margin.bottom - margin.top, margin.top]);

    // x scalings for scatter plot
    // TODO: set x domain for each dimension
    let x = d3.scaleLinear()
        .range([margin.left, width - margin.left - margin.right]);

    // radius scalings for radar chart
    /*// TODO: set radius domain for each dimension
    let r = d3.scaleLinear()
        .range([0, radius]);*/

    // scatterplot axes
    yAxis = scatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + margin.left + ")")
        .call(d3.axisLeft(y));

    yAxisLabel = yAxis.append("text")
        .style("text-anchor", "middle")
        .attr("y", margin.top / 2)
        .text("x");

    xAxis = scatter.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, " + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom(x));

    xAxisLabel = xAxis.append("text")
        .style("text-anchor", "middle")
        .attr("x", width - margin.right)
        .text("y");
    CreateDataTable(data);
    renderScatterplot();
    renderRadarChart(dimensionArr);

}

// clear visualizations before loading a new file
function clear(){
    scatter.selectAll("*").remove();
    radar.selectAll("*").remove();
    dataTable.selectAll("*").remove();
}

//Create Table
function CreateDataTable(_data) {
    // TODO: create table and add class
    const container = d3.select("#dataTable")
        .append("div").attr("class", "container");
    // TODO: add headers, row & columns
    const table=container.append("table").attr("class", "dataTableClass");
    const thead = table.append("thead")
    const headerRow = thead.append("tr");

    dimensionArr.forEach(key => {
        headerRow.append("th").attr("class","tableHeaderClass").text(key);
    });
    const tbody = table.append("tbody");
    // TODO: add mouseover event
    objArr.forEach(item => {
        const row = tbody.append("tr");
        dimensionArr.forEach(key => {
            row.append("td").attr("class","tableBodyClass").text(item[key]);
        });
    });

}
function renderScatterplot(){
    console.log(dimensionArr);
    // TODO: get domain names from menu and label x- and y-axis
    const x_attribute = readMenu('scatterX');
    const y_attribute = readMenu('scatterY');
    const sizeAttribute=readMenu('size');

    let x = d3.scaleLinear()
        .domain(d3.extent(objArr, d => +d[x_attribute]))
        .range([margin.left, width - margin.left - margin.right]);

    let y = d3.scaleLinear()
        .domain(d3.extent(objArr, d => +d[y_attribute]))
        .range([height - margin.bottom - margin.top, margin.top]);

    let size = d3.scaleLinear()
        .domain(d3.extent(objArr, d => +d[sizeAttribute]))
        .range([3, 20]);
    // TODO: re-render axes
    // Update axes with new scales
    xAxis.call(d3.axisBottom(x));
    yAxis.call(d3.axisLeft(y));

    xAxisLabel.text(x_attribute);
    yAxisLabel.text(y_attribute);  // Update y-axis label
    
    // TODO: render dots
    const circles = scatter.selectAll("circle")
        .data(objArr);
    circles.enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d=>x(d[x_attribute]))
        .attr("cy", d=>y(d[y_attribute]))
        .attr("r", d=>x(d[sizeAttribute])) ;

    circles
        .attr("cx", d => x(d[x_attribute]))
        .attr("cy", d => y(d[y_attribute]))
        .attr("r", d => size(d[sizeAttribute]));

    circles.exit().remove();
}


function renderRadarChart(attributes){
    // radar chart axes
    radarAxesAngle = Math.PI * 2 / attributes.length;
    let levels = 5;
    let label_radius = radius * 1.2; // Extends the radius for better label placement

    // Draw axes
    radar.selectAll(".axis")
        .data(attributes)
        .enter()
        .append("line")
        .attr("class", "axis")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (d, i) => radarX(radius, i))
        .attr("y2", (d, i) => radarY(radius, i))
        .style("stroke", "black")
        .style("stroke-width", 1.5);

    // TODO: render grid lines in gray
    // Construct radial grid lines
    for(let j = 0; j < levels; j++){

        let level_factor = radius / levels * (j + 1);

        radar.selectAll(".gridLines")
            .data(attributes)
            .enter()
            .append("line")
            .attr("x1", (d, i) => radarX(level_factor, i))
            .attr("y1", (d, i) => radarY(level_factor, i))
            .attr("x2", (d, i) => radarX(level_factor, (i + 1) % attributes.length))
            .attr("y2", (d, i) => radarY(level_factor, (i + 1) % attributes.length))
            .style("stroke", "grey")
            .style("stroke-opacity", 0.75)
            .style("stroke-width", "1px")
            .style("stroke-dasharray", "2, 2");
    }

    
    // TODO: render correct axes labels
    radar.selectAll(".axisLabel")
        .data(attributes)
        .enter()
        .append('text')
        .attr('class', 'axisLabel')
        .attr("x", (d, i) => radarX(label_radius, i))
        .attr("y", (d, i) => radarY(label_radius, i))
        .text(d => d)
        .style("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("user-select", "none");
    
}


function radarX(radius, index){
    return radius * Math.cos(radarAngle(index));
}

function radarY(radius, index){
    return radius * Math.sin(radarAngle(index));
}

function radarAngle(index){
    return radarAxesAngle * index - Math.PI / 2;
}

// init scatterplot select menu
function initMenu(id, entries) {
    //console.log("Initializing menu for:", id, "with entries:", entries);

    let select = $("#" + id); // jQuery selector for the select element
    select.empty(); // Clear previous options

    entries.forEach(function(entry) {
        select.append(new Option(entry, entry));
    });

    if ($.isEmptyObject(select.data("ui-selectmenu"))) {
        // Initialize selectmenu
        select.selectmenu({
            create: function(event, ui) {
                //console.log("Selectmenu created for:", id);
            },
            select: function(event, ui) {
                //console.log("Option selected on:", id, "with value:", ui.item.value);
                renderScatterplot();
            }
        });
    } else {
        // Refresh the selectmenu
        select.selectmenu("refresh");
        console.log("Selectmenu refreshed for:", id);
    }
}

// refresh menu after reloading data
function refreshMenu(id){
    $( "#"+id ).selectmenu("refresh");
}

// read current scatterplot parameters
function readMenu(id){
    return $( "#" + id ).val();
}

// switches and displays the tabs
function openPage(pageName,elmnt,color) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
    }
    document.getElementById(pageName).style.display = "block";
    elmnt.style.backgroundColor = color;
}
