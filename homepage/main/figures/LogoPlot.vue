<template>

    <!-- Dropdown -->
    <div class="flex flex-row justify-left items-center text-center">
        <label for="antibody-select-1" class="font-bold tracking-tight text-xs lg:text-md mr-4">
            Antibody:
        </label>
        <div class="relative">
            <select id="antibody-select-1" v-model="selectedAntibody"
                class="appearance-none px-5 py-1.5 pr-10 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-cyan-200 rounded-lg text-xs lg:text-md text-zinc-700 font-medium shadow-md transition-all duration-300 hover:border-cyan-400 hover:shadow-lg focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500 focus:ring-opacity-30 cursor-pointer min-w-[100px]">
                <option v-for="antibody in availableAntibodies" :key="antibody" :value="antibody">
                    {{ antibody }}
                </option>
            </select>
            <!-- Custom dropdown arrow -->
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-cyan-600">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
            </div>
        </div>
    </div>
    <!-- Checkbox -->
    <div class="py-4">
        <input type="checkbox" v-model="showActiveOnly">
        Only show amino acid mutations accessible with 1 nucleotide change
    </div>

    <svg ref="svgContainer" id="svgContainerLogo"></svg>
    <svg id="legend" viewBox="0 0 500 60" style="width: 400px; height: 60px; display: block; "></svg>
    <Tooltip ref="tooltip" :data="tooltipData" />
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import * as d3 from 'd3';
import Tooltip from '../components/simpleTooltip.vue';
import { Legend } from '../utilities/legend.js';
import { withBase } from 'vitepress';

// DEFINE VARIABLES
const selectedAntibody = ref('12B2');
const availableAntibodies = ref([])
const tooltip = ref(null);
const tooltipData = ref([]);
const showActiveOnly = ref(false);
const dataPath = withBase('/data/top_antibody_escape_min_mutants.csv');

// Set dimensions and margins
const width = 400;
const height = 300;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 60;
const marginLeft = 60;
const minColor = -2.5;
const maxColor = 0;
const colorScale = d3.scaleSequential(d3.interpolateGreens).domain([minColor, maxColor]); // assign color scale
const numSitesToShow = 10; // number of top sites to show

// references to axes groups for transitions
let xAxisGroup = null;
let yAxisGroup = null;
let svg = null;

// data storage
let array = []
let topData = {}

onMounted(async() => {
    svg = d3.select("#svgContainerLogo")
        .attr('viewBox', `0 0 ${width} ${height}`);

    xAxisGroup = svg.append('g')
        .attr('transform', `translate(0,${height - marginBottom})`);

    yAxisGroup = svg.append('g')
        .attr('transform', `translate(${marginLeft},0)`)

    // axis labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .attr('fill', 'currentColor')
        .text('Site');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 20)
        .attr('x', -height/2 + marginTop)
        .attr('text-anchor', 'middle')
        .attr('font-size', 16)
        .attr('font-weight', 'bold')
        .attr('fill', 'currentColor')
        .text('Escape');

    fetchData()
});

const fetchData = async () => {
    try {
        array = await d3.csv(dataPath, (d) => ({
            antibody: d.antibody,
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            escape: +d.escape_mean,
            times_seen: +d.times_seen_ab,
            effect: +d.effect,
            min_mutations: +d.min_mutations
        }))
        array = array.filter(d => d.effect >= -2.5) // filter out extreme negative effects

        // Group data by antibody and then store in processed object
        const antibodyGroups = d3.group(array, d => d.antibody);
        availableAntibodies.value = Array.from(antibodyGroups.keys()).sort();

        for (const [antibodyKey, antibodyData] of antibodyGroups) {
            
            const siteSums = d3.rollup(
                antibodyData,
                v => d3.sum(v, d => d.escape),
                d => d.site
            );

            const topSites = Array.from(siteSums, ([site, sum]) => ({ site, sum }))
                .sort((a, b) => b.sum - a.sum)
                .slice(0, numSitesToShow)
                .map(d => d.site);

            //const filteredData = antibodyData.filter(d => topSites.includes(d.site));
            const filteredData = antibodyData


            topData[antibodyKey] = filteredData;
        }
        
        createPlot(topData[selectedAntibody.value]);
    } catch (error) {
        console.error('Error loading CSV data:', error)
    }
}


watch([showActiveOnly, selectedAntibody], () => {
    if (selectedAntibody.value) {
        createPlot(topData[selectedAntibody.value]);
    }

});

// main graphing function
const createPlot = (inputData) => {
    
    if (showActiveOnly.value) {
        inputData = inputData.filter(d => d.min_mutations === 1);
    }
    // Get unique sites and sort
    const sites = [...new Set(inputData.map(d => d.site))].sort((a, b) => a - b);

    // Group data by site
    const groupedData = d3.group(inputData, d => d.site);

    // Calculate the total height (escape) for each site
    const siteTotals = sites.map(site => ({
        site: site,
        total: d3.sum(groupedData.get(site), d => Math.abs(d.escape))
    }));
    const maxTotal = d3.max(siteTotals, d => d.total);

    // Create scales
    const xScale = d3.scaleBand()
        .domain(sites)
        .range([marginLeft, width - marginRight])
        .padding(0.3);

    const yScale = d3.scaleLinear()
        .domain([0, maxTotal])
        .range([height - marginBottom, marginTop]);

    xAxisGroup.transition()
        .duration(2000)
        .ease(d3.easePoly)
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .selectAll('text')
        .attr('font-size', 14)
        .attr('text-anchor', 'middle')
        .attr('text-baseline', 'end')
        .attr('dy', '0.6em');
        
    yAxisGroup.transition()
        .duration(2000)
        .ease(d3.easePoly)
        .call(d3.axisLeft(yScale).ticks(4).tickSizeOuter(0))
        .selectAll('text')
        .attr('font-size', 14)
        .attr('text-anchor', 'end')
        .attr('dy', '0.3em');

    // flat data structure for all letters with unique keys
    const flatData = [];
    sites.forEach(site => {
        const siteData = groupedData.get(site);
        const sortedSiteData = [...siteData].sort((a, b) => a.escape - b.escape);

        // calculate cumulative heights for stacking letters
        let cumulativeHeight = 0;
        sortedSiteData.forEach(d => {
            flatData.push({
                ...d,
                yPosition: cumulativeHeight,
                // Create unique key for each letter
                key: `${site}-${d.mutant}`
            });
            cumulativeHeight += Math.abs(d.escape);
        });
    });

    // main letter plot with transitions
    const letters = svg.selectAll('.letter')
        .data(flatData, d => d.key); // key lets us track individual letters

    letters.join(
        enter => enter.append('text')
            .attr('class', 'letter')
            .attr('data-site', d => d.site) // Store site info for hover effects
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'alphabetic')
            .attr('font-size', '25px')
            .attr('font-weight', 'bold')
            .text(d => d.mutant)
            .attr('fill', d => colorScale(d.effect))
            .style('cursor', 'pointer')
            .attr('opacity', 0)
            .attr('transform', d => {
                const x = xScale(d.site) + xScale.bandwidth() / 2;
                const y = yScale(d.yPosition);
                const scaleY = (yScale(0) - yScale(Math.abs(d.escape))) / 20;
                const scaleX = (xScale.bandwidth() / 20) * 1;
                return `translate(${x},${y}) scale(${scaleX},${scaleY})`;
            })
            .call(enter => enter.transition()
                .duration(2000)
                .ease(d3.easePoly)
                .attr('opacity', 1)
            ),
        update => update
            .call(update => update.transition()
                .duration(2000)
                .ease(d3.easePoly)
                .attr('transform', d => {
                    const x = xScale(d.site) + xScale.bandwidth() / 2;
                    const y = yScale(d.yPosition);
                    const scaleY = (yScale(0) - yScale(Math.abs(d.escape))) / 20;
                    const scaleX = (xScale.bandwidth() / 20) * 1;
                    return `translate(${x},${y}) scale(${scaleX},${scaleY})`;
                })
                .attr('fill', d => colorScale(d.effect))
                .attr('opacity', 1)
            ),
        exit => exit
            .call(exit => exit.transition()
                .duration(750)
                .attr('opacity', 0)
                .remove()
            )
    );
    d3.select('#legend').selectAll('*').remove();
    
    Legend(d3.scaleSequential([minColor, maxColor], d3.interpolateGreens).clamp(true), {
        svgRef: '#legend',
        title: 'Cell entry',
        width: 150,
        tickValues: [-2, -1, 0],
        xcoord: 20,
        ycoord: 0,
        fontSize: 16,
    });

    // Set up hover effects after creating/updating all letters
    const allLetters = svg.selectAll('.letter');
    const { handleMouseOver, handleMouseMove, handleMouseOut } = createHoverEffects(allLetters);

    allLetters
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut);
}

const getTooltipData = (d) => [
    { label: 'Wildtype', value: d.wildtype },
    { label: 'Site', value: d.site },
    { label: 'Cell Entry', value: d.effect.toFixed(1) },
    { label: 'Escape', value: d.escape.toFixed(1) },
    { label: 'Times Seen', value: d.times_seen },
    { label: 'Min Mutations', value: d.min_mutations }
];

const createHoverEffects = (selection) => {
    const handleMouseOver = function (event, d) {
        tooltip.value.showTooltip(event);
        tooltipData.value = getTooltipData(d);

        const hoveredGroup = d.site;
        const hoveredElement = this;

        selection.each(function (data) {
            const element = d3.select(this);
            const isSameGroup = data.site === hoveredGroup;
            const isHoveredElement = this === hoveredElement;

            element
                .transition()
                .duration(200)
                .attr('opacity', isHoveredElement ? 1 : 0.5)
        });

        d3.select(this).raise();
    };

    const handleMouseMove = (event) => {
        if (tooltip.value?.updatePosition) {
            tooltip.value.updatePosition(event);
        }
    };

    const handleMouseOut = function () {
        tooltip.value.hideTooltip();
        tooltipData.value = [];

        selection
            .transition()
            .duration(200)
            .attr('opacity', 1)
    };

    return { handleMouseOver, handleMouseMove, handleMouseOut };
};
</script>