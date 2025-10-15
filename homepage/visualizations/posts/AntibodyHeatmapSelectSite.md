---
title: Antibody Escape Interactive Heatmap
date: 2025-01-09
subtext: Explore antibody escape data in twenty-residue windows
thumbnail: /thumbnails/SelectAntibody.png
keyword: "Antibody Escape"
---

<script setup>
  import SelectSiteAntibody from '/main/figures/AntibodyHeatmapSelectSite.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>
<D3PlotContainer class="max-w-xl">
  <SelectSiteAntibody />
</D3PlotContainer>


<div class='code-below-figure'>

# Code

<<< @/main/figures/AntibodyHeatmapSelectSite.vue

</div>