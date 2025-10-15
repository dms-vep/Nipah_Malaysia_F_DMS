<template>
    <svg ref="svgContainer" id="svgContainerSlideableHeatmap"></svg>
    <svg id="legend"></svg>
    <CustomSlider v-for="(slider, index) in sliders" :key="index" :label="slider.label" :min="slider.min"
        :max="slider.max" :step="slider.step" v-model="slider.value" />
    <Tooltip ref="tooltip" :data="tooltipData" />
</template>

<script setup>
import { ref, watch } from 'vue';
import * as d3 from 'd3';
import { withBase } from 'vitepress';
import { Legend } from '/main/utilities/legend.js';
import CustomSlider from '../components/CustomSlider.vue';
import Tooltip from '../components/simpleTooltip.vue';

// reactive variables
const tooltip = ref(null);
const tooltipData = ref([]);
const sliders = ref([
    { label: 'Site', value: 100, min: 29, max: 481, step: 1 },
]);

// dimensions
const marginTop = 2;
const marginRight = 30;
const marginBottom = 20;
const marginLeft = 30;
const squareSize = 5;
const range = 5; // Sites to show on each side

// data storage
let allCombinations = [];
let wildtypeData = [];
let dataMap = new Map();
let svg = null;
let xScale = null;
let yScale = null;
let colorScale = null;

// constants
const amino_acids = ['R', 'K', 'H', 'D', 'E', 'Q', 'N', 'S', 'T', 'Y', 'W', 'F', 'A', 'I', 'L', 'M', 'V', 'G', 'P', 'C'];

// data path
const dataFile = withBase('/data/Nipah_F_func_effects_filtered.csv');
const fetchData = async () => {
    try {
        const data = await d3.csv(dataFile, (d) => ({
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            effect: +d.effect,
            times_seen: +d.times_seen,
        }));

        const siteData = d3.rollup(
            data,
            v => v[0].wildtype,
            d => d.site
        );

        // Create wildtype data array
        wildtypeData = Array.from(siteData, ([site, wildtype]) => ({
            site,
            wildtype
        }));

        // Create data map for fast lookup
        dataMap = new Map(
            data.map(d => [`${d.site}-${d.mutant}`, d])
        );

        // Generate all combinations once
        allCombinations = Array.from(siteData).flatMap(([site, wildtype]) =>
            amino_acids.map(mutant =>
                dataMap.get(`${site}-${mutant}`) || {
                    site,
                    wildtype,
                    mutant,
                    effect: null
                }
            )
        );
        console.log('siteData', siteData)
        console.log('dataMap', dataMap)
        console.log('Total combinations:', allCombinations)
        initializeVisualization();
        updateHeatmap();
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return [];
    }
};
fetchData();


let width, height;
// Initialize the visualization once
function initializeVisualization() {
    
    // Calculate fixed dimensions
    const uniqueSitesCount = range * 2 + 1; // Always showing same number of sites
    height = (squareSize * amino_acids.length) + marginTop + marginBottom;
    width = (squareSize * uniqueSitesCount) + marginLeft + marginRight;

    svg = d3.select("#svgContainerSlideableHeatmap")
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    // Initialize scales (domains will be updated)
    xScale = d3.scaleBand()
        .range([marginLeft, width - marginRight]);

    yScale = d3.scaleBand()
        .domain(amino_acids)
        .range([marginTop, height - marginBottom]);

    colorScale = d3.scaleDiverging([-4, 0, 2], d3.interpolateRdBu);

    // Create axis groups once
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height - marginBottom})`);

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${marginLeft}, 0)`);

    // Add axis labels once
    svg.append('text')
        .attr('class', 'axis-title-x')
        .attr('x', (width) / 2)
        .attr('y', height - 5)
        .attr('font-size', '4px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
        .text('Site');

    svg.append('text')
        .attr('class', 'axis-title-y')
        .attr('x', -50)
        .attr('y', 20)
        .attr('font-size', '4px')
        .attr('transform', 'rotate(-90)')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
        .text('Amino Acid');
}

// Update only the data, not the entire structure
function updateHeatmap() {
    const siteValue = sliders.value[0].value;
    const minSite = siteValue - range;
    const maxSite = siteValue + range;

    const cells = allCombinations.filter(d => d.site >= minSite && d.site <= maxSite);

    // Get unique sites for x-axis
    const uniqueSites = [...new Set(cells.map(d => d.site))];

    // Update x scale domain
    xScale.domain(uniqueSites);

    // Update heatmap cells with data binding
    const cellSelection = svg.selectAll('.heatmap-cell')
        .data(cells, d => `${d.site}-${d.mutant}`);

    cellSelection.join(
        enter => {
            const g = enter.append('g')
                .attr('class', 'heatmap-cell');
            
            // Append rectangle to the group
            g.append('rect')
                .attr('stroke', 'white')
                .attr('stroke-width', 0.75)
                .attr('x', d => xScale(d.site))
                .attr('y', d => yScale(d.mutant))
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .attr('fill', d => {
                    if (d.effect === null && d.mutant !== d.wildtype) return '#d3d3d3';
                    if (d.mutant === d.wildtype) return 'white';
                    return colorScale(d.effect);
                });
            
            // Append text to the group
            g.append('text')
                .attr('x', d => xScale(d.site) + xScale.bandwidth() / 2)
                .attr('y', d => yScale(d.mutant) + yScale.bandwidth() / 2)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('font-size', '4px')
                .attr('pointer-events', 'none')
                .text(d => d.mutant === d.wildtype ? 'X' : '');
            
            return g;
        },
        update => {
            update.select('rect')
                .attr('x', d => xScale(d.site))
                .attr('y', d => yScale(d.mutant))
                .attr('width', xScale.bandwidth())
                .attr('height', yScale.bandwidth())
                .attr('fill', d => {
                    if (d.effect === null && d.mutant !== d.wildtype) return '#d3d3d3';
                    if (d.mutant === d.wildtype) return 'white';
                return colorScale(d.effect);
            }),
            update.select('text')
                .attr('x', d => xScale(d.site) + xScale.bandwidth() / 2)
                .attr('y', d => yScale(d.mutant) + yScale.bandwidth() / 2)
                .text(d => d.mutant === d.wildtype ? 'X' : '');
            return update;
        },
        exit => exit.remove()
    );
        
    const rects = svg.selectAll('.heatmap-cell');
    const { handleMouseOver, handleMouseMove, handleMouseOut } = createHoverEffects(rects);

    rects
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut);

    // Update axes
    svg.select('.x-axis')
        .call(d3.axisBottom(xScale).tickSize(2).tickSizeOuter(0))
        .call(g => g.select('.domain').remove()) // Remove axis line
        .attr('stroke-width', 0.5)
        .selectAll('text')
        .attr('transform', 'rotate(-90)')
        .attr('dx', '-0.7em')
        .attr('dy', '-0.9em')
        .style('text-anchor', 'end')
        .style('font-size', '4px');

    svg.select('.y-axis')
        .call(d3.axisLeft(yScale).tickSize(2).tickSizeOuter(0))
        .attr('stroke-width', 0.5)
        .selectAll('text')
        .attr('dx', '0.2em')
        .attr('text-anchor', 'middle')
        .style('font-size', '4px');

    
    console.log('width, height', width, height)
    d3.select('#legend').selectAll('*').remove();
    d3.select("#legend")
        .attr('viewBox', `0 0 ${600} ${50}`)
        .attr('style', 'display: block;')
        //.attr('width', 700)
        //.attr('height', 50);

    Legend(d3.scaleDiverging([-4, 0, 2], d3.interpolateRdBu).clamp(true), {
        svgRef: '#legend',
        title: 'Cell Entry',
        width: 125,
        tickValues: [-4, 0, 2],
        xcoord: 600-200,
        ycoord: 0,
        fontSize: 14,

    });
}

const createHoverEffects = (selection) => {
    const getTooltipData = (d) => [
        { label: 'Wildtype', value: d.wildtype },
        { label: 'Site', value: d.site },
        { label: 'Mutant', value: d.mutant },
        { label: 'Cell Entry Effect', value: d.effect !== null ? d.effect.toFixed(1) : 'N/A' },
        { label: 'Times Seen', value: d.times_seen !== undefined ? d.times_seen : 'N/A' }
    ];
    
    const handleMouseOver = function (event, d) {
        tooltip.value.showTooltip(event);
        tooltipData.value = getTooltipData(d);
    };

    const handleMouseMove = (event) => {
        if (tooltip.value?.updatePosition) {
            tooltip.value.updatePosition(event);
        }
    };

    const handleMouseOut = function () {
        tooltip.value.hideTooltip();
        tooltipData.value = [];
    };

    return { handleMouseOver, handleMouseMove, handleMouseOut };
};

// Watch slider changes 
watch(() => sliders.value[0].value, () => {
    updateHeatmap();
});
</script>

