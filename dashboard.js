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

    svgContainer.selectAll("svg").remove(); // Clear previous SVG elements

    const svg = svgContainer.append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .call(d3.zoom().on("zoom", function(event) {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    const projection = d3.geoMercator()
        .center([0, 20])
        .scale(99)
        .translate([containerWidth / 2, containerHeight / 2]);

    const attribute = document.getElementById('bubbleAttribute').value;

    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("covid19.csv") // Update with your actual path
    ]).then(function (initialize) {
        let dataGeo = initialize[0];
        let data = initialize[1];

        svg.selectAll("*").remove();

        const color = d3.scaleOrdinal()
            .domain(data.map(d => d["WHO Region"]))
            .range(d3.schemeCategory10.slice(0,6));

        const valueExtent = d3.extent(data, d => +d[attribute]);
        const size = d3.scaleSqrt()
            .domain(valueExtent)
            .range([1, 50]);

        svg.append("g")
            .selectAll("path")
            .data(dataGeo.features)
            .join("path")
            .attr("fill", "#b8b8b8")
            .attr("d", d3.geoPath().projection(projection))
            .style("stroke", "none")
            .style("opacity", .3);

        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        svg.selectAll("myCircles")
            .data(data)
            .join("circle")
            .attr("cx", d => projection([+d.Longitude, +d.Latitude])[0])
            .attr("cy", d => projection([+d.Longitude, +d.Latitude])[1])
            .attr("r", d => size(+d[attribute]))
            .style("fill", d => color(d["WHO Region"]))
            .attr("stroke", d => (d[attribute] > 2000) ? "black" : "none")
            .attr("stroke-width", 1)
            .attr("fill-opacity", .4)
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`Country: ${d.Country}<br>Value: ${d[attribute]}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(this).attr("stroke", "black").attr("stroke-width", 2);
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.select(this).attr("stroke", d => (d[attribute] > 2000) ? "black" : "none").attr("stroke-width", 1);
            })
            .on("click", function(event, d) {
                createChart2(d.Country);
            });

        svg.append("text")
            .attr("text-anchor", "end")
            .style("fill", "black")
            .attr("x", containerWidth - 10)
            .attr("y", containerHeight - 30)
            .attr("width", 90)
            .style("font-size", 14)
            .text("Covid Cases Statistics");

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

        svg.selectAll("legend")
            .data(valuesToShow)
            .join("line")
            .attr('x1', d => xCircle + size(d))
            .attr('x2', xLabel)
            .attr('y1', d => containerHeight - size(d))
            .attr('y2', d => containerHeight - size(d))
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('2,2'));

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

function createChart2(selectedCountry) {
    const margin = {top: 20, right: 30, bottom: 90, left: 90},
        containerWidth = document.getElementById('chart2').clientWidth,
        width = 700 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom;
    let attribute = document.getElementById('bubbleAttribute').value;

    // Create an SVG or select existing SVG
    const svgContainer = d3.select("#chart2").select("svg");
    if (svgContainer.empty()) {
        svgContainer.append("svg")
            .attr("width", containerWidth)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${(containerWidth - width) / 2},${margin.top})`);
    } else {
        svgContainer.attr("width", containerWidth)
            .attr("height", height + margin.top + margin.bottom)
            .select("g")
            .attr("transform", `translate(${(containerWidth - width) / 2},${margin.top})`);
    }

    const svg = svgContainer.select("g");

    function updateChart(attribute, selectedCountry) {
        d3.csv("covid19.csv").then(function(data) {
            // Sort data by the selected attribute
            data = data.sort((a, b) => d3.descending(+a[attribute], +b[attribute]));

            // Find the index of the selected country
            let selectedIndex = data.findIndex(d => d.Country === selectedCountry);

            // Get the countries around the selected country
            let start = Math.max(0, selectedIndex - 4);
            let end = Math.min(data.length, selectedIndex + 5);

            // Filter the data to get the required countries
            data = data.slice(start, end);

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
                .style("text-anchor", "end")
                .style("font-weight", d => d === selectedCountry ? "bold" : "normal");

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
                .attr("fill", d => d.Country === selectedCountry ? "orange" : "#69b3a2")
                .attr("height", d => height - y(0)) // always equal to 0
                .attr("y", d => y(0))
                .transition()
                .duration(800)
                .attr("y", d => y(+d[attribute]))
                .attr("height", d => height - y(+d[attribute]))
                .delay((d, i) => i * 100);

            // Highlight selected country
            svg.selectAll("text")
                .style("font-weight", d => d === selectedCountry ? "bold" : "normal")
                .style("fill", d => d === selectedCountry ? "orange" : "black");
        });
    }

    // Initialize with default attribute
    updateChart(attribute, selectedCountry);
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
    const filteredData = filterTopCountriesByRegion(data, source, middle, value);

    let nodes = [];
    let nodeMap = {};

    function addNode(name) {
        if (!nodeMap.hasOwnProperty(name)) {
            nodeMap[name] = nodes.length;
            nodes.push({ name: name });
        }
        return nodeMap[name];
    }

    const uniqueSources = [...new Set(filteredData.map(d => d[source]))];
    const uniqueMiddles = [...new Set(filteredData.map(d => d[middle]))];
    const uniqueTargets = [...new Set(filteredData.map(d => d[target]))];

    uniqueSources.forEach(addNode);
    uniqueMiddles.forEach(addNode);
    uniqueTargets.forEach(addNode);

    let linksMap = {};

    filteredData.forEach(d => {
        let sourceIndex = addNode(d[source]);
        let middleIndex = addNode(d[middle]);
        let targetIndex = addNode(d[target]);

        let sourceMiddleKey = `${sourceIndex}-${middleIndex}`;
        let middleTargetKey = `${middleIndex}-${targetIndex}`;

        if (linksMap[sourceMiddleKey]) {
            linksMap[sourceMiddleKey].value += +d[value];
        } else {
            linksMap[sourceMiddleKey] = { source: sourceIndex, target: middleIndex, value: +d[value] };
        }

        if (linksMap[middleTargetKey]) {
            linksMap[middleTargetKey].value += +d[value];
        } else {
            linksMap[middleTargetKey] = { source: middleIndex, target: targetIndex, value: +d[value] };
        }
    });

    let links = Object.values(linksMap);

    return {nodes: nodes, links: links};
}

function renderSankeyDiagram(data) {
    const container = d3.select("#sankey");
    const width = container.node().getBoundingClientRect().width;
    const height = 1500;

    const svg = container.html("").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom().on("zoom", function(event) {
            svg.attr("transform", event.transform);
        }))
        .append("g");

    const sankey = d3.sankey()
        .nodeWidth(100)
        .nodePadding(30)
        .extent([[1, 1], [width - 1, height - 6]]);

    const graph = sankey(data);

    // Ensure a minimum node height for readability
    const minNodeHeight = 50;
    graph.nodes.forEach(node => {
        const nodeHeight = node.y1 - node.y0;
        if (nodeHeight < minNodeHeight) {
            const extraHeight = minNodeHeight - nodeHeight;
            node.y1 += extraHeight / 2;
            node.y0 -= extraHeight / 2;
        }
    });

    sankey.update(graph);

    // Color scale for WHO regions
    const color = d3.scaleOrdinal()
        .domain(graph.nodes.filter(d => d.layer === 0).map(d => d.name))
        .range(d3.schemePaired.slice(0, 6));

    // Map to store region colors for middle nodes
    const regionColorMap = {};

    // Draw the nodes
    const nodes = svg.append("g")
        .selectAll("rect")
        .data(graph.nodes)
        .enter().append("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => {
            if (d.layer === 0) {
                const regionColor = color(d.name);
                regionColorMap[d.name] = regionColor;
                return regionColor;
            } else if (d.layer === 1) {
                return regionColorMap[graph.links.find(link => link.target.index === d.index).source.name];
            } else if (d.name === "High") {
                return "pink";
            } else if (d.name === "Medium") {
                return "yellow";
            } else if (d.name === "Low") {
                return "cyan";
            }
            return "green";
        })
        .attr("stroke", "#000")
        .attr("id", d => `node-${d.index}`)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "red").attr("stroke-width", 3);
            highlightNodeAndLinks(d, graph.links, true);
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("stroke", "#999").attr("stroke-width", 1);
            highlightNodeAndLinks(d, graph.links, false);
        })
        .on("click", function(event, d) {
            filterHeatmap(d.name);
        })
        .append("title")
        .text(d => `${d.name}\n${d.value}`);

    // Add text labels inside the nodes
    svg.append("g")
        .selectAll("text")
        .data(graph.nodes)
        .enter().append("text")
        .attr("x", d => (d.x0 + d.x1) / 2)
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .style("font-size", "14px")
        .style("fill", "black")
        .text(d => d.name)
        .each(wrapText);

    // Draw the links
    const links = svg.append("g")
        .attr("fill", "none")
        .attr("stroke-opacity", 0.5)
        .selectAll("path")
        .data(graph.links)
        .enter().append("path")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("id", d => `link-${d.index}`)
        .attr("stroke", "#999")
        .attr("stroke-width", d => Math.max(1, d.width))
        .on("mouseover", function(event, d) {
            highlightNodeAndLinks(d.source, graph.links, true);
        })
        .on("mouseout", function(event, d) {
            highlightNodeAndLinks(d.source, graph.links, false);
        })
        .on("click", function(event, d) {
            filterHeatmap(d.source.name);
        })
        .append("title")
        .text(d => {
            const sourceNode = graph.nodes[d.source.index];
            const targetNode = graph.nodes[d.target.index];
            return `${sourceNode.name} → ${targetNode.name}\n${d.value}`;
        });
}

function highlightNodeAndLinks(node, links, highlight) {
    const color = highlight ? "red" : "#999";
    const strokeOpacity = highlight ? 1 : 0.5;

    d3.select(`#node-${node.index}`)
        .attr("stroke", color)
        .attr("stroke-width", 3);

    links.forEach(link => {
        if (link.source === node || link.target === node) {
            d3.select(`#link-${link.index}`)
                .attr("stroke", d => {
                    if (highlight) {
                        if (d.target.name === "High") return "pink";
                        else if (d.target.name === "Medium") return "yellow";
                        else if (d.target.name === "Low") return "cyan";
                    }
                    return "#999";
                })
                .attr("stroke-opacity", strokeOpacity)
                .attr("stroke-width", link.width);
        }
    });
}

function wrapText(d) {
    const text = d3.select(this);
    const width = d.x1 - d.x0;
    const words = d.name.split(/\s+/).reverse();
    let word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1,
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
    }
}


function filterTopCountriesByRegion(data, regionColumn, countryColumn, valueColumn, topN = 5) {
    const groupedData = d3.groups(data, d => d[regionColumn]);

    return groupedData.flatMap(([region, countries]) => {
        return countries
            .sort((a, b) => d3.descending(+a[valueColumn], +b[valueColumn]))
            .slice(0, topN);
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

function renderHeatmap(data, xColumn, yColumn, valueColumn) {
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

    // Extract unique labels for x and y axes
    const xLabels = [...new Set(data.map(d => d[xColumn]))];
    const yLabels = [...new Set(data.map(d => d[yColumn]))];

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

    const maxValue = d3.max(data, d => d[valueColumn]);
    const minValue = d3.min(data, d => d[valueColumn]);
    const colorScale = d3.scaleSequential()
        .interpolator(d3.interpolateRdYlGn)
        .domain([maxValue, minValue]);  // Note the reversed order to get green for low values and red for high values

    const rects = svg.selectAll()
        .data(data, d => d[xColumn] + ':' + d[yColumn])
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

function highlightHeatmap(region) {
    d3.selectAll('.heatmap-cell')
        .filter(d => d.region === region)
        .classed('highlighted', true);
}

function resetHeatmapHighlight() {
    d3.selectAll('.heatmap-cell').classed('highlighted', false);
}

function filterHeatmap(region) {
    const filteredData = objArr.filter(d => d.WHORegion === region);
    renderHeatmap(filteredData, 'WHORegion', 'StringencyCategory', 'Deaths');
}
