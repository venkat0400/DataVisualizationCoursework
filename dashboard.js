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

/*
const sampleData = {
    nodes: [
        { name: "North America" },
        { name: "Europe" },
        { name: "Asia" },
        { name: "USA" },
        { name: "Italy" },
        { name: "Spain" },
        { name: "Germany" },
        { name: "China" },
        { name: "South Korea" },
        { name: "High" },
        { name: "Medium" },
        { name: "Low" }
    ],
    links: [
        { source: 0, target: 3, value: 10000 }, // North America to USA
        { source: 1, target: 4, value: 8000 }, // Europe to Italy
        { source: 1, target: 5, value: 6000 }, // Europe to Spain
        { source: 1, target: 6, value: 4000 }, // Europe to Germany
        { source: 2, target: 7, value: 50000 }, // Asia to China
        { source: 2, target: 8, value: 3000 }, // Asia to South Korea
        { source: 3, target: 9, value: 10000 }, // USA to High
        { source: 4, target: 9, value: 8000 }, // Italy to High
        { source: 5, target: 10, value: 6000 }, // Spain to Medium
        { source: 6, target: 10, value: 4000 }, // Germany to Medium
        { source: 7, target: 9, value: 50000 }, // China to High
        { source: 8, target: 11, value: 3000 } // South Korea to Low
    ]
};
*/

async function initDashboard(_data, _dimensions, objArr) {

    console.log("Initializing Dashboard with dimensions: ", _dimensions);

    // TODO: Initialize the environment (SVG, etc.) and call the nedded methods
    populateSankeyDropdowns(_dimensions);
    
    // Attach event listeners for changes in dropdown
    document.getElementById("sankeySource").addEventListener("change", createChart3);
    document.getElementById("sankeyMiddle").addEventListener("change", createChart3);
    document.getElementById("sankeyTarget").addEventListener("change", createChart3);
    document.getElementById("sankeyValue").addEventListener("change", createChart3);

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
    chart_sankey = d3.select("#sankey").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");


    //  SVG container
    chart4 = d3.select("#chart4").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g");


    createChart1();
    createChart2();
    createChart3();
    createChart4();

    clearDashboard();
}

function createChart1(){

}

function createChart2(){

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

    // Helper function to add a node if it doesn't exist and return its index
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

    // Log unique values
    console.log("Unique sources (regions):", uniqueSources);
    console.log("Unique middles (countries):", uniqueMiddles);
    console.log("Unique targets (stringency categories):", uniqueTargets);

    // Add all unique source nodes (regions)
    uniqueSources.forEach(addNode);

    // Add all unique middle nodes (countries)
    uniqueMiddles.forEach(addNode);

    // Add all unique target nodes (stringency categories)
    uniqueTargets.forEach(addNode);

    // Create an array to store links
    let links = [];

    // Iterate through the dataset and populate links
    data.forEach(d => {
        let sourceIndex = nodeMap[d[source]];
        let middleIndex = nodeMap[d[middle]];
        let targetIndex = nodeMap[d[target]];

        // Add a link from source to middle
        links.push({ source: sourceIndex, target: middleIndex, value: +d[value] });

        // Add a link from middle to target
        links.push({ source: middleIndex, target: targetIndex, value: +d[value] });
    });

    const sankeyData = { nodes: nodes, links: links };

    // Log the sankeyData structure
    console.log("Sankey Data Structure:", sankeyData);

    return sankeyData;
}

/*
function renderSankeyDiagram(data) {
    const width = 800;
    const height = 800;
    
    const svg = d3.select("#sankey").html("").append("svg")
        .attr("width", width)
        .attr("height", height);

    const sankey = d3.sankey()
        .nodeWidth(100)
        .nodePadding(10)
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
        .attr("x", d => {
            return d.x0;
        })
        .attr("y", d => {
            return d.y0;
        })
        .attr("height", d => {
            return d.y1 - d.y0;
        })
        .attr("width", d => {
            return d.x1 - d.x0;
        })
        .attr("fill", "green")
        .attr("stroke", "#000")
        .append("title")
        .text(d => `${d.name}\n${d.value}`);
    
    // Add text labels to the nodes
svg.append("g")
    .selectAll("text")
    .data(graph.nodes)
    .enter().append("text")
    .attr("x", d => d.x0 + 5)
    .attr("y", d => (d.y0 + d.y1) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .style("font-size", "14px")
    .style("fill", "white")
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
        .text(d => `${d.source.name} → ${d.target.name}\n${d.value}`);
}
*/

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