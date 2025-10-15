---
title: Antibody Escape Animation
date: 2025-01-02
subtext: Animation showing escape aggregated by site for the different antibodies.
thumbnail: /thumbnails/animatedEscapeLines.png
keyword: "Antibody Escape"
---

<script setup>
import AntibodyEscapeLinesAnimation from '/main/figures/AntibodyEscapeLinesAnimation.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>
<D3PlotContainer class="">
    <AntibodyEscapeLinesAnimation />
</D3PlotContainer>


<div class='code-below-figure'>

# Code

<<< @/main/figures/AntibodyEscapeLinesAnimation.vue

</div>