---
title: Lentivirus Genome
date: 2025-01-01
subtext: Schematic of lentivirus genome used for deep mutational scanning
thumbnail: /thumbnails/LentiGenome.png
---

<script setup>
  import LentiGenome from '/main/figures/Lentivirus_Genome.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>
<D3PlotContainer class="">
  <LentiGenome />
</D3PlotContainer>


<div class='code-below-figure'>

# Code

<<< @/main/figures/Lentivirus_Genome.vue

</div>