---
title: Antibody Escape Heatmaps
date: 2025-01-10
subtext: Switch between different antibodies to see how mutations affect neutralization.
keyword: "Antibody Escape"
thumbnail: /thumbnails/AntibodyEscapeHeatmap.png
---

<script setup>
  import AntibodyEscapeHeatmaps from '/main/figures/AntibodyEscapeHeatmaps.vue';
</script>


<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>
<D3PlotContainer class="">
    <AntibodyEscapeHeatmaps/>
</D3PlotContainer>


<div class='code-below-figure'>

# Code

<<< @/main/figures/AntibodyEscapeHeatmaps.vue

</div>