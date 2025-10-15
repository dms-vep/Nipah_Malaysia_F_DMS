<template>
    <svg ref="svgContainer"></svg>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';

const svgContainer = ref(null);

let dataSet = [
    { start: 1, stop: 634, name: 'LTR' },
    { start: 681, stop: 806, name: 'Psi' },
    { start: 1301, stop: 1536, name: 'RRE' },
    { start: 2225, stop: 2592, name: 'rTRE3GS' },
    { start: 2644, stop: 4214, name: 'Nipah F' },
    { start: 4300, stop: 4806, name: 'CMV' },
    { start: 4912, stop: 5600, name: 'ZsGreen' },
    { start: 5601, stop: 6240, name: 'PuroR' },
    { start: 6242, stop: 6833, name: 'WPRE' },
    { start: 6834, stop: 7536, name: 'LTR' },

];


const width = 600;
const height = 400;
const margin = { top: 20, right: 20, bottom: 40, left: 20 };

const x = d3.scaleLinear()
    .domain([0, d3.max(dataSet, d => d.stop)])
    .range([margin.left, width - margin.right])
    .nice();

const color = d3.scaleOrdinal(d3.schemeTableau10);

function startAnimation(svg, gRects, gLabels, gx, xTitle, backboneText) {
    gRects.attr("x", width + 50);
    gLabels.attr("x", width + 50);
    gx.attr('transform', `translate(0,${height + 50})`);
    xTitle.attr('y', height + 50);
    backboneText.attr('opacity', 1);

    gRects.transition()
        .duration(3000)
        .ease(d3.easeCubicInOut)
        .attr("x", d => x(d.start));

    gLabels.transition()
        .duration(3000)
        .ease(d3.easeCubicInOut)
        .attr("x", d => (x(d.start) + x(d.stop)) / 2);

    gx.transition()
        .duration(3000)
        .ease(d3.easeCubicInOut)
        .attr('transform', `translate(0,${height / 2 + 15})`);

    xTitle.transition()
        .duration(3000)
        .ease(d3.easeCubicInOut)
        .attr('y', height - 125)

    backboneText.transition()
        .duration(3000)
        .attr('opacity', 0);

    setTimeout(() => {
        startAnimation(svg, gRects, gLabels, gx, xTitle, backboneText);
    }, 6000);
}

onMounted(() => {
    const svg = d3.select(svgContainer.value)
        //.attr('preserveAspectRatio', "xMinYMin meet")
        .attr('viewBox', `0 0 ${width} ${height}`)

    svg.append("g")
        .append("rect")
        .attr("fill", "currentColor")
        .attr("x", margin.left)
        .attr("y", height / 2)
        .attr("height", 10)
        .attr("width", width - margin.right - margin.left);

    const backboneText = svg.append('text')
        .attr('class', 'backbone-text')
        .attr('x', width / 2)
        .attr('y', height / 2 - 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('fill', 'currentColor')
        .text('Lentivirus Backbone');

    const gRects = svg.selectAll("rect.data")
        .data(dataSet)
        .enter()
        .append("rect")
        .attr("class", "data")
        .attr("fill", (d, i) => color(i))
        .attr("x", 1000)
        .attr("y", height / 2 - 2)
        .attr("height", 14)
        .attr("width", d => x(d.stop) - x(d.start));

    const gLabels = svg.selectAll("text.label")
        .data(dataSet)
        .enter()
        .append("text")
        //.attr("class", "label")
        .attr("x", 1000)
        .attr("y", height / 2 - 6)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold")
        .attr("fill", (d, i) => color(i))
        .text(d => d.name);

    const gx = svg.append('g')
        .call(d3.axisBottom(x).ticks(10).tickSizeInner(4))
        .call(g => g.select(".domain").remove())
        .attr('font-size', '12px')
        .attr('color', 'currentColor');

    const xTitle = svg.append('text')
        //.attr('class', 'axis-title')
        .attr('x', width / 2)
        .attr('y', -height )
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'currentColor')
        .text('Position (bp)');

    startAnimation(svg, gRects, gLabels, gx, xTitle, backboneText);
});
</script>