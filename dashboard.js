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

    // Event listener for the slider
    const slider = document.getElementById("topNCountries");
    const sliderValueDisplay = document.getElementById("topNCountriesValue");

    slider.addEventListener("input", function() {
        updateSliderValue(this.value);
        updateSliderBackground(this);
        createChart3();
    });

    // Call this function initially to set the correct background on page load
updateSliderBackground(slider);

    // Populate Heatmap dropdowns
    populateHeatmapDropdowns(objArr);
    // Initialize the heatmap
    initializeHeatmap();

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
            .attr("class", "sankey-tooltip") // Use the same class as Sankey-tooltip
            .style("opacity", 0);

        svg.selectAll("myCircles")
            .data(data)
            .join("circle")
            .attr("cx", d => projection([+d.Longitude, +d.Latitude])[0])
            .attr("cy", d => projection([+d.Longitude, +d.Latitude])[1])
            .attr("r", 0) // Start radius at 0 for animation
            .style("fill", d => color(d["WHO Region"]))
            .attr("stroke", d => (d[attribute] > 2000) ? "black" : "none")
            .attr("stroke-width", 1)
            .attr("fill-opacity", .4)
            .transition() // Add transition for animation
            .duration(1500) // Animation duration
            .attr("r", d => size(+d[attribute]));

        svg.selectAll("circle")
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
    let sortOrder = 'descending'; // Default sort order

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

    function updateChart(attribute, selectedCountry, sortOrder) {
        d3.csv("covid19.csv").then(function(data) {
            data = data.sort((a, b) => sortOrder === 'descending' ? d3.descending(+a[attribute], +b[attribute]) : d3.ascending(+a[attribute], +b[attribute]));
            let selectedIndex = data.findIndex(d => d.Country === selectedCountry);

            let start = Math.max(0, selectedIndex - 4);
            let end = Math.min(data.length, selectedIndex + 5);

            data = data.slice(start, end);


            svg.selectAll("*").remove();


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


            const y = d3.scaleLinear()
                .domain([0, d3.max(data, d => +d[attribute])])
                .range([height, 0]);

            svg.append("g")
                .call(d3.axisLeft(y));


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

            svg.selectAll("text")
                .style("font-weight", d => d === selectedCountry ? "bold" : "normal")
                .style("fill", d => d === selectedCountry ? "orange" : "black");
        });
    }

    document.getElementById('ascOrderBtn').addEventListener('click', () => {
        sortOrder = 'ascending';
        updateChart(attribute, selectedCountry, sortOrder);
    });

    document.getElementById('descOrderBtn').addEventListener('click', () => {
        sortOrder = 'descending';
        updateChart(attribute, selectedCountry, sortOrder);
    });

    updateChart(attribute, selectedCountry, sortOrder);
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

// Function to update the slider value display
function updateSliderValue(value) {
    const sliderValueDisplay = document.getElementById("topNCountriesValue");
    sliderValueDisplay.textContent = value;
}

// Function to update the slider background fill
function updateSliderBackground(slider) {
    const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
    slider.style.background = `linear-gradient(to right, #3498db 0%, #3498db ${value}%, #ddd ${value}%, #ddd 100%)`;
}



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
    const topN = +document.getElementById('topNCountries').value; // Get the current value of the slider
    const filteredData = filterTopCountriesByRegion(data, source, middle, value, topN);

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

// Function to render the Sankey diagram
function renderSankeyDiagram(data) {
    const topN = +document.getElementById('topNCountries').value; // Get the current value of the slider
    const filteredData = filterTopCountriesByRegion(data, 'Region', 'Country', 'Value', topN);

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
        .nodeWidth(200)
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
        .range(d3.schemeCategory10.slice(0, 6));

    // Map to store region colors for middle nodes
    const regionColorMap = {};

    // Create a tooltip div for nodes
    const nodeTooltip = d3.select("body").append("div")
        .attr("class", "sankey-tooltip")
        .style("visibility", "hidden");

    // Create a tooltip div for links
    const linkTooltip = d3.select("body").append("div")
        .attr("class", "sankey-tooltip")
        .style("visibility", "hidden");

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
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke", "#000").attr("stroke-width", 5);
            highlightNodeAndLinks(d, graph.links, true, regionColorMap);
            nodeTooltip.style("visibility", "visible")
                .html(`<div class="tooltip-title">${d.layer === 0 ? "Region" : (d.layer === 1 ? "Country" : "Stringency Category")}: <strong>${d.name}</strong></div>
                       <div class="tooltip-value">Value: ${d.value}</div>`);
        })
        .on("mousemove", function(event) {
            nodeTooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("stroke", "#999").attr("stroke-width", 1);
            highlightNodeAndLinks(d, graph.links, false, regionColorMap);
            nodeTooltip.style("visibility", "hidden");
        })
        .on("click", function(event, d) {
            filterHeatmap(d.name);
        });

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
        .style("font-size", "15px")
        .style("fill", "black")
        .style("user-select", "none")
        .style("pointer-events", "none")
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
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            highlightNodeAndLinks(d.source, graph.links, true, regionColorMap);
            linkTooltip.style("visibility", "visible")
                .html(`<div class="tooltip-title">${d.source.name} → ${d.target.name}</div>
                       <div class="tooltip-value">Value: ${d.value}</div>`);
        })
        .on("mousemove", function(event) {
            linkTooltip.style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function(event, d) {
            highlightNodeAndLinks(d.source, graph.links, false, regionColorMap);
            linkTooltip.style("visibility", "hidden");
        })
        .on("click", function(event, d) {
            filterHeatmap(d.source.name);
        });

    function highlightNodeAndLinks(node, links, highlight, regionColorMap) {
        const color = highlight ? "#000" : "#999";
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
                            else return regionColorMap[d.source.name];
                        }
                        return "#999";
                    })
                    .attr("stroke-opacity", strokeOpacity)
                    .attr("stroke-width", link.width);
            }
        });
    }
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



function filterTopCountriesByRegion(data, regionColumn, countryColumn, valueColumn, topN) {

    // Ensure data is an array and has the necessary columns
    if (!Array.isArray(data) || data.length === 0) {
        console.error("Invalid data format");
        return [];
    }

    const groupedData = d3.groups(data, d => d[regionColumn]);
    console.log("Grouped Data:", groupedData);

    return groupedData.flatMap(([region, countries]) => {
        return countries
            .sort((a, b) => d3.descending(+a[valueColumn], +b[valueColumn]))
            .slice(0, topN);
    });
}



// ------------------------------------ End of Sankey Implementation ------------------------------ //

// ------------------------------------ Heat Map Implementation ---------------------------------- //
// Function to populate dropdowns for region and country
function populateHeatmapDropdowns(data) {
    const regionSelect = document.getElementById('region');
    const countrySelect = document.getElementById('country');
    const caseTypeSelect = document.getElementById('case-type');

    console.log('Populating dropdowns...');

    // Clear previous options
    regionSelect.innerHTML = '';
    countrySelect.innerHTML = '';
    caseTypeSelect.innerHTML = '';

    // Extract unique values for regions and countries
    const regions = [...new Set(data.map(d => d.WHORegion))];
    const countries = [...new Set(data.map(d => d.Country))];

    // Populate Region dropdown
    regions.forEach(region => {
        const option = new Option(region, region);
        regionSelect.add(option);
    });

    // Populate Country dropdown
    countries.forEach(country => {
        const option = new Option(country, country);
        countrySelect.add(option);
    });

    // Extract numerical columns and populate Case Type dropdown
    const firstRow = data[0];
    const numericalColumns = Object.keys(firstRow).filter(key => {
        return !isNaN(firstRow[key]) && key !== 'WHORegion' && key !== 'Country';
    });

    numericalColumns.forEach(column => {
        const option = new Option(column, column);
        caseTypeSelect.add(option);
    });

    console.log('Dropdowns populated.');
}
// Adjusted coolwarm color scale
const coolwarm = d3.scaleSequential(d3.interpolateCool).domain([-1, 1]);

// Function to compute the correlation matrix
function computeCorrelationMatrix(data, variables) {
    const n = variables.length;
    const matrix = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            matrix[i][j] = correlation(data.map(d => d[variables[i]]), data.map(d => d[variables[j]]));
        }
    }

    return matrix;
}

// Helper function to compute the correlation between two arrays
function correlation(x, y) {
    const n = x.length;
    const meanX = d3.mean(x);
    const meanY = d3.mean(y);
    const covXY = d3.sum(x.map((d, i) => (d - meanX) * (y[i] - meanY))) / n;
    const stdDevX = Math.sqrt(d3.sum(x.map(d => (d - meanX) ** 2)) / n);
    const stdDevY = Math.sqrt(d3.sum(y.map(d => (d - meanY) ** 2)) / n);
    return covXY / (stdDevX * stdDevY);
}

// Function to render heatmap based on selected type
function renderHeatmap(data, heatmapType, caseTypes, colorScheme) {
    console.log("Data passed to renderHeatmap:", data);
    console.log("Heatmap Type:", heatmapType);
    console.log("Case Types:", caseTypes);
    console.log("Color Scheme:", colorScheme);

    if (data.length === 0) {
        console.error("Filtered data is empty.");
        return;
    }

    const margin = { top: 50, right: 200, bottom: 150, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    d3.select("#heatmap").select("svg").remove();

    const svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    if (heatmapType === 'correlation') {
        const correlationMatrix = computeCorrelationMatrix(data, caseTypes);
        console.log("Correlation Matrix:", correlationMatrix);

        if (!Array.isArray(correlationMatrix)) {
            console.error("Correlation Matrix is not an array");
            return;
        }

        correlationMatrix.forEach((row, i) => {
            if (!Array.isArray(row)) {
                console.error(`Row ${i} of correlation matrix is not an array`);
            }
        });

        const labels = caseTypes;

        const x = d3.scaleBand()
            .range([0, width])
            .domain(labels)
            .padding(0.01);

        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .style("font-size", "14px") // Increase the font size of x-axis labels
            .style("font-family", "Arial, sans-serif"); // Change the font family of x-axis labels;

        const y = d3.scaleBand()
            .range([height, 0])
            .domain(labels)
            .padding(0.01);

        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", "14px") // Increase the font size of y-axis labels
            .style("font-family", "Arial, sans-serif"); // Change the font family of y-axis labels

        let colorScale;
        switch (colorScheme) {
            case 'coolwarm':
                colorScale = d3.scaleSequential(d3.interpolateCool);
                break;
            case 'YlGnBu':
                colorScale = d3.scaleSequential(d3.interpolateYlGnBu);
                break;
            default:
                colorScale = d3.scaleSequential(d3.interpolateRdYlGn);
        }
        colorScale.domain([-1, 1]);

        const flattenedData = correlationMatrix.flatMap((row, i) => row.map((value, j) => ({ value, i, j })));
        console.log("Flattened Data for Rectangles:", flattenedData);

        svg.selectAll()
            .data(flattenedData)
            .enter()
            .append("rect")
            .attr("x", d => x(labels[d.j]))
            .attr("y", d => y(labels[d.i]))
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", d => colorScale(d.value))
            .on("mouseover", (event, d) => {
                const tooltip = document.getElementById('tooltip');
                tooltip.style.display = 'block';
                tooltip.style.left = event.pageX + 10 + 'px';
                tooltip.style.top = event.pageY + 10 + 'px';
                tooltip.innerHTML = `${labels[d.i]} vs ${labels[d.j]}<br>Value: ${d.value.toFixed(2)}`;
            })
            .on("mouseout", () => {
                const tooltip = document.getElementById('tooltip');
                tooltip.style.display = 'none';
            });

        const legendWidth = 200;
        const legendHeight = 20;

        const legendSvg = svg.append("g")
            .attr("transform", `translate(${width - legendWidth}, -30)`);

        const legendScale = d3.scaleLinear()
            .domain([-1, 1])
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
            .style("fill", d => colorScale(d / legendWidth * 2 - 1));

        legendSvg.append("g")
            .call(legendAxis)
            .select(".domain")
            .remove();
    } else {
        let xLabels, yLabels, x, y, maxValue, minValue, colorScale;

        switch (heatmapType) {
            case 'country-vs-cases':
                xLabels = [...new Set(data.map(d => d.Country))];
                yLabels = caseTypes;

                x = d3.scaleBand()
                    .range([0, width])
                    .domain(xLabels)
                    .padding(0.01);

                svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .attr("transform", "rotate(-45)")
                    .style("text-anchor", "end")
                    .style("font-size", "14px") // Increase the font size of x-axis labels
                    .style("font-family", "Arial, sans-serif"); // Change the font family of x-axis labels;

                y = d3.scaleBand()
                    .range([height, 0])
                    .domain(yLabels)
                    .padding(0.01);

                svg.append("g")
                    .call(d3.axisLeft(y))
                    .selectAll("text")
                    .style("font-size", "14px") // Increase the font size of y-axis labels
                    .style("font-family", "Arial, sans-serif"); // Change the font family of y-axis labels

                maxValue = d3.max(data, d => d3.max(caseTypes.map(ct => d[ct])));
                minValue = d3.min(data, d => d3.min(caseTypes.map(ct => d[ct])));

                colorScale = d3.scaleSequential()
                    .interpolator(d3.interpolateRdYlGn)
                    .domain([minValue, maxValue]);

                const countryVsCasesData = data.flatMap(d => caseTypes.map(ct => ({ Country: d.Country, CaseType: ct, Value: d[ct] })));
                console.log("Country vs Cases Data:", countryVsCasesData);

                svg.selectAll()
                    .data(countryVsCasesData)
                    .enter()
                    .append("rect")
                    .attr("x", d => x(d.Country))
                    .attr("y", d => y(d.CaseType))
                    .attr("width", x.bandwidth())
                    .attr("height", y.bandwidth())
                    .style("fill", d => colorScale(d.Value))
                    .on("mouseover", (event, d) => {
                        const tooltip = document.getElementById('tooltip');
                        tooltip.style.display = 'block';
                        tooltip.style.left = event.pageX + 10 + 'px';
                        tooltip.style.top = event.pageY + 10 + 'px';
                        tooltip.innerHTML = `${d.Country}<br>${d.CaseType}: ${d.Value}`;
                    })
                    .on("mouseout", () => {
                        const tooltip = document.getElementById('tooltip');
                        tooltip.style.display = 'none';
                    });
                break;

            case 'region-vs-cases':
                xLabels = [...new Set(data.map(d => d.WHORegion))];
                yLabels = caseTypes;

                x = d3.scaleBand()
                    .range([0, width])
                    .domain(xLabels)
                    .padding(0.01);

                svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x))
                    .selectAll("text")
                    .attr("transform", "rotate(-45)")
                    .style("text-anchor", "end")
                    .style("font-size", "14px") // Increase the font size of x-axis labels
                    .style("font-family", "Arial, sans-serif"); // Change the font family of x-axis labels;

                y = d3.scaleBand()
                    .range([height, 0])
                    .domain(yLabels)
                    .padding(0.01);

                svg.append("g")
                    .call(d3.axisLeft(y))
                    .selectAll("text")
                    .style("font-size", "14px") // Increase the font size of y-axis labels
                    .style("font-family", "Arial, sans-serif"); // Change the font family of y-axis labels

                maxValue = d3.max(data, d => d3.max(caseTypes.map(ct => d[ct])));
                minValue = d3.min(data, d => d3.min(caseTypes.map(ct => d[ct])));

                colorScale = d3.scaleSequential()
                    .interpolator(d3.interpolateRdYlGn)
                    .domain([minValue, maxValue]);

                const regionVsCasesData = data.flatMap(d => caseTypes.map(ct => ({ WHORegion: d.WHORegion, CaseType: ct, Value: d[ct] })));
                console.log("Region vs Cases Data:", regionVsCasesData);

                svg.selectAll()
                    .data(regionVsCasesData)
                    .enter()
                    .append("rect")
                    .attr("x", d => x(d.WHORegion))
                    .attr("y", d => y(d.CaseType))
                    .attr("width", x.bandwidth())
                    .attr("height", y.bandwidth())
                    .style("fill", d => colorScale(d.Value))
                    .on("mouseover", (event, d) => {
                        const tooltip = document.getElementById('tooltip');
                        tooltip.style.display = 'block';
                        tooltip.style.left = event.pageX + 10 + 'px';
                        tooltip.style.top = event.pageY + 10 + 'px';
                        tooltip.innerHTML = `${d.WHORegion}<br>${d.CaseType}: ${d.Value}`;
                    })
                    .on("mouseout", () => {
                        const tooltip = document.getElementById('tooltip');
                        tooltip.style.display = 'none';
                    });
                break;
        }

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
}

function initializeHeatmap() {
    console.log('Initializing heatmap...');
    // Add event listener to update button
    document.getElementById("update-heatmap").addEventListener("click", () => {
        const selectedHeatmapType = document.querySelector('input[name="heatmap-type"]:checked').value;
        const selectedRegions = Array.from(document.getElementById("region").selectedOptions).map(option => option.value);
        const selectedCountries = Array.from(document.getElementById("country").selectedOptions).map(option => option.value);
        const selectedCaseTypes = Array.from(document.getElementById("case-type").selectedOptions).map(option => option.value);
        const selectedColorScheme = document.getElementById("color-scheme").value;

        console.log("Selected Heatmap Type: ", selectedHeatmapType);
        console.log("Selected Regions: ", selectedRegions);
        console.log("Selected Countries: ", selectedCountries);
        console.log("Selected Case Types: ", selectedCaseTypes);
        console.log("Selected Color Scheme: ", selectedColorScheme);

        let filteredData = objArr;
        console.log("Initial data length:", filteredData.length);
        if (selectedRegions.length > 0) {
            filteredData = filteredData.filter(d => selectedRegions.includes(d.WHORegion));
        }
        console.log("After region filter data length:", filteredData.length);
        if (selectedCountries.length > 0) {
            filteredData = filteredData.filter(d => selectedCountries.includes(d.Country));
        }
        console.log("After country filter data length:", filteredData.length);

        if (filteredData.length === 0) {
            console.error("Filtered data is empty.");
            return;
        }

        renderHeatmap(filteredData, selectedHeatmapType, selectedCaseTypes, selectedColorScheme);
    });

    // Populate the dropdowns on page load
    populateHeatmapDropdowns(objArr);
}
