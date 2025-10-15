<template>
    <svg ref="svgContainer" id="svgContainer"></svg>
</template>

<script setup>
import { onMounted } from 'vue';
import * as d3 from 'd3';
import { withBase } from 'vitepress';

// Dimensions and margins
const width = 800;
const height = 300;
const marginTop = 40;
const marginRight = 40;
const marginBottom = 60;
const marginLeft = 60;

let processedData = null;
let siteExtent = null;
let escapeExtent = null;

const dataFile = withBase('/data/all_antibodies_escape_filtered_sum.csv');
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



// Run the code when the component is mounted
onMounted(async () => {
    const data = await fetchData();
    processedData = processData(data);
    makeColorChart(processedData);
});


function makeColorChart(processedData) {

    const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

    const xScale = d3.scaleLinear()
        .domain(siteExtent)
        .range([marginLeft, width - marginRight])
        .clamp(true);

    const xAxisGenerator = d3.axisBottom()
        .scale(xScale)
        .tickSizeOuter(0);

    const yScale = d3.scaleLinear()
        .domain(escapeExtent)
        .range([height - marginBottom, marginTop])
        .clamp(true);

    const yAxisGenerator = d3.axisLeft()
        .scale(yScale)
        .ticks(4)
        .tickSizeOuter(0);

    const lineGenerator = d3.line()
        .x((d) => xScale(d.site))
        .y((d) => yScale(d.escape))
        .curve(d3.curveMonotoneX);

    const svg = d3.select("#svgContainer")
        .attr('viewBox', `0 0 ${width} ${height}`);

    const path = svg.append('g')
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .selectAll('path')
        .data(processedData)
        .join('path')
        .attr('d', (d) => lineGenerator(d.sites))
        .attr('stroke', (d) => colorScale(d.antibody))
        .attr('mix-blend-mode', 'multiply');

    //x-axis
    svg.append('g')
        .attr('transform', `translate(0, ${height - marginBottom})`)
        .call(xAxisGenerator)
        .attr('font-size', '14px')
        .call((g) => g.selectAll('.domain').remove())
        .call((g) => g.append('text')
            .attr('x', width / 2)
            .attr('y', marginBottom - 15)
            .attr('font-size', '18px')
            .attr('font-weight', 'bold')
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .text('Site')
        );

    //y-axis
    svg.append('g')
        .attr('transform', `translate(${marginLeft}, 0)`)
        .call(yAxisGenerator)
        .attr('font-size', '14px')
        .call((d) => d.selectAll('.domain').remove())
        .call((g) => g.append('text')
            .attr('x', -height / 2)
            .attr('y', -marginLeft + 15)
            .attr('font-size', '18px')
            .attr('font-weight', 'bold')
            .attr('transform', 'rotate(-90)')
            .attr('fill', 'currentColor')
            .attr('text-anchor', 'middle')
            .text('Total Escape at Site')
        );


    // Setup tooltip - create flat array of points with their data
    const points = processedData.flatMap((d) =>
        d.sites.map((s) => ({
            x: xScale(s.site),
            y: yScale(s.escape),
            antibody: d.antibody,
            site: s.site,
            escape: s.escape
        }))
    );

    const dot = svg.append('g').attr('display', 'none');

    dot.append('circle').attr('r', 3).attr('fill', 'currentColor');

    dot
        .append('text')
        .attr('font-size', 12)
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
        .attr('y', -8);

    function pointermoved(event) {
        const [xm, ym] = d3.pointer(event);

        // Find the closest point
        const i = d3.leastIndex(points, (p) => Math.hypot(p.x - xm, p.y - ym));
        const point = points[i];

        // Highlight the selected line
        path
            .style('stroke', ({ antibody }) => (antibody === point.antibody ? null : '#ddd'))
            .filter(({ antibody }) => antibody === point.antibody)
            .raise();

        // Position and update the dot
        dot.attr('transform', `translate(${point.x},${point.y})`);
        dot.select('text').text(`Antibody: ${point.antibody}, Site: ${point.site}, Escape: ${point.escape.toFixed(1)}`);

        // Dispatch the input event
        svg.property('value', {
            antibody: point.antibody,
            site: point.site,
            escape: point.escape
        }).dispatch('input', { bubbles: true });
    }

    function pointerentered() {
        path.style('mix-blend-mode', null).style('stroke', '#ddd');
        dot.attr('display', null);
    }

    function pointerleft() {
        path.style('mix-blend-mode', 'multiply').style('stroke', (d) => colorScale(d.antibody));
        dot.attr('display', 'none');
        svg.node().value = null;
        svg.dispatch('input', { bubbles: true });
    }

    svg
        .on('pointerenter', pointerentered)
        .on('pointermove', pointermoved)
        .on('pointerleave', pointerleft)
        .on('touchstart', (event) => event.preventDefault());
}
</script>