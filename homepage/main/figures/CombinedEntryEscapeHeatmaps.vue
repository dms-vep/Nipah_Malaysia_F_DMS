<template>
    <!-- Dropdown -->
    <div class="flex flex-row justify-left items-center text-center">
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

    <!-- Site Slider -->
    <!-- Site Slider -->
    <CustomSlider v-for="(slider, index) in sliders" :key="index" :label="slider.label" :min="slider.min"
        :max="slider.max" :step="slider.step" v-model="slider.value" />
    <div class="flex py-8 flex-col items-center gap-0 mb-6">
        <svg id="svgEscape" style="width: 400px;  display: block; "></svg>
        <svg id="svgEntry" style="width: 400px; display: block; "></svg>
    </div>
    <svg id="legendEscape" viewBox="0 0 500 60" style="width: 400px; height: 40px; display: block; "></svg>
    <svg id="legendEntry" viewBox="0 0 500 60" style="width: 400px; height: 40px; display: block; "></svg>
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
const uniqueAntibodies = ref([]);
const selectedAntibody = ref('12B2');

// dimensions
const marginTop = 2;
const marginRight = 20;
const marginBottom = 20;
const marginLeft = 20;
const squareSize = 10;
const range = 10; // Sites to show on each side

// data storage
let allCombinations = [];
let dataMap = new Map();
let svg = null;
let xScale = null;
let yScale = null;
let colorScale = null;

// constants
const amino_acids = ['R', 'K', 'H', 'D', 'E', 'Q', 'N', 'S', 'T', 'Y', 'W', 'F', 'A', 'I', 'L', 'M', 'V', 'G', 'P', 'C'];

// data path
const entryDataFile = withBase('/data/Nipah_F_func_effects_filtered.csv');
const fetchEntryData = async () => {
    try {
        const data = await d3.csv(entryDataFile, (d) => ({
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
        initializeEntryVisualization();
        entryHeatmap();
    } catch (error) {
        console.error('Error loading CSV data:', error);
        return [];
    }
};
fetchEntryData();

const escapeDataFile = withBase('/data/all_antibodies_escape_filtered.csv');
let allCombinationsEscape = [];
const fetchEscapeData = async () => {
    try {
        const escapeData = await d3.csv(escapeDataFile, (d) => ({
            antibody: d.antibody,
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            escape: +d.escape_mean,
            effect: +d.effect,
            times_seen: +d.times_seen,
        }));
        const antibodyGroups = d3.group(escapeData, d => d.antibody);
        console.log('antibodyGroups', antibodyGroups)
        // Get unique antibodies
        uniqueAntibodies.value = Array.from(antibodyGroups.keys()).sort();
        // Create a lookup map for existing data
        // Key: "antibody|site|mutant"
        const existingDataMap = new Map();
        escapeData.forEach(d => {
            const key = `${d.antibody}|${d.site}|${d.mutant}`;
            existingDataMap.set(key, d);
        });

        // Get unique antibody-site combinations with their wildtype
        const antibodySiteMap = new Map();
        escapeData.forEach(d => {
            const key = `${d.antibody}|${d.site}`;
            if (!antibodySiteMap.has(key)) {
                antibodySiteMap.set(key, {
                    antibody: d.antibody,
                    site: d.site,
                    wildtype: d.wildtype
                });
            }
        });

        // Generate all possible combinations
        //const allCombinationsEscape = [];

        antibodySiteMap.forEach(({ antibody, site, wildtype }) => {
            amino_acids.forEach(mutant => {
                const lookupKey = `${antibody}|${site}|${mutant}`;
                const existingData = existingDataMap.get(lookupKey);

                allCombinationsEscape.push({
                    antibody,
                    site,
                    wildtype,
                    mutant,
                    escape: existingData ? existingData.escape : null,
                    effect: existingData ? existingData.effect : null,
                    times_seen: existingData ? existingData.times_seen : null
                });
            });
        });

        // Sort the combinations for consistent ordering
        allCombinationsEscape.sort((a, b) => {
            if (a.antibody !== b.antibody) return a.antibody.localeCompare(b.antibody);
            if (a.site !== b.site) return a.site - b.site;
            return a.mutant.localeCompare(b.mutant);
        });
        initializeEscapeVisualization()
        escapeHeatmap();
        console.log(allCombinationsEscape)
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
};
fetchEscapeData();
let svgEscape;
let xEscapeScale = null;
let yEscapeScale = null;
let colorEscapeScale = null;
function initializeEscapeVisualization() {
    const marginBottomEscape = 10
    // Calculate fixed dimensions
    const uniqueSitesCount = range * 2 + 1; // Always showing same number of sites
    const height = (squareSize * amino_acids.length) + marginTop + marginBottomEscape;
    const width = (squareSize * uniqueSitesCount) + marginLeft + marginRight;
    console.log('width', width)
    console.log('height', height)
    svgEscape = d3.select("#svgEscape")
        .attr('viewBox', `0 0 ${width} ${height}`);

    // Initialize scales (domains will be updated)
    xEscapeScale = d3.scaleBand()
        .range([marginLeft, width - marginRight]);

    yEscapeScale = d3.scaleBand()
        .domain(amino_acids)
        .range([marginTop, height - marginBottomEscape]);

    colorEscapeScale = d3.scaleSequential([0, 3], d3.interpolatePurples);

    // Create axis groups once
    svgEscape.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height - marginBottomEscape})`);

    svgEscape.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${marginLeft}, 0)`);

    
}

function escapeHeatmap() {
    const siteValue = sliders.value[0].value;
    const minSite = siteValue - range;
    const maxSite = siteValue + range;
    const cells = allCombinationsEscape.filter(d => d.site >= minSite && d.site <= maxSite && d.antibody === selectedAntibody.value);

    const uniqueSites = [...new Set(cells.map(d => d.site))];

    xEscapeScale.domain(uniqueSites);

    // Update heatmap cells with data binding
    const escapeSelection = svgEscape.selectAll('.escape-heatmap-cell')
        .data(cells, d => `${d.site}-${d.mutant}`);

    escapeSelection.join(
        enter => {
            const g = enter.append('g')
                .attr('class', 'escape-heatmap-cell');

            // Append rectangle to the group
            g.append('rect')
                .attr('stroke', 'white')
                .attr('stroke-width', 1.5)
                .attr('x', d => xEscapeScale(d.site))
                .attr('y', d => yEscapeScale(d.mutant))
                .attr('width', xEscapeScale.bandwidth())
                .attr('height', yEscapeScale.bandwidth())
                .attr('fill', d => {
                    if (d.effect === null && d.mutant !== d.wildtype) return '#d3d3d3';
                    if (d.mutant === d.wildtype) return 'white';
                    return colorEscapeScale(d.escape);
                });

            // Append text to the group
            g.append('text')
                .attr('x', d => xEscapeScale(d.site) + xEscapeScale.bandwidth() / 2)
                .attr('y', d => yEscapeScale(d.mutant) + yEscapeScale.bandwidth() / 2)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'central')
                .attr('font-size', '8px')
                .attr('fill', 'black')
                .attr('font-weight', 'light')
                .attr('pointer-events', 'none')
                .text(d => d.mutant === d.wildtype ? 'X' : '');

            return g;
        },
        update => {
            update.select('rect')
                .attr('x', d => xEscapeScale(d.site))
                .attr('y', d => yEscapeScale(d.mutant))
                .attr('width', xEscapeScale.bandwidth())
                .attr('height', yEscapeScale.bandwidth())
                .attr('fill', d => {
                    if (d.effect === null && d.mutant !== d.wildtype) return '#d3d3d3';
                    if (d.mutant === d.wildtype) return 'white';
                    return colorEscapeScale(d.escape);
                });
            update.select('text')
                .attr('x', d => xEscapeScale(d.site) + xEscapeScale.bandwidth() / 2)
                .attr('y', d => yEscapeScale(d.mutant) + yEscapeScale.bandwidth() / 2)
                .text(d => d.mutant === d.wildtype ? 'X' : '');
            return update;
        },
        exit => exit.remove()
    );
    const rects = svgEscape.selectAll('.escape-heatmap-cell');
    const { handleMouseOver, handleMouseMove, handleMouseOut } = createHoverEffects(rects);

    rects
        .on('mouseover', handleMouseOver)
        .on('mousemove', handleMouseMove)
        .on('mouseout', handleMouseOut);

    // Update axes
    svgEscape.select('.y-axis')
        .call(d3.axisLeft(yEscapeScale).tickSize(4).tickSizeOuter(0))
        .attr('stroke-width', 1)
        .selectAll('text')
        .attr('dx', '-0.25em')
        .attr('text-anchor', 'middle')
        .style('font-size', '8px');

    d3.select('#legendEscape').selectAll('*').remove();
    Legend(d3.scaleSequential([0, 4], d3.interpolatePurples).clamp(true), {
        svgRef: '#legendEscape',
        title: 'Antibody Escape',
        width: 150,
        tickValues: [0, 2, 4],
        xcoord: 20,
        ycoord: 0,
        fontSize: 16,

    });
}
// Initialize the visualization once
function initializeEntryVisualization() {

    // Calculate fixed dimensions
    const uniqueSitesCount = range * 2 + 1; // Always showing same number of sites
    const height = (squareSize * amino_acids.length) + marginTop + marginBottom;
    const width = (squareSize * uniqueSitesCount) + marginLeft + marginRight;

    svg = d3.select("#svgEntry")
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

}

// Update only the data, not the entire structure
function entryHeatmap() {
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
                .attr('stroke-width', 1.5)
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
                .attr('font-size', '8px')
                .attr('fill', 'black')
                .attr('font-weight', 'light')
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
        .call(d3.axisBottom(xScale).tickSize(4).tickSizeOuter(0))
        .call(g => g.select('.domain').remove()) // Remove axis line
        .attr('stroke-width', 1)
        .selectAll('text')
        .attr('transform', 'rotate(-90)')
        .attr('dx', '-0.7em')
        .attr('dy', '-0.5em')
        .style('text-anchor', 'end')
        .style('font-size', '8px');

    svg.select('.y-axis')
        .call(d3.axisLeft(yScale).tickSize(4).tickSizeOuter(0))
        .attr('stroke-width', 1)
        .selectAll('text')
        .attr('dx', '-0.25em')
        .attr('text-anchor', 'middle')
        .style('font-size', '8px');

    d3.select('#legendEntry').selectAll('*').remove();
    Legend(d3.scaleDiverging([-4, 0, 2], d3.interpolateRdBu).clamp(true), {
        svgRef: '#legendEntry',
        title: 'Cell Entry',
        width: 150,
        tickValues: [-4, 0, 2],
        xcoord: 20,
        ycoord: 0,
        fontSize: 16,

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
    entryHeatmap()
    escapeHeatmap();
});

// Watch the slider value for changes
watch(() => selectedAntibody.value, () => {
    escapeHeatmap();
});
</script>
