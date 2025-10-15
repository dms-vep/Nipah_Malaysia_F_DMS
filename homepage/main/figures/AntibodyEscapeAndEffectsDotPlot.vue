<template>
    <!-- Checkbox -->
    <input type="checkbox" v-model="showEffects" />
    Switch between escape and cell entry effects
    <svg ref="svgContainer" id="svgContainerEscapeAndEffectsDotPlot"></svg>
    <Tooltip ref="tooltip" :data="tooltipData" />
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import * as d3 from "d3";
import Tooltip from "../components/simpleTooltip.vue";
import { withBase } from "vitepress";

// variables and constants
const tooltip = ref(null);
const tooltipData = ref([]);
const showEffects = ref(false);
const dataPath = withBase("/data/all_antibodies_escape_filtered.csv");

// Set dimensions and margins
const width = 400;
const height = 300;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 50;
const marginLeft = 50;

// color scales and jitter
const colorScaleEscape = d3
    .scaleSequential(d3.interpolatePurples)
    .domain([0, 4]); 
const colorScaleEffect = d3
    .scaleDiverging()
    .domain([-3, 0, 1])
    .interpolator(d3.interpolateRdBu);
const jitterAmount = 0.75;

// references to axes groups for transitions
let xAxisGroup = null;
let yAxisGroup = null;
let svg = null;
let yAxisLabel = null;

// data storage
let array = [];
let finalArray = [];

onMounted(async () => {
    svg = d3
        .select("#svgContainerEscapeAndEffectsDotPlot")
        .attr("viewBox", `0 0 ${width} ${height}`);

    xAxisGroup = svg
        .append("g")
        .attr("transform", `translate(0,${height - marginBottom})`);

    yAxisGroup = svg.append("g").attr("transform", `translate(${marginLeft},0)`);

    // axis labels
    svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height - 10)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "currentColor")
        .text("Antibody");

    yAxisLabel = svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", -135)
        .attr("text-anchor", "middle")
        .attr("font-size", "14px")
        .attr("font-weight", "bold")
        .attr("fill", "currentColor")
        .text("Escape");
});

const fetchData = async () => {
    try {
        array = await d3.csv(dataPath, (d) => ({
            antibody: d.antibody,
            site: +d.site,
            wildtype: d.wildtype,
            mutant: d.mutant,
            escape: +d.escape_mean,
            times_seen: +d.times_seen,
            effect: +d.effect,
        }));

        finalArray = array.filter((d) => d.effect >= -2.5 && d.escape >= 0.5);
        updatePlot(finalArray);
    } catch (error) {
        console.error("Error loading CSV data:", error);
    }
};
fetchData();

// Add a watcher for showEffects
watch(showEffects, () => {
    if (array.length > 0) {
        updatePlot(finalArray);
    }
});

// Main graphing function
const updatePlot = (inputData) => {
    // Create scales
    const xScale = d3
        .scaleBand()
        .domain([...new Set(inputData.map((d) => d.antibody))])
        .range([marginLeft, width - marginRight])
        .padding(0.3);

    // Dynamic y-scale based on showEffects
    const yScale = d3
        .scaleLinear()
        .domain(
            showEffects.value
                ? [
                    d3.min(inputData, (d) => d.effect),
                    d3.max(inputData, (d) => d.effect),
                ]
                : [
                    d3.min(inputData, (d) => d.escape),
                    d3.max(inputData, (d) => d.escape),
                ]
        )
        .range([height - marginBottom, marginTop]);

    function jitteredX(antibody) {
        const bandCenter = xScale(antibody) + xScale.bandwidth() / 2;
        const jitterRange = xScale.bandwidth() * jitterAmount;
        const jitter = (Math.random() - 0.5) * jitterRange;
        return bandCenter + jitter;
    }

    // Update x-axis
    xAxisGroup
        .transition()
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .selectAll("text")
        .attr("font-size", "14px")
        .attr("text-anchor", "middle")
        .attr("text-baseline", "end")
        .attr("dy", "0.6em");

    // Update y-axis
    yAxisGroup
        .transition()
        .duration(2000)
        .ease(d3.easePoly)
        .call(d3.axisLeft(yScale).ticks(4).tickSizeOuter(0))
        .selectAll("text")
        .attr("font-size", "14px")
        .attr("text-anchor", "end")
        .attr("dy", "0.3em");

    // Update y-axis label
    yAxisLabel
        .transition()
        .duration(2000)
        .ease(d3.easePoly)
        .text(showEffects.value ? "Effect on cell entry" : "Antibody escape");

    // Update circles with stored positions
    const circles = svg
        .selectAll("circle")
        .data(inputData, (d) => `${d.antibody}-${d.site}-${d.mutant}`); // Add key function for proper data binding

    circles.join(
        (enter) =>
            enter
                .append("circle")
                .attr("class", "data-point")
                .attr("cx", function (d) {
                    const x = jitteredX(d.antibody);
                    d3.select(this).attr("data-x", x); // Store the jittered position
                    return x;
                })
                .attr("cy", (d) => yScale(showEffects.value ? d.effect : d.escape))
                .attr("r", 4)
                .attr("fill", (d) =>
                    showEffects.value
                        ? colorScaleEffect(d.effect)
                        : colorScaleEscape(d.escape)
                )
                .attr("stroke", "currentColor")
                .attr("stroke-width", 0.5)
                .call((enter) =>
                    enter.transition().duration(2000).ease(d3.easePoly).attr("opacity", 1)
                ),
        (update) =>
            update.call((update) =>
                update
                    .transition()
                    .duration(2000)
                    .ease(d3.easePoly)
                    .attr("cy", (d) => yScale(showEffects.value ? d.effect : d.escape))
                    .attr("fill", (d) =>
                        showEffects.value
                            ? colorScaleEffect(d.effect)
                            : colorScaleEscape(d.escape)
                    )
            ),
        (exit) => exit.transition().duration(1000).attr("opacity", 0).remove()
    );
    // Set up hover effects after creating/updating all circles
    const allCircles = svg.selectAll(".data-point");
    const { handleMouseOver, handleMouseMove, handleMouseOut } =
        createHoverEffects(allCircles);

    allCircles
        .on("mouseover", handleMouseOver)
        .on("mousemove", handleMouseMove)
        .on("mouseout", handleMouseOut);
};
const getTooltipData = (d) => [
    { label: "Wildtype", value: d.wildtype },
    { label: "Site", value: d.site },
    { label: "Cell Entry", value: d.effect.toFixed(1) },
    { label: "Escape", value: d.escape.toFixed(1) },
    { label: "Times Seen", value: d.times_seen },
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
                .attr("r", isHoveredElement ? 5 : 4);
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

        selection.transition().duration(200).attr("r", 4);
    };

    return { handleMouseOver, handleMouseMove, handleMouseOut };
};
</script>