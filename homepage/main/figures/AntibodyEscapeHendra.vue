<template>
    <svg ref="svgContainer" id="svgContainerAminoAcid"></svg>
    <svg id="legend"></svg>
    <CustomSlider v-for="(slider, index) in sliders" :key="index" :label="slider.label" :min="slider.min"
        :max="slider.max" :step="slider.step" v-model="slider.value" />
    <Tooltip ref="tooltip" :data="tooltipData" />
</template>

<script setup>
import { ref, watch } from 'vue';
import * as d3 from 'd3';
import Tooltip from '../components/simpleTooltip.vue';
import CustomSlider from '../components/CustomSlider.vue';
import { Legend } from '../utilities/legend.js';
import { withBase } from 'vitepress';

const sliders = ref([
    { label: 'Site', value: 1, min: 1, max: 546, step: 1 },
]);

const width = 400;
const height = 200;
const marginTop = 100;
const marginRight = 20;
const marginBottom = 50;
const marginLeft = 60;

// DEFINE VARIABLES
const tooltip = ref(null); // reference to the tooltip component
const tooltipData = ref([]); // data to show in the tooltip
const aminoacidpath = withBase('/data/nipah_hendra_comparison_all.csv');
const colorScale = d3.scaleSequential([0, 2], ["white", "purple"])
let array = [];

const fetchData = async () => {
    try {
        array = await d3.csv(aminoacidpath, (d) => ({
            site: +d.site,
            nipah: d.nipah,
            hendra: d.hendra,
            mAb1: +d['1A9'],
            mAb2: +d['2D3'],
            mAb3: +d['4H3'],
            mAb4: +d['2B12'],
            mAb5: +d['1F2'],
            mAb6: +d['12B2'],
        }));

        console.log(array)
        plotDataNipah();
    } catch (error) {
        console.error('Error loading CSV data:', error)
    }
}
fetchData()

watch(() => sliders.value[0].value, () => {
    d3.select("#svgContainerAminoAcid").selectAll("*").remove();
    d3.select("#legend").selectAll("*").remove();
    plotDataNipah();
});

const plotDataNipah = () => {
    
    const filtered = array.filter(d => d.site < sliders.value[0].value + 20 && d.site >= sliders.value[0].value);
    
    
    const boxWidth = 30;
    const boxHeight = 30;

    const width = filtered.length * boxWidth + marginLeft + marginRight;
    const height = 2 * boxHeight + marginTop + marginBottom;
    const svg = d3.select("#svgContainerAminoAcid")
        .attr('viewBox', `0 0 ${width} ${height}`);

    const g = svg.append('g')
        .attr('transform', `translate(${marginLeft},${marginTop})`);

    // Add sequence labels
    g.append('text')
        .attr('x', -10)
        .attr('y', boxHeight / 2)
        .attr('text-anchor', 'end')
        .attr('class', 'sequence-label')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', 'light')
        .attr('fill', 'currentColor')
        .text('Nipah');

    g.append('text')
        .attr('x', -10)
        .attr('y', boxHeight * 1.5)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'sequence-label')
        .attr('font-size', '10px')
        .attr('font-weight', 'light')
        .attr('fill', 'currentColor')
        .text('Hendra');

    g.append('text')
        .attr('x', -10)
        .attr('y', 80)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '10px')
        .attr('font-weight', 'light')
        .attr('fill', 'currentColor')
        .text('Site');
    

    g.append('text')
        .attr('x', -10)
        .attr('y', boxHeight * -0.25)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '8px')
        .attr('font-weight', 'light')
        .attr('fill', 'currentColor')
        .text('1A9');

    g.append('text')
        .attr('x', -10)
        .attr('y', boxHeight * -0.75)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '8px')
        .attr('font-weight', 'light')
        .attr('fill', 'currentColor')
        .text('2D3');

    g.append('text')
        .attr('x', -10)
        .attr('y', boxHeight * -1.25)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '8px')
        .attr('font-weight', 'light')
        .attr('fill', 'currentColor')
        .text('4H3');
    
    g.append('text')
        .attr('x', -10)
        .attr('y', boxHeight * -1.75)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '8px')
        .attr('font-weight', 'light')
        .attr('fill', 'currentColor')
        .text('2B12');
    
    g.append('text')
        .attr('x', -10)
        .attr('y', boxHeight * -2.25)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '8px')
        .attr('font-weight', 'light')
        .attr('fill', 'currentColor')
        .text('1F2');

    g.append('text')
        .attr('x', -10)
        .attr('y', boxHeight * -2.75)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('font-size', '8px')
        .attr('font-weight', 'light')
        .attr('fill', 'currentColor')
        .text('12B2');
    
    // Draw alignment
    filtered.forEach((d, i) => {
        // mAb1
        g.append('circle')
            .attr('cx', i * boxWidth + boxWidth / 2)
            .attr('cy', boxHeight * -0.25)
            .attr('r', d.mAb1 ? 5 : 0)
            .attr('dominant-baseline', 'middle')
            .attr('fill', colorScale(d.mAb1));

        // mAb2
        g.append('circle')
            .attr('cx', i * boxWidth + boxWidth / 2)
            .attr('cy', boxHeight * -0.75)
            .attr('r', d.mAb2 ? 5 : 0)
            .attr('fill', colorScale(d.mAb2));

        // mAb3
        g.append('circle')
            .attr('cx', i * boxWidth + boxWidth / 2)
            .attr('cy', boxHeight * -1.25)
            .attr('r', d.mAb3 ? 5 : 0)
            .attr('fill', colorScale(d.mAb3));

        // mAb4
        g.append('circle')
            .attr('cx', i * boxWidth + boxWidth / 2)
            .attr('cy', boxHeight * -1.75)
            .attr('r', d.mAb4 ? 5 : 0)
            .attr('fill', colorScale(d.mAb4));

        // mAb5
        g.append('circle')
            .attr('cx', i * boxWidth + boxWidth / 2)
            .attr('cy', boxHeight * -2.25)
            .attr('r', d.mAb5 ? 5 : 0)
            .attr('fill', colorScale(d.mAb5));

        // mAb6
        g.append('circle')
            .attr('cx', i * boxWidth + boxWidth / 2)
            .attr('cy', boxHeight * -2.75)
            .attr('r', d.mAb6 ? 5 : 0)
            .attr('fill', colorScale(d.mAb6));

        // Site label
        g.append('text')
            .attr('x', i * boxWidth + boxWidth / 2)
            .attr('y', 80)
            .attr('class', 'site-label')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '10px')
            .attr('font-weight', 'light')
            .attr('fill', 'currentColor')
            .text(d.site);

        // Sequence 1 rectangle
        g.append('rect')
            .attr('x', i * boxWidth)
            .attr('y', 0)
            .attr('width', boxWidth)
            .attr('height', boxHeight)
            .attr('class', 'amino-acid-rect')
            .attr('fill', 'transparent')
            

        // Sequence 1 text
        g.append('text')
            .attr('x', i * boxWidth + boxWidth / 2)
            .attr('y', boxHeight / 2)
            .attr('class', 'amino-acid-text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '16px')
            .attr('font-weight', 'bold')
            .attr('fill', 'currentColor')
            .attr('fill:dark', 'black')
            .text(d.nipah);

        // Highlight differences
        if (d.nipah !== d.hendra) {
            g.append('rect')
                .attr('x', i * boxWidth)
                .attr('y', boxHeight)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('class', 'amino-acid-rect')
                .attr('fill', 'lightgray')

            g.append('text')
                .attr('x', i * boxWidth + boxWidth / 2)
                .attr('y', boxHeight * 1.5)
                .attr('class', 'amino-acid-text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '16px')
                .attr('font-weight', 'bold')
                .attr('fill', 'black')
                .text(d.hendra);

        } else {
            g.append('rect')
                .attr('x', i * boxWidth)
                .attr('y', boxHeight)
                .attr('width', boxWidth)
                .attr('height', boxHeight)
                .attr('class', 'amino-acid-rect')
                .attr('fill', 'transparent')

            // Sequence 2 text
            g.append('text')
                .attr('x', i * boxWidth + boxWidth / 2)
                .attr('y', boxHeight * 1.5)
                .attr('class', 'amino-acid-text')
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '16px')
                .attr('font-weight', 'bold')
                .attr('fill', 'currentColor')
                .text(d.hendra);
        }

        
    });

    const legend = d3.select("#legend")
        .attr('viewBox', `0 0 ${width} ${50}`)
        //.attr('width', width)
        //.attr('height', 100)
        .attr('style', 'display: block;');

    Legend(d3.scaleSequential([0, 2], ["white", "purple"]).clamp(true), {
        svgRef: '#legend',
        title: 'Escape',
        width: width / 8,
        tickValues: [0, 2],
        xcoord: width - (width / 8) - 20,
        ycoord: 0,
        fontSize: 10,
    });
}





</script>