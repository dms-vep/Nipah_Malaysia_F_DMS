<template>
    <svg ref="svgContainer" id="svgContainer"></svg>
</template>

<script setup>
// import necessary modules
import { ref, onMounted, onUnmounted} from 'vue';
import * as d3 from 'd3';
import { withBase } from 'vitepress';

// define reactive variables
const allBinnedData = ref(new Map()); // Map to hold binned data for all amino acids
const selectedAminoAcid = ref('S'); // Currently selected amino acid for display
const isAnimating = ref(false); // Animation state
const animationDuration = ref(1500); // milliseconds
let animationInterval = null; // Interval ID for animation
let svgElement = null;
let xScale = null;
let yScale = null;
let yAxisGroup = null;
let barsGroup = null;
let labelText = null;

// define dimensions
const marginTop = 30;
const marginRight = 50;
const marginBottom = 50;
const marginLeft = 40;
const width = 600;
const height = 300;

// define non-reactive variables
const uniqueAminoAcids = ref([
    'R', 'K', 'H', 'D', 'E', 'Q', 'N', 'S', 'T', 'Y',
    'W', 'F', 'A', 'I', 'L', 'M', 'V', 'G', 'P', 'C',
]);

// Color scale for amino acids
const aminoAcidColorScale = d3.scaleOrdinal()
    .domain(uniqueAminoAcids.value)
    .range(d3.schemeTableau10);


// load data
const dataFile = withBase('/data/Nipah_F_func_effects_filtered.csv');
let data = [];
const fetchData = async () => {
    try {
        data = await d3.csv(dataFile, (d) => ({
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            effect: +d.effect,
        }));
        return data;
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
};

// process data after loading
onMounted(async () => {
    await fetchData();
    processAllData();
    initializeChart();
    updateHistogram(false); // Initial draw without animation
    startAnimation();
});

onUnmounted(() => {
    stopAnimation();
});

function processAllData() {
    const groupedData = d3.group(data, d => d.mutant);
    const allEffects = data.map(d => d.effect);
    const globalExtent = d3.extent(allEffects);

    const bin = d3.bin()
        .domain(globalExtent)
        .thresholds(20);

    groupedData.forEach((values, mutant) => {
        const effects = values.map(d => d.effect);
        allBinnedData.value.set(mutant, bin(effects));
    });
    console.log(allBinnedData.value);
}

function initializeChart() {
    const svg = d3.select("#svgContainer");

    svgElement = svg
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g');

    // Create persistent scales
    xScale = d3.scaleLinear()
        .domain([-4, 0.5])
        .range([marginLeft, width - marginRight]);

    yScale = d3.scaleLinear()
        .range([height - marginBottom, marginTop]);

    // Create persistent groups for bars
    barsGroup = svgElement.append('g')
        .attr('class', 'bars');

    // Add x-axis (static)
    svgElement.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(xScale).ticks(4).tickSizeOuter(0))
        .call((g) => g.select(".domain").remove())
        .call((g) => g.append("text")
            .attr("x", width / 2)
            .attr("y", marginBottom - 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "middle")
            .attr("font-weight", "bold")
            .attr("font-size", "12px")
            .text("Cell Entry Effect"));

    // Create y-axis group (will be updated)
    yAxisGroup = svgElement.append("g")
        .attr("transform", `translate(${marginLeft},0)`);

    yAxisGroup.append("text")
        .attr("x", 0 - marginLeft)
        .attr("y", marginTop - 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("font-size", "12px")
        .text("Count");

    // Create label for current amino acid
    labelText = svgElement.append("text")
        .attr("x", width - marginRight - 10)
        .attr("y", marginTop + 10)
        .attr("text-anchor", "end")
        .attr("font-size", "24px")
        .attr("font-weight", "bold");
}

function updateHistogram(animate = true) {
    const selectedBins = allBinnedData.value.get(selectedAminoAcid.value); // Get binned data for selected amino acid

    if (!selectedBins || !svgElement) return; // Safety check

    const maxCount = d3.max(selectedBins, d => d.length); // Maximum count for y-scale
    const duration = animate ? animationDuration.value : 0; // Transition duration

    // Update y-scale domain
    yScale.domain([0, maxCount * 1.1]).nice();

    // Update y-axis with transition
    const yAxis = d3.axisLeft(yScale)
        .ticks(4)
        .tickFormat(d3.format("d"));

    yAxisGroup
        .transition()
        .duration(duration)
        .call(yAxis)
        .on("start", function () {
            d3.select(this).select(".domain").remove();
        });

    // Data join for bars
    const bars = barsGroup.selectAll("rect")
        .data(selectedBins, (d, i) => i); // Use index as key for stable transitions

    // Exit old bars
    bars.exit()
        .transition()
        .duration(duration / 2)
        .attr("y", yScale(0))
        .attr("height", 0)
        .remove();

    // Enter new bars
    const barsEnter = bars.enter()
        .append("rect")
        .attr("x", d => xScale(d.x0) + 1)
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("y", yScale(0))
        .attr("height", 0)
        .attr("opacity", 0.7);

    // Update all bars (enter + update)
    bars.merge(barsEnter)
        .transition()
        .duration(duration)
        .attr("fill", aminoAcidColorScale(selectedAminoAcid.value))
        .attr("x", d => xScale(d.x0) + 1)
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
        .attr("y", d => yScale(d.length))
        .attr("height", d => yScale(0) - yScale(d.length));

    // Update label with transition
    labelText
        .transition()
        .duration(duration / 2)
        .style("opacity", 0)
        .transition()
        .duration(duration / 2)
        .style("opacity", 1)
        .attr("fill", aminoAcidColorScale(selectedAminoAcid.value))
        .text(`${selectedAminoAcid.value}`);
}


function startAnimation() {
    isAnimating.value = true;
    let currentIndex = uniqueAminoAcids.value.indexOf(selectedAminoAcid.value);

    animationInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % uniqueAminoAcids.value.length;
        selectedAminoAcid.value = uniqueAminoAcids.value[currentIndex];
        updateHistogram(true);
    }, animationDuration.value + 750); // Add pause between transitions
}

function stopAnimation() {
    isAnimating.value = false;
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
}
</script>