<template>
        <svg ref="svgContainer"></svg>
</template>

<script setup>
import { ref, onMounted, onUnmounted, shallowRef} from 'vue';
import * as d3 from 'd3';
import { withBase } from 'vitepress';

// REACTIVE VARIABLES
const svgContainer = shallowRef(null);

// D3 CONFIGURATION
const width = 600;
const height = 300;
const marginTop = 20;
const marginRight = 20;
const marginBottom = 20;
const marginLeft = 20;
const innerWidth = width - marginLeft - marginRight;
const innerHeight = height - marginTop - marginBottom;
const aminoAcids = ['R', 'K', 'H', 'D', 'E', 'Q', 'N', 'S', 'T', 'Y', 'W', 'F', 'A', 'I', 'L', 'M', 'V', 'G', 'P', 'C'];

const t = 2000; // Transition duration
const t_type = d3.easePoly; // Transition type
const animationSpeed = 2500; // Time between animations

// LOAD DATA
const dataFile = withBase('/data/Nipah_F_func_effects_filtered.csv');
let data = [];
let g = null;
let currentSite = 29;

const fetchData = async () => {
    try {
        const rawData = await d3.csv(dataFile);

        const dataBysite = new Map();

        rawData.forEach(d => {
            const site = +d.site;
            const record = {
                site: site,
                wildtype: d.wildtype,
                mutant: d.mutant,
                effect: parseFloat(d.effect),
            };

            if (!dataBysite.has(site)) {
                dataBysite.set(site, []);
            }
            dataBysite.get(site).push(record);
        });
        return dataBysite;
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
};

// Initialize visualization
onMounted(async () => {
    data = await fetchData();
    
    const svg = d3.select(svgContainer.value)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .append('g')
    
    g = svg.append('g')
        .attr('transform', `translate(${marginLeft}, ${marginTop})`);

    const siteData = data.get(currentSite);
    updateVisualization(siteData);
    
    // Start animation
    d3.interval(() => {
            currentSite = currentSite + 1;
            const newSiteData = data.get(currentSite);
            updateVisualization(newSiteData);
    }, animationSpeed);

});


const x = d3.scaleBand()
    .domain(aminoAcids)
    .range([0, innerWidth])
    .padding(0.1);

const y = d3.scaleLinear()
    .domain([-3.75, 1])
    .range([innerHeight, 0]);

const colorScale = d3.scaleDiverging()
    .domain([-3.5, 0, 0.1]) // [positive, neutral, negative]
    .interpolator(d3.interpolateRdBu)

// Update visualization when data or site changes
const updateVisualization = (siteData) => {
    
    
    // Update mutants
    const mutant = g.selectAll('.mutant-letter')
        .data(siteData, d => d.mutant);

    // Remove old mutant
    mutant.exit()
        .transition()
        .ease(t_type)
        .duration(t/2)
        .attr('opacity', 0)
        .remove();

    // Add new mutants
    const mutantsEnter = mutant.enter()
        .append('text')
        .attr('class', 'mutant-letter')
        .attr('x', d => x(d.mutant))
        .attr('opacity', 0)
        .attr('y', d => d.effect >= 0 ? y(d.effect) : y(0))
        .style('fill', d => colorScale(d.effect))
        .attr('font-size', '24px')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr('text-align', 'center')
        .text(d => d.mutant)

    // Update all mutants
    mutant.merge(mutantsEnter)
        .transition()
        .ease(t_type)
        .duration(t)
        .attr('x', d => x(d.mutant))
        .attr('opacity', 1)
        .attr('y', d => Math.abs(y(d.effect) - y(1)))
        .style('fill', d => colorScale(d.effect))
        .text(d => d.mutant);

    // Update wildtype
    const currentWildtype = siteData[0].wildtype;
    const wildtypeData = [currentWildtype];

    const wildtype = g.selectAll('.wildtype-letter')
        .data(wildtypeData, d => d);

    // Remove old wildtype
    wildtype.exit()
        .transition()
        .ease(t_type)
        .duration(t/3)
        .attr('opacity', 0)
        .remove();

    // Add new wildtypes
    const wildtypeEnter = wildtype.enter()
        .append('text')
        .attr('class', 'wildtype-letter')
        .attr('x', x(currentWildtype))
        .attr('opacity', 0.2)
        .attr('y', y(0))
        .style('fill', 'currentColor')
        .attr('text-anchor', 'middle')
        .attr('text-align', 'center')
        .attr('font-size', '24px')
        .attr('font-weight', 'bold')
        .text(d => d)

    // Update all wildtypes
    wildtype.merge(wildtypeEnter)
        .transition()
        .ease(t_type)
        .duration(t)
        .attr('x', x(currentWildtype))
        .attr('opacity', 1)
        .attr('font-size', '24px')
        .style('fill', 'currentColor')
        .text(d => d);

    const siteText = g.selectAll('.site-text')
        .data([siteData[0]], d => d.wildtype + d.site);
    
    siteText.exit().transition()
        .ease(t_type)
        .duration(t/3)
        .attr('opacity', 0)
        .remove();

    const siteTextEnter = siteText.enter()
        .append('text')
        .attr('class', 'site-text')
        .attr('x', d => x(d.wildtype))
        .attr('y', y(0.5))
        .attr('text-anchor', 'middle')
        .attr('text-align', 'center')
        .attr('font-size', '16px')
        .attr('fill', 'currentColor')
        .attr('opacity', 0)
        .merge(siteText)
        .text(d => `${d.site}`);

    siteText.merge(siteTextEnter)
        .transition()
        .ease(t_type)
        .duration(t/5)
        .attr('x', d => x(d.wildtype))
        .attr('opacity', 1)
        .text(d => `${d.site}`);
};

onUnmounted(() => {
    // Remove all transitions to prevent memory leaks
    if (g) {
        g.selectAll('*').interrupt();
    }
});
</script>

<style scoped>
</style>