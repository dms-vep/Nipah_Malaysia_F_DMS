---
title: Antibody Escape
date: 2025-01-02
subtext: Toggle between antibody escape datasets aggregated by site.
thumbnail: /thumbnails/AntibodyEscapeSelectable.png
keyword: "Antibody Escape"
---

<script setup>
  import AntibodyEscapeSumSelectable from '/main/figures/AntibodyEscapeSumSelectable.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>
<D3PlotContainer class="">
  <AntibodyEscapeSumSelectable/>
</D3PlotContainer>

<div class='code-below-figure'>

# Code

<<< @/main/figures/AntibodyEscapeSumSelectable.vue

</div>