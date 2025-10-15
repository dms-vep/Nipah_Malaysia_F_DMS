---
title: Distribution of Effects by Amino Acid Mutation
date: 2025-01-01
subtext: Animation showing how mutation effects vary by amino acid
thumbnail: /thumbnails/AAEffectsDistribution.png
keyword: "Cell Entry"
---

<script setup>
  import CellEntryEffectsDistribution from '/main/figures/CellEntryEffectsDistribution.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>

This animation shows the distribution of effects for each specific amino acid. Most of the amino acid mutations have similar distributions, with a few exceptions. For example, mutations to Glycine (G) and Proline (P) are more likely to have strong negative effects.

<D3PlotContainer class="">
    <CellEntryEffectsDistribution />
</D3PlotContainer>

<div class='code-below-figure'>

# Code

<<< @/main/figures/CellEntryEffectsDistribution.vue

</div>