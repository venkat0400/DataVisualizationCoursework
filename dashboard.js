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
let chart1, chart2, chart_sankey, chart4;

async function initDashboard(_data, _dimensions, objArr) {

    console.log("Initializing Dashboard with dimensions: ", _dimensions);

    // TODO: Initialize the environment (SVG, etc.) and call the nedded methods
    populateSankeyDropdowns(_dimensions);

    // Event listeners for changes in Sankey dropdown
    document.getElementById("sankeySource").addEventListener("change", createChart3);
    document.getElementById("sankeyMiddle").addEventListener("change", createChart3);
    document.getElementById("sankeyTarget").addEventListener("change", createChart3);
    document.getElementById("sankeyValue").addEventListener("change", createChart3);

    // Event listener for Heatmap
    document.getElementById('update-heatmap').addEventListener('click', () => {
        const xColumn = document.getElementById('x-axis').value;
        const yColumn = document.getElementById('y-axis').value;
        const valueColumn = document.getElementById('value').value;
        renderHeatmap(objArr, xColumn, yColumn, valueColumn);
    });

    // Populate Heatmap dropdowns
    populateHeatmapDropdowns(_dimensions);

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

    document.getElementById('bubbleAttribute').addEventListener('change', function(){
        createChart1();
        createChart2();
    });
    document.addEventListener('DOMContentLoaded', function() {
        createChart1();
        createChart2();

    });

    createChart3();
    createChart4();

    clearDashboard();
}

function createChart1(){
    const svgContainer = d3.select("#chart1");
    const containerWidth = svgContainer.node().getBoundingClientRect().width;
    const containerHeight = svgContainer.node().getBoundingClientRect().height;

    const svg = svgContainer.select("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight);

    const projection = d3.geoMercator()
        .center([0, 20])
        .scale(99)
        .translate([containerWidth / 2, containerHeight / 2]);

    // Get the selected attribute
    const attribute = document.getElementById('bubbleAttribute').value;

    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("country_wise_latest_with_lat_lon.csv") // Update with your actual path
    ]).then(function (initialize) {
        let dataGeo = initialize[0];
        let data = initialize[1];

        // Clear previous elements
        svg.selectAll("*").remove();

        // Create a color scale
        const color = d3.scaleOrdinal()
            .domain(data.map(d => d["WHORegion"]))
            .range(d3.schemePaired.slice(0, 6));

        // Add a scale for bubble size
        const valueExtent = d3.extent(data, d => +d[attribute]);
        const size = d3.scaleSqrt()
            .domain(valueExtent)
            .range([1, 50]);

        // Draw the map
        svg.append("g")
            .selectAll("path")
            .data(dataGeo.features)
            .join("path")
            .attr("fill", "#b8b8b8")
            .attr("d", d3.geoPath().projection(projection))
            .style("stroke", "none")
            .style("opacity", .3);

        // Tooltip
        const tooltip = svgContainer.append("div")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "#f4f4f4")
            .style("border", "1px solid #d4d4d4")
            .style("padding", "5px")
            .style("border-radius", "5px");

        // Add circles
        svg.selectAll("myCircles")
            .data(data)
            .join("circle")
            .attr("cx", d => projection([+d.longitude, +d.latitude])[0])
            .attr("cy", d => projection([+d.longitude, +d.latitude])[1])
            .attr("r", d => size(+d[attribute]))
            .style("fill", d => color(d["WHORegion"]))
            .attr("stroke", d => (d[attribute] > 2000) ? "black" : "none")
            .attr("stroke-width", 1)
            .attr("fill-opacity", .4)
            .on("mouseover", function(event, d) {
                tooltip.style("visibility", "visible")
                    .html(`Country: ${d.Country}<br>Value: ${d[attribute]}`);
                d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
                d3.select(this).attr("stroke", d => (d[attribute] > 2000) ? "black" : "none").attr("stroke-width", 1);
            });

        // Add title and explanation
        svg.append("text")
            .attr("text-anchor", "end")
            .style("fill", "black")
            .attr("x", containerWidth - 10)
            .attr("y", containerHeight - 30)
            .attr("width", 90)
            .style("font-size", 14)
            .text("Covid Cases Statistics");

        // Add legend: circles
        const valuesToShow = [100, 4000, 15000];
        const xCircle = 40;
        const xLabel = 90;
        svg.selectAll("legend")
            .data(valuesToShow)
            .join("circle")
            .attr("cx", xCircle)
            .attr("cy", d => containerHeight - size(d))
            .attr("r", d => size(d))
            .style("fill", "none")
            .attr("stroke", "black");

        // Add legend: segments
        svg.selectAll("legend")
            .data(valuesToShow)
            .join("line")
            .attr('x1', d => xCircle + size(d))
            .attr('x2', xLabel)
            .attr('y1', d => containerHeight - size(d))
            .attr('y2', d => containerHeight - size(d))
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'));

        // Add legend: labels
        svg.selectAll("legend")
            .data(valuesToShow)
            .join("text")
            .attr('x', xLabel)
            .attr('y', d => containerHeight - size(d))
            .text(d => d)
            .style("font-size", 10)
            .attr('alignment-baseline', 'middle');
    });
}

function createChart2() {
    const margin = {top: 20, right: 30, bottom: 90, left: 90},
        width = 700 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;
    let attribute = document.getElementById('bubbleAttribute').value;
    const svg = d3.select("#chart2 svg g")
        .attr("transform", `translate(${margin.left},${margin.top})`);


    function updateChart(attribute) {
        d3.csv("country_wise_latest_with_lat_lon.csv").then(function(data) {
            // Filter the top 10 countries by the selected attribute
            data = data.sort((a, b) => d3.descending(+a[attribute], +b[attribute])).slice(0, 10);

            // Clear previous elements
            svg.selectAll("*").remove();

            // X axis
            const x = d3.scaleBand()
                .range([0, width])
                .domain(data.map(d => d["Country"]))
                .padding(0.2);

            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

            // Y axis
            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => +d[attribute])])
                .range([height, 0]);

            svg.append("g")
                .call(d3.axisLeft(y));

            // Bars
            svg.selectAll("mybar")
                .data(data)
                .join("rect")
                .attr("x", d => x(d["Country"]))
                .attr("width", x.bandwidth())
                .attr("fill", "#69b3a2")
                // No bar at the beginning thus:
                .attr("height", d => height - y(0)) // always equal to 0
                .attr("y", d => y(0))
                .transition()
                .duration(800)
                .attr("y", d => y(+d[attribute]))
                .attr("height", d => height - y(+d[attribute]))
                .delay((d,i) => i * 100);
        });
    }

    // Initialize with default attribute
    updateChart(attribute);
    // Event listeners for button clicks to update data
    document.getElementById("variable1").addEventListener("click", function() {
        updateChart("Confirmed");
    });

    document.getElementById("variable2").addEventListener("click", function() {
        updateChart("Deaths");
    });
}

function createChart3(){
    const source = document.getElementById("sankeySource").value;
    const middle = document.getElementById("sankeyMiddle").value;
    const target = document.getElementById("sankeyTarget").value;
    const value = document.getElementById("sankeyValue").value;

    const sankeyData = constructSankeyData(source, middle, target, value, objArr);

    renderSankeyDiagram(sankeyData);
}

function createChart4(){

}

// clear files if changes (dataset) occur
function clearDashboard() {

    chart1.selectAll("*").remove();
    chart2.selectAll("*").remove();
    chart_sankey.selectAll("*").remove();
    chart4.selectAll("*").remove();
}

// ------------------------------------ Sankey Implementation ----------------------------------- //
function populateSankeyDropdowns(dimensions) {
    console.log("Populating Sankey dropdowns with dimensions:", dimensions);

    const sourceSelect = document.getElementById("sankeySource");
    const middleSelect = document.getElementById("sankeyMiddle");
    const targetSelect = document.getElementById("sankeyTarget");
    const valueSelect = document.getElementById("sankeyValue");

    // Clear previous options
    sourceSelect.innerHTML = '';
    middleSelect.innerHTML = '';
    targetSelect.innerHTML = '';
    valueSelect.innerHTML = '';

    dimensions.forEach(attribute => {
        console.log("Adding attribute to dropdown:", attribute);

        const option = new Option(attribute, attribute);
        sourceSelect.add(option.cloneNode(true));
        middleSelect.add(option.cloneNode(true));
        targetSelect.add(option.cloneNode(true));
        valueSelect.add(option.cloneNode(true));
    });
}

// Function to construct Data Structure for Sankey
function constructSankeyData(source, middle, target, value, data) {
    // Create an array to store nodes and a map to store the indices of the nodes
    let nodes = [];
    let nodeMap = {};

    function addNode(name) {
        if (!nodeMap.hasOwnProperty(name)) {
            nodeMap[name] = nodes.length;
            nodes.push({ name: name });
        }
        return nodeMap[name];
    }

    // Extract unique values from each column
    const uniqueSources = [...new Set(data.map(d => d[source]))];
    const uniqueMiddles = [...new Set(data.map(d => d[middle]))];
    const uniqueTargets = [...new Set(data.map(d => d[target]))];

    // Add all unique nodes
    uniqueSources.forEach(addNode);
    uniqueMiddles.forEach(addNode);
    uniqueTargets.forEach(addNode);

    // Create a map to store unique links
    let linksMap = {};

    // Iterate through the dataset and populate links
    data.forEach(d => {
        let sourceIndex = addNode(d[source]);
        let middleIndex = addNode(d[middle]);
        let targetIndex = addNode(d[target]);

        // Create unique keys for the links
        let sourceMiddleKey = `${sourceIndex}-${middleIndex}`;
        let middleTargetKey = `${middleIndex}-${targetIndex}`;

        // Aggregate values for links from source to middle
        if (linksMap[sourceMiddleKey]) {
            linksMap[sourceMiddleKey].value += +d[value];
        } else {
            linksMap[sourceMiddleKey] = { source: sourceIndex, target: middleIndex, value: +d[value] };
        }

        // Aggregate values for links from middle to target
        if (linksMap[middleTargetKey]) {
            linksMap[middleTargetKey].value += +d[value];
        } else {
            linksMap[middleTargetKey] = { source: middleIndex, target: targetIndex, value: +d[value] };
        }
    });

    // Convert linksMap to an array of links
    let links = Object.values(linksMap);

    const sankeyData = { nodes: nodes, links: links };

    // Log the sankeyData structure
    console.log("Sankey Data Structure:", sankeyData);

    return sankeyData;
}

function renderSankeyDiagram(data) {
    const width = 1000;
    const height = 800;

    const svg = d3.select("#sankey").html("").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function(event) {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    const sankey = d3.sankey()
        .nodeWidth(20)
        .nodePadding(20)
        .extent([[1, 1], [width - 1, height - 6]]);

    const graph = sankey(data);

    // Log node and link positions
    console.log("Nodes:", graph.nodes);
    console.log("Links:", graph.links);

    // Draw the nodes
    svg.append("g")
        .selectAll("rect")
        .data(graph.nodes)
        .enter().append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => d.color || "green")
        .attr("stroke", "#000")
        .append("title")
        .text(d => `${d.name}\n${d.value}`);

    // Add text labels inside the nodes
    svg.append("g")
        .selectAll("text")
        .data(graph.nodes)
        .enter().append("text")
        .attr("x", d => d.x0 + 5)
        .attr("y", d => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .style("font-size", "10px")
        .style("fill", "black")
        .text(d => d.name);

    // Add links
    svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .selectAll("path")
        .data(graph.links)
        .enter().append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke", "#999")
        .attr("stroke-width", d => Math.max(1, d.width))
        .append("title")
        .text(d => {
            const sourceNode = graph.nodes[d.source.index];
            const targetNode = graph.nodes[d.target.index];

            // Determine if this is a middle-to-end link
        const isMiddleToEndLink = targetNode.layer === 2; // assuming layers are 0 (source), 1 (middle), 2 (end)

        if (isMiddleToEndLink) {
            // Find the original source node
            const originalSourceLink = graph.links.find(link => link.target.index === sourceNode.index);
            const originalSourceNode = graph.nodes[originalSourceLink.source.index];

            return `${originalSourceNode.name} → ${sourceNode.name} → ${targetNode.name}\n${d.value}`;
        } else {
            return `${sourceNode.name} → ${targetNode.name}\n${d.value}`;
        }
        });
}


// ------------------------------------ End of Sankey Implementation ------------------------------ //

// ------------------------------------ Heat Map Implementation ---------------------------------- //
function populateHeatmapDropdowns(dimensions) {
    const xAxisSelect = document.getElementById('x-axis');
    const yAxisSelect = document.getElementById('y-axis');
    const valueSelect = document.getElementById('value');

    // Clear previous options
    xAxisSelect.innerHTML = '';
    yAxisSelect.innerHTML = '';
    valueSelect.innerHTML = '';

    // Populate X-axis and Y-axis dropdowns
    dimensions.forEach(attribute => {
        const optionX = new Option(attribute, attribute);
        xAxisSelect.add(optionX.cloneNode(true));
        const optionY = new Option(attribute, attribute);
        yAxisSelect.add(optionY.cloneNode(true));
    });

    // Populate Value dropdown with numerical columns only
    dimensions.forEach(attribute => {
        const isNumeric = objArr.some(d => !isNaN(d[attribute]) && d[attribute] !== null);
        if (isNumeric) {
            const optionValue = new Option(attribute, attribute);
            valueSelect.add(optionValue.cloneNode(true));
        }
    });
}

function renderHeatmap() {
    const margin = { top: 50, right: 200, bottom: 300, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    // Remove any existing SVG
    d3.select("#heatmap").select("svg").remove();

    // Create SVG
    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Get selected values from dropdowns
    const xColumn = d3.select("#x-axis").property("value");
    const yColumn = d3.select("#y-axis").property("value");
    const valueColumn = d3.select("#value").property("value");

    // Extract unique labels for x and y axes
    const xLabels = [...new Set(objArr.map(d => d[xColumn]))];
    const yLabels = [...new Set(objArr.map(d => d[yColumn]))];

    const x = d3.scaleBand()
        .range([0, width])
        .domain(xLabels)
        .padding(0.01);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    const y = d3.scaleBand()
        .range([height, 0])
        .domain(yLabels)
        .padding(0.01);

    svg.append("g")
        .call(d3.axisLeft(y));

    const maxValue = d3.max(objArr, d => d[valueColumn]);
    const minValue = d3.min(objArr, d => d[valueColumn]);
    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateRdYlGn)
        .domain([maxValue, minValue]);  // Note the reversed order to get green for low values and red for high values

    const rects = svg.selectAll()
        .data(objArr, d => d[xColumn] + ':' + d[yColumn])
        .enter()
        .append("rect")
        .attr("x", d => x(d[xColumn]))
        .attr("y", d => y(d[yColumn]))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("fill", d => colorScale(d[valueColumn]))
        .style("opacity", 0)
        .on("mouseover", (event, d) => {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.display = 'block';
            tooltip.style.left = event.pageX + 10 + 'px';
            tooltip.style.top = event.pageY + 10 + 'px';
            tooltip.innerHTML = `${xColumn}: ${d[xColumn]}<br>${yColumn}: ${d[yColumn]}<br>${valueColumn}: ${d[valueColumn]}`;
        })
        .on("mouseout", () => {
            const tooltip = document.getElementById('tooltip');
            tooltip.style.display = 'none';
        });

    // Add animation
    rects.transition()
        .duration(2000)  // Slower animation duration
        .style("opacity", 1);

    // Add a legend for the heatmap
    const legendWidth = 200;
    const legendHeight = 20;

    const legendSvg = svg.append("g")
        .attr("transform", `translate(${width - legendWidth}, -30)`);

    const legendScale = d3.scaleLinear()
        .domain([minValue, maxValue])
        .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
        .ticks(5)
        .tickSize(legendHeight);

    legendSvg.selectAll("rect")
        .data(d3.range(legendWidth), d => d)
        .enter().append("rect")
        .attr("x", d => d)
        .attr("y", 0)
        .attr("width", 1)
        .attr("height", legendHeight)
        .style("fill", d => colorScale(d / legendWidth * (maxValue - minValue) + minValue));

    legendSvg.append("g")
        .call(legendAxis)
        .select(".domain")
        .remove();
}
