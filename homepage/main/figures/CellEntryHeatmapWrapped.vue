<template>
    <div class="flex flex-row">
        <section class="max-w-[250px] my-4 flex-col">
            <sidebar class='text-sm'>
                <template #title>Heatmap Options</template>
                <template #content>
                    <!-- Add the sidebar content here -->
                    <label class="label-select">Enter Specific Sites:</label>
                    <input class="form-input" @input="siteInputValue = $event.target.value"
                        placeholder="e.g., 30-35,42" />
                    <button class="btn-primary" @click="selectedSites = parseSites(siteInputValue)">Update
                        Sites</button>
                    <label class="label-select">Select Color Scale:</label>
                    <select class="form-select" v-model="selectedColorScale">
                        <option value="RdBu">Red-Blue</option>
                        <option value="BrBG">Brown-Green</option>
                        <option value="PRGn">Purple-Green</option>
                        <option value="PiYG">Pink-Yellow-Green</option>
                        <option value="PuOr">Purple-Orange</option>
                        <option value="Spectral">Spectral</option>
                    </select>
                    <label class="label-select">Select minimum times seen:</label>
                    <select class="form-select" v-model="minTimesSeen">
                        <option v-for="option in timesSeenOptions" :value="option" :key="option">{{ option }}</option>
                    </select>
                    <label class="label-select">Select Number of Rows:</label>
                    <select class="form-select" v-model="rows">
                        <option v-for="option in rowOptions" :value="option" :key="option">{{ option }}</option>
                    </select>
                    <label class="label-select">Select WT Amino Acid:</label>
                    <select class="form-select" v-model="selectedAminoAcid">
                        <option value="">All</option>
                        <option v-for="acid in amino_acids" :value="acid" :key="acid">{{ acid }}</option>
                    </select>
                    <label class="label-select">Select Effect Filter:</label>
                    <select class="form-select" v-model="selectedEffectFilter">
                        <option value="">All</option>
                        <option value="negative">Highly constrained sites</option>
                    </select>
                </template>
            </sidebar>
        </section>
        <main class="px-2">
            <svg id="svgContainer" ref="svgContainer"></svg>
            <svg id="legend" viewBox="0 0 500 60" style="width: 400px; height: 60px; display: block; "></svg>
        </main>
        <Tooltip ref="tooltip" :data="tooltipData" />
    </div>
</template>

<script setup>
import { ref, watch, computed, shallowRef, onMounted } from 'vue';
import * as d3 from 'd3';
import sidebar from '/main/components/sidebar.vue';
import Tooltip from '/main/components/simpleTooltip.vue';
import { Legend } from '/main/utilities/legend.js';
import { withBase } from 'vitepress';


// DEFINE REACTIVE VARIABLES
const processedData = shallowRef(null);
const tooltip = ref(null);
const tooltipData = ref([]);

// sidebar inputs
const siteInputValue = shallowRef('');
const selectedSites = shallowRef([]);
const selectedColorScale = shallowRef('RdBu');
const rows = shallowRef(4);
const selectedAminoAcid = shallowRef('');
const selectedEffectFilter = shallowRef('');
const minTimesSeen = shallowRef(2);

// sidebar dropdown options
const rowOptions = [1, 2, 3, 4, 5, 6];
const timesSeenOptions = [2, 3, 4, 5, 6,7,8,9,10];

// graphing defaults
const minColor = -4;
const maxColor = 2;
const margin = { top: 20, right: 20, bottom: 50, left: 50 }; // margin for the SVG
const rowPadding = 35; // amount of padding between the rows
const squareSize = 10; // size of each square in the heatmap

// normal variables
const amino_acids = [
    'R',
    'K',
    'H',
    'D',
    'E',
    'Q',
    'N',
    'S',
    'T',
    'Y',
    'W',
    'F',
    'A',
    'I',
    'L',
    'M',
    'V',
    'G',
    'P',
    'C',
];

// input data file
const dataFile = withBase('/data/Nipah_F_func_effects_filtered.csv');

// Data storage variables
let data = [];
let dataLookup = {};
let wildtypeLookup = {};
let siteEffectsMap = new Map();


const fetchData = async () => {
    try {
        data = await d3.csv(dataFile, (d) => ({
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            effect: +d.effect,
            times_seen: +d.times_seen,
        }));
        return data;
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
};
// Run the code when the component is mounted
onMounted(async () => {
    data = await fetchData();
    processedData.value = data;
    processData(data)
});

const processData = (data) => {
    dataLookup = {};
    wildtypeLookup = {};
    siteEffectsMap.clear();

    data.forEach(d => {
        const site = +d.site;
        const effect = +d.effect;

        // Build lookup tables
        dataLookup[`${site}-${d.mutant}`] = d;
        wildtypeLookup[site] = d.wildtype;

        // Track effects per site for filtering
        if (!siteEffectsMap.has(site)) {
            siteEffectsMap.set(site, []);
        }
        siteEffectsMap.get(site).push(effect);
    });
};

// Function to parse sites entered by the user
function parseSites(input) {
    const ranges = input.split(',').map((s) => s.trim());
    let sites = [];
    ranges.forEach((range) => {
        if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);
            sites = sites.concat(Array.from({ length: end - start + 1 }, (_, i) => start + i));
        } else {
            sites.push(Number(range));
        }
    });
    return sites;
}

// Function to update sites based on user input
const filteredSites = computed(() => {
    let sites = Array.from(siteEffectsMap.keys()).sort((a, b) => a - b);

    // Filter by selected wildtype amino acid
    if (selectedAminoAcid.value) {
        sites = sites.filter(site => wildtypeLookup[site] === selectedAminoAcid.value);
    }

    // Filter sites that are mainly negative effects for all mutations
    if (selectedEffectFilter.value === 'negative') {
        sites = sites.filter(site => {
            const effects = siteEffectsMap.get(site)
            return effects.every(effect => effect <= -0.5);
        });
    }

    // Only show sites entered in box
    if (selectedSites.value.length > 0) {
        sites = sites.filter(site => selectedSites.value.includes(site));
    }

    return sites;
});

const siteRows = computed(() => {
    const sites = filteredSites.value;
    if (sites.length === 0) return [];

    // Single row for filtered views
    if (selectedAminoAcid.value || selectedEffectFilter.value || selectedSites.value.length > 0) {
        return [sites];
    }

    // Multiple rows for full view
    const sitesPerRow = Math.ceil(sites.length / rows.value);
    return Array.from({ length: rows.value }, (_, i) =>
        sites.slice(i * sitesPerRow, (i + 1) * sitesPerRow)
    );
});

// Color scale
const colorScaleMap = {
    'RdBu': d3.interpolateRdBu,
    'BrBG': d3.interpolateBrBG,
    'PRGn': d3.interpolatePRGn,
    'PiYG': d3.interpolatePiYG,
    'PuOr': d3.interpolatePuOr,
    'Spectral': d3.interpolateSpectral
};

// Vue function to update the heatmap when the data or settings change
watch([processedData, rows, selectedSites, selectedAminoAcid, selectedColorScale, selectedEffectFilter, minTimesSeen], () => {
    updateHeatmap();
});

// Main function to draw the heatmap
function updateHeatmap() {

    // calculate some graphing parameters based on the data
    const maxSitesInRow = Math.max(...siteRows.value.map((row) => row.length));
    const innerWidth = squareSize * maxSitesInRow;
    const totalRows = siteRows.value.length;
    const height = squareSize * amino_acids.length * totalRows + margin.top + margin.bottom + (totalRows - 1) * rowPadding + margin.bottom;
    const width = innerWidth + margin.left + margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select("#svgContainer");
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scaleBand()
        .domain(Array.from({ length: maxSitesInRow }, (_, i) => i))
        .range([0, innerWidth]);

    const yScale = d3.scaleBand()
        .domain(amino_acids)
        .range([0, squareSize * amino_acids.length])

    const color = d3.scaleDiverging(colorScaleMap[selectedColorScale.value])
        .domain([minColor, 0, maxColor]);

    //Plot heatmap squares by row for wrapping
    siteRows.value.forEach((siteRow, rowIndex) => {
        const rowOffset = (yScale.range()[1] + rowPadding) * rowIndex;
        const rowG = g.append('g')
            .attr('transform', `translate(0,${rowOffset})`);

        // Create data for all possible mutants/sites in this row
        const rectData = [];
        siteRow.forEach((site, siteIndex) => {
            amino_acids.forEach(mutant => {
                rectData.push({ site, mutant, siteIndex });
            });
        });

        // Draw rectangles
        rowG.selectAll('rect')
            .data(rectData)
            .join('rect')
            .attr('x', d => xScale(d.siteIndex))
            .attr('y', d => yScale(d.mutant))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('fill', d => {
                const key = `${d.site}-${d.mutant}`;
                const dataPoint = dataLookup[key];
                if (dataPoint) {
                    return (dataPoint.times_seen < minTimesSeen.value) ? 'lightgray' : color(dataPoint.effect);
                }
                return wildtypeLookup[d.site] === d.mutant ? 'white' : 'lightgray';
            })
            .on('mouseover', function (event, d) {
                const key = `${d.site}-${d.mutant}`;
                const dataPoint = dataLookup[key];

                if (dataPoint) {
                    tooltip.value.showTooltip(event);
                    tooltipData.value = [
                        { label: 'Wildtype', value: dataPoint.wildtype },
                        { label: 'Site', value: dataPoint.site },
                        { label: 'Mutant', value: dataPoint.mutant },
                        { label: 'Effect', value: dataPoint.effect },
                        { label: 'Times Seen', value: dataPoint.times_seen }
                    ];
                }
                else {
                    tooltip.value.showTooltip(event);
                    tooltipData.value = [
                        { label: 'Wildtype', value: wildtypeLookup[d.site] },
                        { label: 'Site', value: d.site },
                        { label: 'Mutant', value: d.mutant },
                        { label: 'Effect', value: 'N/A' },
                        { label: 'Times Seen', value: 0 }
                    ];
                }
            })
            .on('mousemove', (event) => {
                if (tooltip.value?.updatePosition) {
                    tooltip.value.updatePosition(event);
                }
            })
            .on('mouseout', () => {
                tooltip.value.hideTooltip();
                tooltipData.value = [];
            });

        // Draw wildtype X markers
        rowG.selectAll('.wildtype')
            .data(siteRow)
            .join('text')
            .attr('class', 'wildtype')
            .attr('x', (d, i) => xScale(i) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(wildtypeLookup[d]) + yScale.bandwidth() / 2 + 3)
            .attr('text-anchor', 'middle')
            .attr('font-size', '8px')
            .attr('pointer-events', 'none')
            .text('X');

        // Add the site numbers to the x-axis, only plotting every 10 sites
        const xAxis = d3.axisBottom(xScale).tickSizeOuter(0);
        if (selectedSites.value.length > 0 || selectedAminoAcid.value || selectedEffectFilter.value) {
            xAxis.tickFormat((d) => siteRow[d]);
        } else {
            xAxis.tickFormat((d, i) => (i % 10 === 0 ? siteRow[d] : ''));
        }

        // ADD THE X AND Y AXES
        // Add the site numbers to the x-axis
        rowG.append('g')
            .attr('transform', `translate(0,${yScale.range()[1]})`)
            .call(xAxis)
            .call(g => g.select('.domain').remove()) // Remove the axis line
            .selectAll('text')
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'end')
            .attr('dx', '-8px')
            .attr('dy', '-5px')
            .attr('font-size', '10px');

        // Y axis
        rowG.append('g')
            .call(d3.axisLeft(yScale).tickSizeOuter(0))
            .call(g => g.select('.domain').remove())
            .attr('font-size', '10px');


    });
    // Add the row title
    g.append('text')
        .attr('class', 'axis-title-x')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('text-align', 'center')
        .attr('fill', 'currentColor')
        .text('Site');

    // Add the column title
    g.append('text')
        .attr('class', 'axis-title-y')
        .attr('x', -innerHeight / 2 + 20)
        .attr('y', 0 - 30)
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'currentColor')
        .text('Amino Acid');

    d3.select('#legend').selectAll('*').remove();
    Legend(d3.scaleDiverging([minColor, 0, maxColor], colorScaleMap[selectedColorScale.value]).clamp(true), {
        svgRef: '#legend',
        title: 'Cell Entry',
        width: 100,
        tickValues: [minColor, 0, maxColor],
        xcoord: margin.left,
        ycoord: -10,
        fontSize: 12,

    });
}


</script>
