---
title: Antibody Escape Line Plot
date: 2025-01-02
subtext: Aggregate antibody escape data across all antibodies. Hover over lines to see details.
thumbnail: /thumbnails/antibody_escape.png
keyword: "Antibody Escape"
---

<script setup>
  import AntibodyEscapeLines from '/main/figures/AntibodyEscapeLines.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>
<D3PlotContainer class="">
  <AntibodyEscapeLines/>
</D3PlotContainer>

<div class='code-below-figure'>

# Code

<<< @/main/figures/AntibodyEscapeLines.vue

</div>