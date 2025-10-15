---
title: Effects of Nipah F Mutations on Cell Entry in Windows
date: 2025-01-02
subtext: Explore cell entry data in smaller windows
thumbnail: /thumbnails/CellEntrySlideableHeatmap.png
keyword: "Cell Entry"
---

<script setup>
  import CellEntrySlideableHeatmap from '/main/figures/CellEntrySlideableHeatmap.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>

<div class="prose ">
<p> Looking at the full heatmaps can be overwhelming. Here, the data is condensed into smaller windows. The color of the cell indicates the effect of the mutation on cell entry, with red indicating a strong negative effect. The unmutated residue is indicated with a black 'X', and missing residues are shown in gray. Hover over the heatmap squares to get more information. </p>
</div>

<D3PlotContainer class="max-w-xl">
  <CellEntrySlideableHeatmap />
</D3PlotContainer>


<div class='code-below-figure'>

# Code

<<< @/main/figures/CellEntrySlideableHeatmap.vue

</div>