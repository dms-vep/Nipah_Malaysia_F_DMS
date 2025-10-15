<template>
    <div class="">
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
    </div>
    <svg ref="svgContainer" id="svgContainerSumSelectable"></svg>
    <Tooltip ref="tooltip" :data="tooltipData" />
</template>

<script setup>
import { ref, watchEffect, onMounted } from 'vue';
import * as d3 from 'd3';
import Tooltip from '../components/simpleTooltip.vue';
import { withBase } from 'vitepress';

// reactive references
const tooltip = ref(null);
const tooltipData = ref([]);
const availableAntibodies = ref([]);
const selectedAntibody = ref('');

// non-reactive variable to hold the SVG element
let allAntibodyData = new Map();
let svg = null;
let chartGroup = null;

// CHART DIMENSIONS
const width = 800;
const height = 300;
const marginTop = 20;
const marginRight = 30;
const marginBottom = 60;
const marginLeft = 60;
const innerWidth = width - marginLeft - marginRight;
const innerHeight = height - marginTop - marginBottom;

const dataFile = withBase('/data/all_antibodies_escape_filtered_sum.csv');
// load data from single file and process it
const loadData = async () => {
    try {
        const rawData = await d3.csv(dataFile, d => ({
            antibody: d.antibody,
            site: +d.site,
            wildtype: d.wildtype,
            escape: +d.sum_escape,
        }));

        const antibodyGroups = d3.group(rawData, d => d.antibody);

        // Store processed data in Map for O(1) access
        antibodyGroups.forEach((data, antibody) => {
            allAntibodyData.set(antibody, processAntibodyData(data));
        });

        // Set available antibodies
        availableAntibodies.value = Array.from(allAntibodyData.keys()).sort();

        // Set initial selection
        if (availableAntibodies.value.length > 0) {
            selectedAntibody.value = availableAntibodies.value[0];
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}
loadData();
// process the fetched data and return it
function processAntibodyData(data) {
    const siteMap = new Map();

    data.forEach(d => {
        if (!siteMap.has(d.site)) {
            siteMap.set(d.site, {
                site: d.site,
                wildtype: d.wildtype,
                escape: 0
            });
        }
        siteMap.get(d.site).escape += d.escape;
    });

    // Convert to array and round escape values
    return Array.from(siteMap.values())
        .map(d => ({
            ...d,
            escape: Math.round(d.escape * 100) / 100
        }))
        .sort((a, b) => a.site - b.site);
}


// Watch for antibody selection changes
watchEffect(() => {
    if (selectedAntibody.value) {
        updateChart(allAntibodyData.get(selectedAntibody.value));
    }
});


// Setup scales and axes
const xScale = d3.scaleLinear()
    .range([0, innerWidth]);
const xAxisGenerator = d3.axisBottom().scale(xScale).tickSizeOuter(0);


const yScale = d3.scaleLinear()
    .range([innerHeight, 0])
    .clamp(true);
const yAxisGenerator = d3.axisLeft(yScale).tickSizeOuter(0).ticks(6);

// Setup line generator
const lineGenerator = d3.line()
    .x(d => xScale(d.site))
    .y(d => yScale(d.escape))
    .curve(d3.curveMonotoneX);

// Set colors for the different datasets
const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

onMounted(() => {
    svg = d3.select("#svgContainerSumSelectable")
        .attr('viewBox', `0 0 ${width} ${height}`)

    chartGroup = svg.append('g')
        .attr('transform', `translate(${marginLeft}, ${marginTop})`);

    // X-axis group
    chartGroup.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${innerHeight})`);

    // X-axis label
    chartGroup.append('text')
        .attr('class', 'x-axis-label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + marginBottom - 15)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr('font-size', '20px')
        .text('Site');

    // Y-axis group
    chartGroup.append('g')
        .attr('class', 'y-axis');

    // Y-axis label
    chartGroup.append('text')
        .attr('class', 'y-axis-label')
        .attr('x', -innerHeight / 2)
        .attr('y', -marginLeft + 15)
        .attr('fill', 'currentColor')
        .attr('font-weight', 'bold')
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .text('Total Escape');
    
    //loadData();
});



// Render the chart
function updateChart(data) {
    // how long to transition for
    const t = d3.transition().duration(1500).ease(d3.easePoly);
    // Update scales based on the new data
    xScale.domain(d3.extent(data, (d) => d.site));
    yScale.domain([0, d3.max(data, (d) => d.escape)]);
    
    const circleColor = colorScale(selectedAntibody.value);

    //make and update circles. 
    const line = chartGroup.selectAll('.data-line')
        .data([data]) 

    line.enter()
        .append('path')
        .attr('class', 'data-line')
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .merge(line) 
        .transition(t)
        .attr('d', lineGenerator)
        .attr('stroke', circleColor)
        .attr('opacity', 1);


    const circles = chartGroup.selectAll('.data-point')
        .data(data, (d) => d.site)
    
    circles.enter()
        .append('circle')
        .attr('class', 'data-point')
        .attr('r', 4)
        .attr('stroke', 'currentColor')
        .attr('stroke-width', 0.5)
        .on('mouseover', (event, d) => {
            tooltip.value.showTooltip(event);
            tooltipData.value = [
                { label: 'Wildtype', value: d.wildtype },
                { label: 'Site', value: d.site },
                { label: 'Total Escape', value: d.escape.toFixed(1) },
            ];
        })
        .on('mousemove', (event) => {
            // Update position on every mouse move
            if (tooltip.value && tooltip.value.updatePosition) {
                tooltip.value.updatePosition(event);
            }
        })
        .on('mouseout', () => {
            tooltip.value.hideTooltip();
        })

        .attr('cx', (d) => xScale(d.site))
        .attr('cy', (d) => yScale(d.escape))
        .merge(circles)
        .transition(t)
        .attr('cx', (d) => xScale(d.site))
        .attr('cy', (d) => yScale(d.escape))
        .attr('fill', circleColor)
        .attr('opacity', 1);

    circles.exit()
        .transition(t)
        .attr('opacity', 0)
        .remove();
        
    // Update the x-axis
    chartGroup.select('.x-axis')
        .transition(t)
        .call(xAxisGenerator)
        .selectAll('text')
        .attr('font-size', '18px');

    chartGroup.select('.y-axis')
        .transition(t)
        .call(yAxisGenerator)
        .selectAll('text')
        .attr('font-size', '18px');
}

</script>

<style scoped>
select {
    padding: 8px 12px;
    font-size: 14px;
    border: 2px solid #ccc;
    border-radius: 4px;
    background-color: #fff;
    color: #333;
    outline: none;
}

select:focus {
    border-color: #888;
}
</style>