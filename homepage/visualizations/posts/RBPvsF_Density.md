---
title: Differences in Mutational Tolerance Between RBP and F
date: 2025-01-01
subtext: Relative frequencies of mutation effects for RBP and F proteins
thumbnail: /thumbnails/RBPvsF_Density.png
keyword: "RBP and F Comparisons"

---

<script setup>
  import RBPvsFDensity from '/main/figures/RBPvsF_Density.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>

We compared the distribution of mutation effects for the Nipah virus receptor binding protein (RBP) and fusion protein (F). RBP is more tolerant of mutations, with a higher fraction of mutations having near-neutral effects on function, while F is less tolerant of mutations, with a higher fraction of mutations being deleterious. This difference in mutational tolerance likely reflects the different functional constraints on the two proteins, with F needing to maintain a highly specific conformation to mediate membrane fusion, while RBP has more flexibility in its structure to accommodate binding to different host receptors. F data are from the current project, while RBP data are from our <a href="https://www.cell.com/cell/fulltext/S0092-8674(25)00257-0">previous deep mutational scan of Nipah RBP</a>.

<D3PlotContainer class="max-w-2xl">
  <RBPvsFDensity />
</D3PlotContainer>


<div class='code-below-figure'>

# Code

<<< @/main/figures/RBPvsF_Density.vue

</div>