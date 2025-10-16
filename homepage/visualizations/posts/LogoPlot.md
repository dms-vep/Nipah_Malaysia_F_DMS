---
title: Antibody Escape Logo Plots
date: 2025-01-01
subtext: Top escape mutations for each antibody colored by effect on cell entry
thumbnail: /thumbnails/LogoPlot.png
keyword: "Antibody Escape"

---

<script setup>
  import LogoPlot from '/main/figures/LogoPlot.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>

We measured how all mutations affect antibody neutralization. Escape mutations can emerge naturally during viral evolution, or during antibody therapy due to strong selective pressure. Specific mutations may be more likely to emerge depending on how functionally tolerated they are and how many nucleotide mutations are required for a specific amino acid. Here, we show the top escape mutations for each antibody colored by their effect on cell entry (dark green = neutral effect on cell entry, white = worse cell entry). The height of the letter is scaled to how much it reduces antibody neutralization. Mutations that strongly escape antibody neutralization, are neutral for cell entry, and are accessible by a single nucleotide mutation are more likely to emerge during treatment. This information can be used to guide the development of antibodies that are more resilient to escape.


<D3PlotContainer> 
  <LogoPlot />
</D3PlotContainer>


<div class='code-below-figure'>

# Code

<<< @/main/figures/LogoPlot.vue

</div>