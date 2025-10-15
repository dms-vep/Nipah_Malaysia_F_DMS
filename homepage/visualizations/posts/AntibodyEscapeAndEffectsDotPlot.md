---
title: Antibody Escape and Cell Entry Dot Plot
date: 2025-01-01
subtext: Toggle between phenotypes
keyword:  "Antibody Escape"
thumbnail: /thumbnails/AntibodyEscapeAndEffectsDotPlot.png

---

<script setup>
  import AntibodyEscapeAndEffectsDotPlot from '/main/figures/AntibodyEscapeAndEffectsDotPlot.vue';
</script>

<FigureTitle>{{$frontmatter.title}}</FigureTitle>
<SubtitleHeader>{{$frontmatter.subtext}}</SubtitleHeader>

We measured how mutations affect both cell entry and antibody neutralization. This allows us to better understand which antibodies might be more easily escaped. The plot below shows mutations colored by their effect on antibody neutralization or cell entry. You can toggle between these two views using the checkbox. Hovering over points will highlight mutations at the same site. This plot is only showing a subset of mutations that have the strongest effects on antibody neutralization. Note that 1F2 escape mutations are of lower magnitude and have higher cost to cell entry than the other antibodies. This suggests that 1F2 targets a more functionally constrained region of the Nipah F protein and is more resilient to viral escape.

<D3PlotContainer>
  <AntibodyEscapeAndEffectsDotPlot />
</D3PlotContainer>



<div class='code-below-figure'>

# Code

<<< @/main/figures/AntibodyEscapeAndEffectsDotPlot.vue

</div>