<template>
    <svg ref="svgContainer" id="svgContainerDotPlot"></svg>
    <Tooltip ref="tooltip" :data="tooltipData" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';
import Tooltip from '../components/simpleTooltip.vue';
import { withBase } from 'vitepress';

// reactive variables
const tooltip = ref(null);
const tooltipData = ref([]);

// graphing variables
const width = 600;
const height = 400;
const marginTop = 10;
const marginRight = 20;
const marginBottom = 20;
const marginLeft = 60;
const jitterAmount = 0.75
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

// Load the CSV data
const dataFile = withBase('/data/all_antibodies_escape_filtered.csv');
const fetchData = async () => {
    try {
        const data = await d3.csv(dataFile, (d) => ({
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            escape: +d.escape_mean,
            antibody: d.antibody,
            effect: +d.effect,
        }));
        const dataset = data.filter(d => d.escape >= 0 && d.effect >= -2.5); // Filter out negative escape and effect values
        makeChart(dataset);

    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
};
fetchData()

let svg;
onMounted(() => {
    svg = d3
        .select("#svgContainerDotPlot")
        .attr('viewBox', `0 0 ${width} ${height}`)

    svg.append('g')
        .attr('class', 'xaxis')
        .attr('transform', `translate(0, ${height - marginBottom})`)
});

function makeChart(dataset) {

    const xScale = d3
        .scaleBand()
        .domain([...new Set(dataset.map(d => d.antibody))])
        .range([marginLeft, width - marginRight])
        .padding(0.05);

    // setup scales
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d.escape)])
        .range([height - marginBottom, marginTop]);

    // Function to generate jittered x position
    function jitteredX(antibody) {
        const bandCenter = xScale(antibody) + xScale.bandwidth() / 2;
        const jitterRange = xScale.bandwidth() * jitterAmount;
        const jitter = (Math.random() - 0.5) * jitterRange;
        return bandCenter + jitter;
    }

    const circles = svg
        .append('g')
        .selectAll('circle')
        .data(dataset)
        .join('circle')
        .attr('cx', (d) => jitteredX(d.antibody)) // Use jittered position
        .attr('cy', (d) => yScale(d.escape))
        .attr('r', 4)
        .attr('fill', (d) => colorScale(d.antibody))
        .attr('opacity', 0.8)

    const { handleMouseOver, handleMouseMove, handleMouseOut } = createHoverEffects(circles);

    circles
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut);

    //x-axis
    svg.append('g')
        .attr('transform', `translate(0, ${height - marginBottom})`)
        .call(d3.axisBottom().scale(xScale).tickSizeOuter(0).tickSize(0))
        .call(g => g.select(".domain").remove())
        .selectAll("text")
        .attr("dy", "-8px")
        .style("font-weight", "bold")
        .style("font-size", "20px")
        .style("color", "white")

    //y-axis
    svg.append('g')
        .attr('transform', `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft().scale(yScale).ticks(4).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
        .selectAll("text")
        .style("font-size", "18px")
        .style("color", "currentColor")

    // Add the y-axis label
    svg.append('text')
        .attr('x', -height / 2 - 50)
        .attr('y', 25)
        .attr('transform', 'rotate(-90)')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('fill', 'currentColor')
        .text('Escape')
}

// tooltip data
const getTooltipData = (d) => [
    { label: 'Wildtype', value: d.wildtype },
    { label: 'Site', value: d.site },
    { label: 'Mutant', value: d.mutant },
    { label: 'Escape', value: d.escape.toFixed(1) },
    { label: 'Cell Entry', value: d.effect.toFixed(1) },
];


// Hover effect handlers 
const createHoverEffects = (selection) => {
    const handleMouseOver = function (event, d) {
        // Show tooltip
        tooltip.value.showTooltip(event);
        tooltipData.value = getTooltipData(d);

        //const hoveredObject = d.site;
        const hoveredElement = this;

        // Apply effects based on protein group
        selection.each(function (Data) {
            const object = d3.select(this);
            const isHovered = this === hoveredElement;

            object
                .transition()
                .duration(200)
                .attr('opacity', isHovered ? 1 : 0.8)
                .attr('r', isHovered ? 6 : 4)
        });

        // Bring hovered circle to front
        d3.select(this).raise();
    };

    const handleMouseMove = (event) => {
        if (tooltip.value?.updatePosition) {
            tooltip.value.updatePosition(event);
        }
    };

    const handleMouseOut = function () {
        // Hide tooltip
        tooltip.value.hideTooltip();
        tooltipData.value = [];

        // Reset all circles to original state
        selection
            .transition()
            .duration(200)
            .attr('opacity', 0.8)
            .attr('r', 4)

    };

    return { handleMouseOver, handleMouseMove, handleMouseOut };
};
</script>
