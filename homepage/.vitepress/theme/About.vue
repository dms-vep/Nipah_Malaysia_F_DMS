<template>
    <div class="h-full w-full px-2 pt-4 ">
        <div class=" px-4 py-4 max-w-xl mx-auto sm:px-6 sm:py-8 lg:max-w-4xl lg:py-8 lg:px-8 xl:max-w-6xl">
            <AnimatedLetters text="About" />
        </div>
    </div>
    <section class="px-4 py-10 max-w-3xl mx-auto sm:px-6 sm:py-12 lg:max-w-4xl lg:py-16 lg:px-8 xl:max-w-6xl">
        <h1>About</h1>
        <h2 class="pt-8 md:pt-12 lg:pt-14 pb-4 md:pb-6 lg:pb-8">Approach</h2>
        <p>Given the spillover risk posed by Nipah virus, we sought to understand how mutations affect important
            phenotypes of the fusion protein.
            Specifically, we measured how mutations affect cell entry and antibody neutralization.

            To do this, we used a technique called deep mutational scanning, which allows us to measure the effects of
            thousands of mutations in parallel.

            These data provide a comprehensive view of the functional importance of each amino acid in the fusion
            protein, and can help us understand how the virus might evolve in the future.
            Furthermore, we show that certain antibodies are less affected by escape mutations, suggesting they may be
            promising candidates for therapeutic development.

        </p>
        <h2 class="pt-8 md:pt-12 lg:pt-14 pb-4 md:pb-6 lg:pb-8">Links to data</h2>
        <p>Our final filtered datasets in csv format can be found here:</p>
        <ul class="pt-4 list-disc list-inside">
            <li><a href="https://github.com/dms-vep/Nipah_Malaysia_F_DMS/blob/main/analysis/results/filtered_data/cell_entry/Nipah_F_func_effects_filtered.csv"
                    target="_self">Cell Entry</a></li>
            <li><a href="https://github.com/dms-vep/Nipah_Malaysia_F_DMS/blob/main/analysis/results/filtered_data/antibody_escape/combined/all_antibodies_escape_filtered.csv"
                    target="_self">Antibody Escape</a></li>
        </ul>
        <h2 class="pt-8 md:pt-12 lg:pt-14 pb-4 md:pb-6 lg:pb-8">People</h2>
        <p>Primary work performed in the <a href="https://jbloomlab.org" target="_self">Bloom lab</a> at the Fred Hutch
            Cancer Center with contributions from the <a href="https://www.veeslerlab.com" target="_self">Veesler
                lab</a> at the University of Washington.</p>
        <ul class="pt-4 list-disc list-inside">
            <li><a href="https://jbloomlab.org/people/brendan-larsen.html" target="_self">Brendan Larsen</a></li>
            <li><a href="https://jbloomlab.org/people/sheri-harari.html" target="_self">Sheri Harari</a></li>
            <li><a href="https://www.veeslerlab.com/people" target="_self">Risako Gen</a></li>
            <li><a href="https://www.veeslerlab.com/people" target="_self">Cameron Stewart</a></li>
            <li><a href="https://www.veeslerlab.com/people" target="_self">David Veesler</a></li>
            <li><a href="https://jbloomlab.org/people/jesse-bloom.html" target="_self">Jesse Bloom</a></li>
        </ul>
        <h2 class="pt-8 md:pt-12 lg:pt-14 pb-4 md:pb-6 lg:pb-8">Biosafety</h2>
        <p>We take biosafety seriously and took multiple steps to ensure our experiments were safe.

            To measure the effects of ~8,500 Nipah fusion mutations, we used non-replicative
            <a href="https://pubmed.ncbi.nlm.nih.gov/36868218/" target="_self">pseudoviruses.</a>

            These particles can enter cells but cannot replicate or produce new virus particles, and are
            not infectious agents.

            Importantly, we used a vector that expresses no viral proteins besides the Nipah
            fusion protein, and other essential pseudovirus components are provided from four separate plasmids.

            This approach allowed us to safely measure the effects of mutations without the risks associated
            with working with authentic virus.
        </p>

        <p class=" pt-4">
            To limit generating hazardous information about human-specific adaptations, we performed all experiments
            in
            cells expressing either bat ephrin-B2 or -B3 from the black flying fox, a natural host of henipaviruses.

            By measuring the effects of mutations in this context, we minimized the risk of generating hazardous
            information about human-specific adaptations.

            We previously published data from <a href="https://pubmed.ncbi.nlm.nih.gov/40132580/">deep mutational
                scanning of the
                receptor binding protein</a> using the same safe approach.
        </p>

    </section>
</template>

<script setup>
import AnimatedLetters from '/main/figures/LettersAnimation.vue';
</script>