<template>
    <svg ref="svgContainer" id="svgContainerB2vsB3"></svg>
    <Tooltip ref="tooltip" :data="tooltipData" />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';
import Tooltip from '../components/simpleTooltip.vue';
import { withBase } from 'vitepress';

// DEFINE VARIABLES
const tooltip = ref(null); // reference to the tooltip component
const tooltipData = ref([]); // data to show in the tooltip
const rawDataPath = withBase('/data/combined_b2_b3_correlation.csv');

const fetchData = async () => {
    try {
        const array = await d3.csv(rawDataPath, (d) => ({
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            effect_bEFNB2: +d.effect_bEFNB2,
            effect_bEFNB3: +d.effect_bEFNB3,
            protein: d.protein,
        }));
        // Group by protein, then by site
        const byProteinAndSite = d3.rollup(array,
            (values) => ({
                effect_bEFNB2: d3.mean(values, d => d.effect_bEFNB2),
                effect_bEFNB3: d3.mean(values, d => d.effect_bEFNB3),
            }),
            d => d.protein,  // First grouping key
            d => d.site      // Second grouping key
        );

        // Convert to flat array
        const proteinSiteAverages = [];
        byProteinAndSite.forEach((siteMap, protein) => {
            siteMap.forEach((values, site) => {
                proteinSiteAverages.push({
                    protein,
                    site,
                    ...values
                });
            });
        });
        const processedData = proteinSiteAverages;
        console.log('Processed Data:', processedData);
        createCorrPlot(processedData);
    } catch (error) {
        console.error('Error loading CSV data:', error)
    } 
}
// Run when component is mounted
onMounted(() => {
    fetchData()
})

// Create the correlation plot
const createCorrPlot = (processedData) => {

    // Set dimensions and margins
    const width = 400;
    const height = 400;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 60;
    const marginLeft = 60;

    // Create SVG
    const svg = d3.select("#svgContainerB2vsB3")
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')

    // Get unique proteins and create color scale
    const proteins = [...new Set(processedData.map(d => d.protein))]
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(proteins)

    // Create scales
    const xScale = d3.scaleLinear()
        .domain([-4,0.5])
        .range([marginLeft, width - marginRight])

    const yScale = d3.scaleLinear()
        .domain([-4,0.5])
        .range([height - marginBottom, marginTop])

    const circles = svg.append('g')
        .selectAll('circle')
        .data(processedData)
        .join('circle')
        .attr('cx', (d) => xScale(d.effect_bEFNB2))
        .attr('cy', (d) => yScale(d.effect_bEFNB3))
        .attr('r', 4)
        .attr('stroke', 'currentColor')
        .attr('stroke-width', 0.5)
        .attr('stroke-opacity', 0.8)
        .attr('fill', (d) => colorScale(d.protein))
        .attr('fill-opacity', 0.5)
    
    const { handleMouseOver, handleMouseMove, handleMouseOut } = createProteinGroupHoverEffects(circles);

    circles
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut);

    // Add axes
    svg.append('g')
        .attr('transform', `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(xScale).ticks(4))
        .call(g => g.append('text')
            .attr('x', width / 1.9)
            .attr('y', marginBottom - 15)
            .attr('font-size', '12px')
            .attr('fill', 'currentColor')
            .attr('font-weight', 'bold')
            .attr('text-anchor', 'middle')
            .text('Mean effects of mutations in CHO-bEFNB2 cells'));

    svg.append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(d3.axisLeft(yScale).ticks(4))
        .call(g => g.append('text')
            .attr('font-size', '12px')
            .attr('x', -height / 9)
            .attr('y', -marginLeft + 15)
            .attr('transform', 'rotate(-90)')
            .attr('fill', 'currentColor')
            .attr('font-weight', 'bold')
            .text('Mean effects of mutations in CHO-bEFNB3 cells'));

    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${marginLeft + 20}, ${marginTop})`)

    proteins.forEach((protein, i) => {
        const legendRow = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`)

        legendRow.append('circle')
            .attr('r', 4)
            .attr('fill', colorScale(protein))
            .attr('stroke', 'currentColor')
            .attr('stroke-width', 0.5);

        legendRow.append('text')
            .attr('x', 10)
            .attr('y', 5)
            .style('font-size', '12px')
            .attr('fill', 'currentColor')
            .text(protein)
    })
}

const getTooltipData = (d) => [
    { label: 'Site', value: d.site },
    { label: 'Effect bEFNB2', value: d.effect_bEFNB2.toFixed(2) },
    { label: 'Effect bEFNB3', value: d.effect_bEFNB3.toFixed(2) },
    { label: 'Protein', value: d.protein },
];


// Hover effect handlers - highlight by protein group
const createProteinGroupHoverEffects = (circleSelection) => {
    const handleMouseOver = function (event, d) {
        // Show tooltip
        tooltip.value.showTooltip(event);
        tooltipData.value = getTooltipData(d);

        const hoveredProtein = d.protein;
        const hoveredElement = this;

        // Apply effects based on protein group
        circleSelection.each(function (circleData) {
            const circle = d3.select(this);
            const isSameProtein = circleData.protein === hoveredProtein;
            const isHoveredCircle = this === hoveredElement;

            circle
                .transition()
                .duration(200)
                .attr('fill-opacity', isSameProtein ? 0.8 : 0.1)  // Same protein stays visible
                .attr('r', isHoveredCircle ? 5 : 4)  // Only hovered circle gets bigger
                .attr('stroke-width', isHoveredCircle ? 1 : 0.5);  // Only hovered circle gets thicker stroke
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
        circleSelection
            .transition()
            .duration(200)
            .attr('fill-opacity', 0.5)
            .attr('r', 4)
            .attr('stroke-width', 0.5);
    };

    return { handleMouseOver, handleMouseMove, handleMouseOut };
};
</script>