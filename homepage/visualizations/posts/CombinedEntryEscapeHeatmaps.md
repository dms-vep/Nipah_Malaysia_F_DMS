---
title: Escape and Entry Slideable Heatmaps
date: 2025-01-01
subtext: Antibody escape and cell entry effects in one combined figure
thumbnail: /thumbnails/CombinedEntryEscapeHeatmaps.png
---

<script setup>
  import CombinedEntryEscapeHeatmaps from '/main/figures/CombinedEntryEscapeHeatmaps.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>
<D3PlotContainer class="">
  <CombinedEntryEscapeHeatmaps />
</D3PlotContainer>


<div class='code-below-figure'>

# Code

<<< @/main/figures/CombinedEntryEscapeHeatmaps.vue

</div>