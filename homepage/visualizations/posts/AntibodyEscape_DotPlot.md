---
title: Antibody Escape Dot Plot
date: 2025-01-01
subtext: Hover over points to get more information.
thumbnail: /thumbnails/AntibodyDotPlot.png
keyword: "Antibody Escape"
---

<script setup>
  import AntibodyEscapeDotPlot from '/main/figures/AntibodyEscapeDotPlot.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>




<D3PlotContainer class="">
  <AntibodyEscapeDotPlot/>
</D3PlotContainer>


<div class='code-below-figure'>

# Code
<<< @/main/figures/AntibodyEscapeDotPlot.vue
</div>