<template>
    <svg ref='svgContainer' id="svgContainer"></svg>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as d3 from 'd3';
import { withBase } from 'vitepress';

// Dimensions and margins
const width = 800;
const height = 400;
const marginTop = 40;
const marginRight = 40;
const marginBottom = 60;
const marginLeft = 60;

// Animation variables
let path;
let antibodies;
let currentAntibodyIndex = -1;
const loopInterval = 2500;
let antibodyText;
let animationId = null;

// Data fetching and processing
const dataFile = withBase('/data/all_antibodies_escape_filtered_sum.csv');
let processedData = null;
let siteExtent = null;
let escapeExtent = null;

const fetchData = async () => {
    try {
        const rawData = await d3.csv(dataFile, (d) => ({
            site: +d.site,
            wildtype: d.wildtype,
            sum_escape: +d.sum_escape,
            antibody: d.antibody,
        }));
        return rawData;
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return [];
    }
};

const processData = (rawData) => {
    if (!rawData || rawData.length === 0) return [];

    const antibodyMap = new Map();

    // Pre-calculate extents while grouping
    let minSite = Infinity, maxSite = -Infinity;
    let maxEscape = -Infinity;

    rawData.forEach(d => {
        const { antibody, site, sum_escape } = d;

        // Update extents
        if (site < minSite) minSite = site;
        if (site > maxSite) maxSite = site;
        if (sum_escape > maxEscape) maxEscape = sum_escape;

        // Group by antibody
        if (!antibodyMap.has(antibody)) {
            antibodyMap.set(antibody, []);
        }
        antibodyMap.get(antibody).push({
            site,
            escape: sum_escape
        });
    });

    // Store extents for later use
    siteExtent = [minSite, maxSite];
    escapeExtent = [0, maxEscape];

    // Convert Map to array and sort sites within each antibody
    const result = Array.from(antibodyMap.entries()).map(([antibody, sites]) => ({
        antibody,
        sites: sites.sort((a, b) => a.site - b.site)
    }));

    return result;
};

// Start the component lifecycle
onMounted(async () => {
    const rawData = await fetchData();
    processedData = processData(rawData);
    makeColorChart(processedData);

});

const colorScale = d3.scaleOrdinal().range(d3.schemeTableau10);

function makeColorChart(data) {
    if (!data || data.length === 0) {
        console.error('No data to plot');
        return;
    }
    // Use pre-calculated extents
    const xScale = d3.scaleLinear()
        .domain(siteExtent)
        .range([marginLeft, width - marginRight]);

    const yScale = d3.scaleLinear()
        .domain(escapeExtent)
        .range([height - marginBottom, marginTop])
        .clamp(true);

    // Create axis generators
    const xAxisGenerator = d3.axisBottom(xScale)
        .tickSizeOuter(0).ticks(4);
    const yAxisGenerator = d3.axisLeft(yScale)
        .ticks(4)
        .tickSizeOuter(0);

    // Line generator
    const lineGenerator = d3.line()
        .x(d => xScale(d.site))
        .y(d => yScale(d.escape))
        .curve(d3.curveMonotoneX);

    const svg = d3.select("#svgContainer")
        .attr('viewBox', `0 0 ${width} ${height}`);

    // Clear existing content
    svg.selectAll('*').remove();

    // Create paths 
    path = svg.append('g')
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .selectAll('path')
        .data(data)
        .join('path')
        .attr('d', d => lineGenerator(d.sites))
        .attr('stroke', d => colorScale(d.antibody))
        .attr('mix-blend-mode', 'multiply')
        .style('vector-effect', 'non-scaling-stroke');

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0, ${height - marginBottom})`)
        .call(xAxisGenerator)
        .attr('font-size', '18px')
        .call(g => g.selectAll('.domain').remove())
        .call(g => g.append('text')
            .attr('x', width / 2)
            .attr('y', marginBottom - 10)
            .attr('font-size', '20px')
            .attr('fill', 'currentColor')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .text('Site'));

    svg.append('g')
        .attr('transform', `translate(${marginLeft}, 0)`)
        .call(yAxisGenerator)
        .attr('font-size', '18px')
        .call(g => g.selectAll('.domain').remove())
        .call(g => g.append('text')
            .attr('x', -height / 2)
            .attr('y', -marginLeft + 20)
            .attr('font-size', '20px')
            .attr('transform', 'rotate(-90)')
            .attr('fill', 'currentColor')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .text('Total Escape'));

    // Add antibody label in upper right corner
    antibodyText = svg.append("text")
        .attr("x", width - marginRight)
        .attr("y", marginTop)
        .attr("text-anchor", "end")
        .attr('font-weight', 'bold')
        .attr("font-size", "20px")
        .text('All antibodies');

    // Initialize animation
    antibodies = data.map(d => d.antibody);
    startLoop();
}

function startLoop() {
    // Clear any existing interval
    if (animationId) {
        clearInterval(animationId);
    }

    animationId = setInterval(() => {
        currentAntibodyIndex = (currentAntibodyIndex + 1) % (antibodies.length + 1);
        updateColors();
    }, loopInterval);
}

function updateColors() {
    if (currentAntibodyIndex === 0) {
        // Show all antibodies
        path.style("stroke", d => colorScale(d.antibody))
            .attr("stroke-width", 1.5)
            .style("opacity", 1);

        antibodyText.text("All antibodies")
            .attr("fill", "currentColor");
    } else {
        // Highlight current antibody
        const currentAntibody = antibodies[currentAntibodyIndex - 1];

        path.style("stroke", d => d.antibody === currentAntibody ? colorScale(d.antibody) : "#ddd")
            .attr("stroke-width", d => d.antibody === currentAntibody ? 2 : 1.5)
            .style("opacity", d => d.antibody === currentAntibody ? 1 : 0.75);

        // Bring current antibody to front
        path.filter(d => d.antibody === currentAntibody).raise();

        antibodyText.text(currentAntibody)
            .attr("fill", colorScale(currentAntibody));
    }
}


onUnmounted(() => {
    if (animationId) {
        clearInterval(animationId);
        animationId = null;
    }
});
</script>