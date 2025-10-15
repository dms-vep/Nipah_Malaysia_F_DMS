---
title: Animation of Cell Entry by Amino Acid Letters
date: 2025-01-01
subtext: Unmutated residue and site number are placed near the top, with increasing deleterious effects as you go down
thumbnail: /thumbnails/LettersAnimation.png
---

<script setup>
  import LettersAnimation from '/main/figures/LettersAnimation.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>
<D3PlotContainer class="">
  <LettersAnimation />
</D3PlotContainer>


<div class='code-below-figure'>

# Code

<<< @/main/figures/LettersAnimation.vue

</div>