---
title: Effects of Nipah F Mutations on Cell Entry
date: 2025-01-09
subtext: Heatmap is zoomable and draggable inside container.
thumbnail: /thumbnails/heatmap_zoomed.png
keyword: "Cell Entry"
---

<script setup>
  import CellEntryHeatmapWrappedZoomable from '/main/figures/CellEntryHeatmapWrappedZoomable.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>

<div class ="prose"> The color of the cell indicates the effect of the mutation on cell entry, with red indicating a strong negative effect. The unmutated residue is indicated with a black 'X', and missing residues are shown in gray. Hover over the heatmap squares to get more information. </div>

<D3PlotContainer class="">
  <CellEntryHeatmapWrappedZoomable />
</D3PlotContainer>

<div class='code-below-figure'>

# Code

<<< @/main/figures/CellEntryHeatmapWrappedZoomable.vue

</div>