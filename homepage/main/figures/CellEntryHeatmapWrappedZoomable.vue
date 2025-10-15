<template>
    <svg ref="svgContainer" id="svgContainerZoomable"></svg>
    <svg id="legend" viewBox="0 0 500 20" style="width: 400px; height: 60px; display: block; "></svg>
    <Tooltip ref="tooltip" :data="tooltipData" />
</template>

<script setup>
import { shallowRef, onUnmounted } from 'vue';
import * as d3 from 'd3';
import { Legend } from '/main/utilities/legend.js';
import Tooltip from '/main/components/simpleTooltip.vue';
import { withBase } from 'vitepress';

// Reactive references
const tooltip = shallowRef(null);
const tooltipData = shallowRef([]);

// Constant variables
const marginTop = 20;
const marginRight = 20;
const marginBottom = 50;
const marginLeft = 50;
const rowPadding = 30;
const rows = 5;
const squareSize = 10;
const colorScheme = 'interpolateRdBu';
const colorDomain = { min: -4, max: 2 };
const aminoAcids = ['R', 'K', 'H', 'D', 'E', 'Q', 'N', 'S', 'T', 'Y', 'W', 'F', 'A', 'I', 'L', 'M', 'V', 'G', 'P', 'C'];
const xAxisTickInterval = 10;

// Data
const dataFile = withBase('/data/Nipah_F_func_effects_filtered.csv');
let svg = null;
let zoom = null;

let dataLookup = new Map();
let wildtypeLookup = new Map();
let sites = new Set();
let siteRows = [];
let maxSitesInRow;

const fetchData = async () => {
    try {
        const data = await d3.csv(dataFile, d => ({
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            effect: +d.effect,
            times_seen: +d.times_seen
        }));

        data.forEach(d => {
            const site = +d.site;
            const key = `${site}-${d.mutant}`;

            dataLookup.set(key, {
                site,
                wildtype: d.wildtype,
                mutant: d.mutant,
                effect: d.effect,
                times_seen: d.times_seen
            });

            wildtypeLookup.set(site, d.wildtype);
            sites.add(site);
        });
        
        // Calculate row distribution
        const sortedSites = Array.from(sites).sort((a, b) => a - b); // Sort sites numerically
        maxSitesInRow = Math.ceil(sortedSites.length / rows); // Calculate max sites per row
        
        siteRows = Array.from({ length: rows }, (_, i) =>
            sortedSites.slice(i * maxSitesInRow, (i + 1) * maxSitesInRow)
        ); // Distribute sites into rows
        
        // Render heatmap after data is ready
        renderHeatmap();
    
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
};
fetchData();



// Render heatmap
const renderHeatmap = () => {
    // Calculate dimensions
    const innerWidth = squareSize * maxSitesInRow;
    const innerHeight = squareSize * aminoAcids.length * rows +
        rowPadding * (rows - 1);
    const width = innerWidth + marginLeft + marginRight;
    const height = innerHeight + marginTop + marginBottom;

    // Scales
    const x = d3.scaleBand()
        .domain(d3.range(maxSitesInRow))
        .range([0, innerWidth])

    const y = d3.scaleBand()
        .domain(aminoAcids)
        .range([0, squareSize * aminoAcids.length]);

    const color = d3.scaleDiverging(d3[colorScheme])
        .domain([colorDomain.min, 0, colorDomain.max]);
    
    // Setup SVG with zoom
    svg = d3.select("#svgContainerZoomable");
    
    // Clear previous content
    svg.selectAll('*').remove();

    // Define zoom behavior
    zoom = d3.zoom()
        .scaleExtent([0.5, 8])
        .on('zoom', (event) => chartGroup.attr('transform', event.transform));
    
    // Set initial viewBox and call zoom
    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .call(zoom);
    
    // Main chart group
    const chartGroup = svg.append('g')
        .attr('transform', `translate(${marginLeft}, ${marginTop})`);

    // Render rows
    siteRows.forEach((siteRow, rowIndex) => {
        const rowGroup = chartGroup.append('g')
            .attr('class', `row-${rowIndex}`)
            .attr('transform', `translate(0, ${(y.range()[1] + rowPadding) * rowIndex})`);
        
        // main heatmap function
        const cellData = [];
        siteRow.forEach((site, siteIndex) => {
            aminoAcids.forEach(mutant => {
                cellData.push({ site, mutant, siteIndex });
            });
        });
    
        // Use enter-update-exit pattern
        const cells = rowGroup.selectAll('.cell')
            .data(cellData, d => `${d.site}-${d.mutant}`);
    
        cells.enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('x', d => x(d.siteIndex))
            .attr('y', d => y(d.mutant))
            .attr('width', x.bandwidth())
            .attr('height', y.bandwidth())
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('fill', d => {
                const key = `${d.site}-${d.mutant}`;
                const dataPoint = dataLookup.get(key);
                if (dataPoint) {
                    return color(dataPoint.effect);
                }
                return wildtypeLookup.get(d.site) === d.mutant ? 'white' : 'lightgray';
            })
            .on('mouseover', function (event, d) {
                const key = `${d.site}-${d.mutant}`;
                const dataPoint = dataLookup.get(key);

                if (dataPoint) {
                    tooltip.value.showTooltip(event);
                    tooltipData.value = [
                        { label: 'wildtype', value: dataPoint.wildtype },
                        { label: 'site', value: dataPoint.site },
                        { label: 'mutant', value: dataPoint.mutant },
                        { label: 'cell entry effect', value: dataPoint.effect },
                        { label: 'times seen', value: dataPoint.times_seen }
                    ];
                }
            })
            .on('mousemove', (event) => {
                if (tooltip.value?.updatePosition) {
                    tooltip.value.updatePosition(event);
                }
            })
            .on('mouseout', () => {
                tooltip.value.hideTooltip();
                tooltipData.value = [];
            });
        
       
         // X-axis
        const xAxis = d3.axisBottom(x)
            .tickSizeOuter(0)
            .tickFormat((d) => d % xAxisTickInterval === 0 ? siteRow[d] : '');
    
        // Y-axis
        rowGroup.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${y.range()[1]})`)
            .call(xAxis)
            .selectAll('text')
            .attr('dx', '-7px')
            .attr('dy', '-5px')
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'end');
    
        rowGroup.append('g')
            .attr('class', 'y-axis')
            .call(d3.axisLeft(y).tickSizeOuter(0));
        
        // plot wildtype markers
        const markers = rowGroup.selectAll('.wildtype-marker')
            .data(siteRow.map((site, index) => ({ site, index, wildtype: wildtypeLookup.get(site) })));
    
        markers.enter()
            .append('text')
            .attr('class', 'wildtype-marker')
            .attr('x', d => x(d.index) + x.bandwidth() / 2)
            .attr('y', d => y(d.wildtype) + y.bandwidth() / 2 + 3)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('fill', 'black')
            .attr('pointer-events', 'none')
            .text('X');
        });
    
    // Add axis labels
    chartGroup.append('text')
        .attr('class', 'x-label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + marginBottom - 10)
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
        .text('Site');
    
    // Y-axis label
    chartGroup.append('text')
        .attr('class', 'y-label')
        .attr('x', -innerHeight / 2)
        .attr('y', -marginLeft)
        .attr('dy', '1em')
        .attr('font-size', '18px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
        .attr('transform', 'rotate(-90)')
        .text('Amino Acid');

    // Render legend
    d3.select('#legend').selectAll('*').remove();
    Legend(d3.scaleDiverging([-4, 0, 2], d3.interpolateRdBu).clamp(true), {
        svgRef: '#legend',
        title: 'Cell Entry',
        width: 125,
        tickValues: [-4, 0, 2],
        xcoord: 20,
        ycoord: 0,
        fontSize: 14,

    });
};


onUnmounted(() => {
    // Clean up D3 elements and event listeners
    if (svg) {
        svg.selectAll('*').remove();
        svg.on('.zoom', null);
    }
});
</script>

