---
title: Correlations of Effects of Mutations with Bat Ephrin-B2 vs -B3
date: 2025-01-01
subtext: Difference in effects of mutations for RBP and F
thumbnail: /thumbnails/B2vsB3Corr.png
keyword: "RBP and F Comparisons"
---

<script setup>
import B2vsB3Corr from '/main/figures/B2vsB3_Corr.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>

Nipah infects cells by binding to one of two host receptors, ephrin-B2 or ephrin-B3. Binding is facilitated by the viral receptor binding protein (RBP), which then triggers the viral fusion protein (F) to mediate fusion of the viral and host cell membranes. Here, we compare how mutations affect the ability of RBP and F to mediate entry into cells expressing bat ephrin-B2 versus ephrin-B3. Host receptor affects the effects of mutations in RBP and F differently, with mutations in F having more similar effects between the two receptors (higher correlation) than mutations in RBP. This makes sense given that RBP directly binds the host receptor, while F is only indirectly affected by the host receptor through its interaction with RBP. F data are from the current project, while RBP data are from our <a href="https://www.cell.com/cell/fulltext/S0092-8674(25)00257-0">previous deep mutational scan of Nipah RBP</a>.

<D3PlotContainer class="max-w-2xl">
    <B2vsB3Corr />
</D3PlotContainer>

<div class='code-below-figure'>

# Code

<<< @/main/figures/B2vsB3_Corr.vue

</div>