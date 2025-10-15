---
title: Antibody Escape Analysis for Hendra Virus
date: 2025-01-01
subtext: Which mutations in Hendra virus affect antibody neutralization?
thumbnail: /thumbnails/AntibodyEscapeHendra.png
keyword: "Antibody Escape"
---

<script setup>
  import AntibodyEscapeHendra from '/main/figures/AntibodyEscapeHendra.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>

Showing effects of Hendra mutations on antibody neutralization performed in the Nipah background. Differences from Nipah are colored in gray boxes, circles above each difference show the effect of that mutation on antibody neutralization.

<D3PlotContainer class="">
  <AntibodyEscapeHendra />
</D3PlotContainer>


<div class='code-below-figure'>

# Code

<<< @/main/figures/AntibodyEscapeHendra.vue

</div>