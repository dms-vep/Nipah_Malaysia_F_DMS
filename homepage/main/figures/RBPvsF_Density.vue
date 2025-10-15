<template>
    <svg ref="svgContainer"></svg>
</template>

<script setup>
import { shallowRef } from 'vue';
import * as d3 from 'd3';
import { withBase } from 'vitepress';

// DEFINE VARIABLES
const svgContainer = shallowRef(null);
const dataPath = withBase('/data/RBP_vs_F_func_effects.csv');

// Set dimensions and margins
const width = 400;
const height = 400;
const marginTop = 20;
const marginRight = 30;
const marginBottom = 60;
const marginLeft = 60;
const colorScale = d3.scaleOrdinal(d3.schemeCategory10)

const bandwidth = 0.4; // Adjust this value to change the smoothness of the density curves

const fetchData = async () => {
    try {
        const array = await d3.csv(dataPath, (d) => ({
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            effect: +d.effect,
            protein: d.protein,
        }));

        createDensityPlot(array)
    } catch (error) {
        console.error('Error loading CSV data:', error)
    }
}
fetchData()

// Create the density plot
const createDensityPlot = (array) => {


    // Get unique proteins and create color scale
    const proteins = [...new Set(array.map(d => d.protein))]


    // Create scales
    const xExtent = d3.extent(array, d => d.effect)
    const xScale = d3.scaleLinear()
        .domain([xExtent[0] - 0.25, xExtent[1] + 0.25])
        .range([marginLeft, width - marginRight])


    const yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - marginBottom, marginTop])


    // Calculate density for each protein
    const densities = proteins.map(protein => {
        const proteinData = array
            .filter(d => d.protein === protein)
            .map(d => d.effect);
        const thresholds = d3.ticks(...d3.nice(...d3.extent(proteinData), 10), 40);
        return {
            protein: protein,
            density: kde(epanechnikov(bandwidth), thresholds, proteinData)
        }
    })

    // Create line generator
    const line = d3.line()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]))
        .curve(d3.curveBasis)

    // Create SVG
    const svg = d3.select(svgContainer.value)
        .attr('viewBox', `0 0 ${width} ${height}`)

    // Draw density curves
    densities.forEach(d => {
        svg.append('path')
            .datum(d.density)
            .attr('fill', colorScale(d.protein))
            .attr('stroke', colorScale(d.protein))
            .attr('stroke-width', 2)
            .attr('fill-opacity', 0.3)
            .attr('d', line)
    })

    // x axis
    const xAxis = svg.append('g')
        .attr('transform', `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(xScale).ticks(4).tickSizeOuter(0))

    xAxis.selectAll('text')
        .attr('fill', 'currentColor')
        .attr('font-size', '12px')

    xAxis.append('text')
        .attr('class', 'label')
        .attr('x', width / 2)
        .attr('y', marginBottom - 10)
        .attr('text-anchor', 'middle')
        .attr('fill', 'currentColor')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Effects of mutations on cell entry in CHO-bEFNB3 cells');

    // y axis
    const yAxis = svg.append('g')
        .attr('transform', `translate(${marginLeft},0)`)
        .call(d3.axisLeft(yScale).ticks(4).tickSizeOuter(0))

    yAxis.selectAll('text')
        .attr('fill', 'currentColor')
        .attr('font-size', '12px')

    yAxis.append('text')
        .attr('class', 'label')
        .attr('x', -height / 3.5)
        .attr('y', -marginLeft + 15)
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'currentColor')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Relative Frequency');

    // legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - 80}, ${marginTop})`)

    proteins.forEach((protein, i) => {
        const legendRow = legend.append('g')
            .attr('transform', `translate(0, ${i * 20})`)

        legendRow.append('rect')
            .attr('width', 18)
            .attr('height', 2)
            .attr('fill', colorScale(protein))

        legendRow.append('text')
            .attr('x', 25)
            .attr('y', 5)
            .style('font-size', '12px')
            .attr('fill', 'currentColor')
            .text(protein)
    })
}

// Kernel density estimation functions
function kde(kernel, thresholds, data) {
    return thresholds.map(t => [t, d3.mean(data, d => kernel(t - d))]);
}

function epanechnikov(bandwidth) {
    return function (v) {
        return Math.abs(v /= bandwidth) <= 1 ? 0.75 * (1 - v * v) / bandwidth : 0;
    };
}
</script>

