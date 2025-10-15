<template>
    <div class="flex flex-col gap-4 pb-4">
        <!-- Dropdown -->
        <div class="flex flex-row justify-left items-center text-center">
            <label for="antibody-select-1" class="font-bold tracking-tight text-xs lg:text-md mr-4">
                Antibody:
            </label>
            <div class="relative">
                <select id="antibody-select-1" v-model="selectedAntibody" @change="changeDataset"
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
    </div>

    <svg id="svgContainer"></svg>
    <svg id="legend" viewBox="0 0 500 60" style="width: 400px; height: 60px; display: block; "></svg>

    <Tooltip ref="tooltip" :data="tooltipData" />
</template>

<script setup>
import { ref } from 'vue';
import * as d3 from 'd3';
import { withBase } from 'vitepress';
import Tooltip from '../components/simpleTooltip.vue';
import { Legend } from '../utilities/legend.js';

// reactive state variables
const uniqueAntibodies = ref([]); // list of available antibodies
const selectedAntibody = ref('12B2'); // currently selected antibody
const tooltip = ref(null); // reference to the tooltip component
const tooltipData = ref([]); // data to show in the tooltip
const rows = ref(5); // number of rows to wrap the heatmap
const min_func_effect = -2.5; // minimum effect threshold for coloring

// plot layout constants
const margin = { top: 20, right: 20, bottom: 60, left: 50 }; // margin
const rowPadding = 35; // amount of padding between the rows
const squareSize = 10; // size of each square in the heatmap

// non-reactive constants
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
const interpolator = d3.interpolatePRGn;
const reversedInterpolator = (t) => interpolator(1 - t);


// data file path
const dataFile = withBase('/data/all_antibodies_escape_filtered.csv');

// main data structures
const dataLookupByAntibody = {}; // Nested lookup: antibody -> (site-mutant) -> data
const wildtypeLookupByAntibody = {}; // Nested lookup: antibody -> site -> wildtype
const siteEffectsMapByAntibody = {}; // Nested map: antibody -> site -> [effects]
let processed = {}; // Store processed data by antibody

// Function to fetch and process data
const fetchData = async () => {
    try {
        const data = await d3.csv(dataFile, (d) => ({
            antibody: d.antibody,
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            escape: +d.escape_mean,
            effect: +d.effect,
            times_seen: +d.times_seen,
        }));
        const antibodyGroups = d3.group(data, d => d.antibody); // Group data by antibody
        uniqueAntibodies.value = Array.from(antibodyGroups.keys()).sort(); // Extract and sort antibody names

        // Process each antibody group
        for (const [antibodyKey, antibodyData] of antibodyGroups) {
            processed[antibodyKey] = antibodyData;

            dataLookupByAntibody[antibodyKey] = {};
            wildtypeLookupByAntibody[antibodyKey] = {};
            siteEffectsMapByAntibody[antibodyKey] = new Map();

            // Build lookups
            antibodyData.forEach(d => {
                const site = +d.site;
                dataLookupByAntibody[antibodyKey][`${site}-${d.mutant}`] = d;
                wildtypeLookupByAntibody[antibodyKey][site] = d.wildtype;
                if (!siteEffectsMapByAntibody[antibodyKey].has(site)) {
                    siteEffectsMapByAntibody[antibodyKey].set(site, []);
                }
                siteEffectsMapByAntibody[antibodyKey].get(site).push(d.escape);
            });
        }
        updateHeatmap(selectedAntibody.value);
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
};
fetchData();


// Change dataset handler
const changeDataset = () => {
    if (selectedAntibody.value) {
        updateHeatmap(selectedAntibody.value);
    }
};

// Function to update the heatmap based on the selected antibody
function updateHeatmap(antibodyKey) {

    const dataLookup = dataLookupByAntibody[antibodyKey];
    const wildtypeLookup = wildtypeLookupByAntibody[antibodyKey];
    const siteEffectsMap = siteEffectsMapByAntibody[antibodyKey];

    const sites = Array.from(siteEffectsMap.keys()).sort((a, b) => a - b);

    const sitesPerRow = Math.ceil(sites.length / rows.value);

    const siteRows = Array.from({ length: rows.value }, (_, i) =>
        sites.slice(i * sitesPerRow, (i + 1) * sitesPerRow)
    );

    const totalRows = siteRows.length;

    const maxSitesInRow = Math.max(...siteRows.map((row) => row.length));

    const innerWidth = squareSize * maxSitesInRow;
    const innerHeight = squareSize * amino_acids.length * rows.value +
        rowPadding * (totalRows - 1);
    const width = innerWidth + margin.left + margin.right;
    const height = innerHeight + margin.top + margin.bottom;

    const svg = d3.select('#svgContainer')
        .attr('viewBox', `0 0 ${width} ${height}`);
    
    svg.selectAll('*').remove();

    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define scales
    const xScale = d3.scaleBand()
        .domain(Array.from({ length: maxSitesInRow }, (_, i) => i))
        .range([0, innerWidth]);

    const yScale = d3.scaleBand()
        .domain(amino_acids)
        .range([0, squareSize * amino_acids.length])

    // Define color scale, add floor if needed
    const minColor = d3.min([-1, d3.min(Array.from(siteEffectsMap.values()).flat())]);
    const maxColor = d3.max([1, d3.max(Array.from(siteEffectsMap.values()).flat())]);
    const color = d3.scaleDiverging(reversedInterpolator)
        .domain([0, 0, maxColor]);

    //Plot heatmap squares by row for wrapping
    siteRows.forEach((siteRow, rowIndex) => {
        const rowOffset = (yScale.range()[1] + rowPadding) * rowIndex;
        const rowG = g.append('g')
            .attr('transform', `translate(0,${rowOffset})`);

        // Create data for rectangles
        const rectData = [];
        siteRow.forEach((site, siteIndex) => {
            amino_acids.forEach(mutant => {
                rectData.push({ site, mutant, siteIndex, key: `${site}-${mutant}` });
            });
        });

        const rects = rowG.selectAll('rect')
            .data(rectData, d => d.key);

        rects.enter()
            .append('rect')
            .join(rects)
            .attr('x', d => xScale(d.siteIndex))
            .attr('y', d => yScale(d.mutant))
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('stroke', 'white')
            .attr('stroke-width', 1)
            .attr('fill', d => {
                const dataPoint = dataLookup[d.key];
                if (dataPoint) {
                    return (dataPoint.effect < min_func_effect) ? 'lightgray' : color(dataPoint.escape);
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
                        { label: 'Escape', value: dataPoint.escape.toFixed(1) },
                        { label: 'Cell Entry', value: dataPoint.effect.toFixed(1) },
                        { label: 'Times Seen', value: dataPoint.times_seen }
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
            })
        rects.exit().remove();

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
        xAxis.tickFormat((d, i) => (i % 10 === 0 ? siteRow[d] : ''));


        // ADD THE X AND Y AXES
        // Add the site numbers to the x-axis
        rowG.append('g')
            .attr('transform', `translate(0,${yScale.range()[1]})`)
            .call(xAxis)
            .selectAll('text')
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'end')
            .attr('dx', '-8px')
            .attr('dy', '-5px')
            .attr('font-size', '12px');

        // Y axis
        rowG.append('g')
            .call(d3.axisLeft(yScale).tickSizeOuter(0))
            .attr('font-size', '10px');


    });

    // Add the row title
    g.append('text')
        .attr('class', 'axis-title-x')
        .attr('x', innerWidth / 2)
        .attr('y', height - margin.bottom + 35)
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('text-align', 'center')
        .attr('fill', 'currentColor')
        .text('Site');

    // Add the column title
    g.append('text')
        .attr('class', 'axis-title-y')
        .attr('x', -innerHeight / 2)
        .attr('y', -35)
        .attr('font-size', '20px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('fill', 'currentColor')
        .text('Amino Acid');

    // Legend
    d3.select('#legend').selectAll('*').remove();
    Legend(d3.scaleSequential([0, maxColor], d3.interpolatePurples).clamp(true), {
        svgRef: '#legend',
        title: 'Antibody Escape',
        width: 150,
        tickValues: [0, maxColor],
        xcoord: 20,
        ycoord: 0,
        fontSize: 16,

    });

}
</script>
