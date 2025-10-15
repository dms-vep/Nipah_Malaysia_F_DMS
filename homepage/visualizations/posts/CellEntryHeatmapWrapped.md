---
title: Static Cell Entry Heatmap
date: 2025-01-10
subtext: Focus on specific sites or change the visualization parameters.
thumbnail: /thumbnails/heatmap.png
keyword: "Cell Entry"
---

<script setup>
import CellEntryHeatmapWrapped from '/main/figures/CellEntryHeatmapWrapped.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>
<CellEntryHeatmapWrapped />

<div class='code-below-figure'>

# Code

<<< @/main/figures/CellEntryHeatmapWrapped.vue

</div>