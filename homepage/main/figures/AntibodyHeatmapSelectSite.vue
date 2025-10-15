<template>
    <svg ref="svgContainer" id="antibodyheatmapsite"></svg>
    <!-- Dropdown -->
    <div class="flex flex-row justify-left items-center text-center my-6">
        <label for="antibody-select-1" class="font-bold tracking-tight text-xs lg:text-md mr-4">
            Antibody:
        </label>
        <div class="relative">
            <select id="antibody-select-1" v-model="selectedAntibody"
                class="appearance-none px-5 py-1.5 pr-10 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-cyan-200 rounded-lg text-xs lg:text-md text-zinc-700 font-medium shadow-md transition-all duration-300 hover:border-cyan-400 hover:shadow-lg focus:border-cyan-500 focus:outline-none focus:ring-3 focus:ring-cyan-500 focus:ring-opacity-30 cursor-pointer min-w-[100px]">
                <option v-for="antibody in uniqueAntibodies" :key="antibody" :value="antibody">
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
    <CustomSlider v-for="(slider, index) in sliders" :key="index" :label="slider.label" :min="slider.min"
        :max="slider.max" :step="slider.step" v-model="slider.value" />
    <Tooltip ref="tooltip" :data="tooltipData" />
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import * as d3 from 'd3';
import { withBase } from 'vitepress';
import CustomSlider from '../components/CustomSlider.vue';
import Tooltip from '../components/simpleTooltip.vue';

// DEFINE REACTIVE VARIABLES
const allCombinationsComplete = ref([]);
const wildtypeDataComplete = ref([]);
const uniqueAntibodies = ref([]);
const selectedAntibody = ref('12B2');
const tooltip = ref(null);
const tooltipData = ref([]);

const sliders = ref([
    { label: 'Site', value: 192, min: 29, max: 481, step: 1 },
]);

// DEFINE DIMENSIONS
const marginTop = 5;
const marginRight = 30;
const marginBottom = 30;
const marginLeft = 30;
const squareSize = 5;
const range = 10;

// DEFINE NON-REACTIVE VARIABLES
const amino_acids = ['R', 'K', 'H', 'D', 'E', 'Q', 'N', 'S', 'T', 'Y', 'W', 'F', 'A', 'I', 'L', 'M', 'V', 'G', 'P', 'C'];

// LOAD DATA
const dataFile = withBase('/data/all_antibodies_escape_filtered.csv');
let data = [];
const fetchData = async () => {
    try {
        data = await d3.csv(dataFile, (d) => ({
            antibody: d.antibody,
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            escape: +d.escape_mean,
            effect: +d.effect,
            times_seen: +d.times_seen,
        }));
        preprocessData(); // Process data once after loading
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
};
fetchData();


function preprocessData() {
    const antibodyGroups = d3.group(data, d => d.antibody);

    // Get unique antibodies
    uniqueAntibodies.value = Array.from(antibodyGroups.keys()).sort();
    const filtered = data.filter(d => d.antibody === selectedAntibody.value);

    // Get site data and wildtypes
    const siteData = d3.rollup(
        filtered,
        v => v[0].wildtype,
        d => d.site
    );

    // Create wildtype data array
    wildtypeDataComplete.value = Array.from(siteData, ([site, wildtype]) => ({
        site,
        wildtype
    }));

    // Create a Map
    const dataMap = new Map(
        filtered.map(d => [`${d.site}-${d.mutant}`, d])
    );

    // Generate all combinations using flatMap
    allCombinationsComplete.value = Array.from(siteData).flatMap(([site, wildtype]) =>
        amino_acids.map(mutant =>
            dataMap.get(`${site}-${mutant}`) || {
                antibody: selectedAntibody.value,
                site,
                wildtype,
                mutant,
                escape: null,
                effect: null,


            }
        )
    );
    updateHeatmap();
}

const filteredData = computed(() => {
    const siteValue = sliders.value[0].value;
    const minSite = siteValue - range;
    const maxSite = siteValue + range;

    return allCombinationsComplete.value.filter(
        d => d.site >= minSite && d.site <= maxSite
    );
});

const filteredWildtypeData = computed(() => {
    const siteValue = sliders.value[0].value;
    const minSite = siteValue - range;
    const maxSite = siteValue + range;

    return wildtypeDataComplete.value.filter(
        d => d.site >= minSite && d.site <= maxSite
    );
});

// Watch the slider value for changes
watch(() => selectedAntibody.value, () => {
    preprocessData();
});

watch(() => sliders.value[0].value, () => {
    updateHeatmap();
});

function updateHeatmap() {
    if (!filteredData.value.length) return;

    // Get unique sites from filtered data
    const uniqueSites = [...new Set(filteredData.value.map(d => d.site))];

    // Calculate dimensions
    const height = squareSize * amino_acids.length + marginTop + marginBottom;
    const width = squareSize * uniqueSites.length + marginLeft + marginRight;

    // Clear and setup SVG
    const svg = d3.select("#antibodyheatmapsite");
    svg.selectAll('*').remove();

    const svgElement = svg
        .attr('viewBox', `0 0 ${width} ${height}`)

    // Setup scales
    const xScale = d3
        .scaleBand()
        .domain(uniqueSites)
        .range([marginLeft, width - marginRight])

    const yScale = d3
        .scaleBand()
        .domain(amino_acids)
        .range([marginTop, height - marginBottom])

    // Set colors for antibody escape. Floor sensitizing mutations to reduce influence on color scale
    const minEscape = Math.min(...allCombinationsComplete.value.map(d => d.escape), -10);
    const maxEscape = Math.max(...allCombinationsComplete.value.map(d => d.escape), 1);
    const colorScale = d3.scaleDiverging([minEscape, 0, maxEscape], d3.interpolateRdBu);

    // Draw rectangles using filtered data
    svgElement
        .selectAll('.heatmap-cell')
        .data(filteredData.value)
        .enter()
        .append('rect')
        .attr('class', 'heatmap-cell')
        .attr('x', d => xScale(d.site))
        .attr('y', d => yScale(d.mutant))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('stroke', 'white')
        .attr('stroke-width', 0.75)
        .attr('fill', d => (d.escape === null || d.effect < -2.5) ? '#d3d3d3' : colorScale(d.escape))
        .on('mouseover', (event, d) => {
            tooltip.value.showTooltip(event);
            tooltipData.value = [
                { label: 'Wildtype', value: d.wildtype },
                { label: 'Site', value: d.site },
                { label: 'Mutant', value: d.mutant },
                { label: 'Escape', value: d.escape !== null ? d.escape.toFixed(1) : 'N/A' },
                { label: 'Cell Entry', value: d.effect !== null ? d.effect.toFixed(1) : 'N/A' },
                { label: 'Times Seen', value: d.times_seen !== null ? d.times_seen : 'N/A' },
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
        });

    // Plot wildtype sites using filtered data
    svgElement
        .selectAll('.wildtype-square')
        .data(filteredWildtypeData.value)
        .enter()
        .append('rect')
        .attr('class', 'wildtype-square')
        .attr('x', d => xScale(d.site))
        .attr('y', d => yScale(d.wildtype))
        .attr('width', xScale.bandwidth())
        .attr('height', yScale.bandwidth())
        .attr('fill', 'white')
        .on('mouseover', (event, d) => {
            tooltip.value.showTooltip(event);
            tooltipData.value = [
                { label: 'Site', value: d.site },
                { label: 'Wildtype', value: d.wildtype },
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
        });

    svgElement
        .selectAll('.wildtype-marker')
        .data(filteredWildtypeData.value)
        .enter()
        .append('text')
        .attr('class', 'wildtype-marker')
        .attr('x', d => xScale(d.site) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.wildtype) + yScale.bandwidth() / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .style('font-size', '4px')
        .style('fill', 'black')
        .text('X')
        .style('pointer-events', 'none');


    // Add axes
    svgElement
        .append('g')
        .attr('transform', `translate(0, ${height - marginBottom})`)
        .call(d3.axisBottom(xScale).tickSize(2).tickSizeOuter(0))
        .call(g => g.select('.domain').remove())
        .attr('stroke-width', 0.5)
        .selectAll('text')
        .attr('transform', 'rotate(-90)')
        .attr('dx', '-0.5em')
        .attr('dy', '-0.7em')
        .style('text-anchor', 'end')
        .style('font-size', '5px');

    svgElement
        .append('g')
        .attr('transform', `translate(${marginLeft}, 0)`)
        .call(d3.axisLeft(yScale).tickSize(2).tickSizeOuter(0))
        .call(g => g.select('.domain').remove())
        .attr('stroke-width', 0.5)
        .selectAll('text')
        .attr('dx', '0em')
        .attr('text-anchor', 'middle')
        .style('font-size', '5px');

    svgElement
        .append('text')
        .attr('class', 'axis-title-x')
        .attr('x', (width) / 2)
        .attr('y', height - 10)
        .attr('font-size', '5px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('text-align', 'center')
        .attr('fill', 'currentColor')
        .text('Site');

    svgElement
        .append('text')
        .attr('class', 'axis-title-y')
        .attr('x', -55)
        .attr('y', 15)
        .attr('font-size', '5px')
        .attr('transform', `rotate(-90)`)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('text-align', 'center')
        .attr('fill', 'currentColor')
        .text('Amino Acid');
}
</script>