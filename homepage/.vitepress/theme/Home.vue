<script setup>
import RadialPhylogeny from '/main/figures/RadialPhylogeny.vue';
import ScatterPlotDropdown from '/main/figures/AntibodyEscapeSumSelectable.vue';
import RBPvsF from '/main/figures/RBPvsF_Density.vue';
import HeatmapWrappedSimple from '/main/figures/CellEntryHeatmapWrappedZoomable.vue';
import B2vsB3_Corr from '/main/figures/B2vsB3_Corr.vue';
import AntibodyEscapeDotPlot from '/main/figures/AntibodyEscapeDotPlot.vue';
//import AnimatedLetters from '/main/figures/LettersAnimation.vue';

import { ref, onMounted, onBeforeUnmount } from 'vue';


// Code for handling intersection observer for animations
const observer = ref(null);
const initObserver = () => {
    const options = {
        root: null,
        threshold: 0.5,
        rootMargin: '0px',
    };

    observer.value = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('element-visible');
                entry.target.classList.remove('element-hidden');
            }
        });
    }, options);

    // Select elements and start observing them
    const elements = document.querySelectorAll('.element-hidden');
    elements.forEach((element) => observer.value.observe(element));
};

onMounted(() => {
    initObserver();
});

onBeforeUnmount(() => {
    if (observer.value) {
        // Stop observing all elements
        observer.value.disconnect();
    }
});
</script>

<template>
    <main class="mx-4">
        <section class="mx-auto h-screen w-full">
            <div class="flex h-screen flex-col justify-center gap-4 items-center text-center ">
                <div
                    class="bg-gradient-to-b text-4xl md:text-8xl font-bold tracking-tight opacity-90 from-zinc-200 to-zinc-800 bg-clip-text text-transparent">
                    Nipah F
                </div>

                <h1 class="text-xl md:text-2xl font-bold tracking-tight text-zinc-600 max-w-lg mx-auto">
                    Deep mutational scanning to characterize viral evolution and antibody escape
                </h1>

                <div class="group">
                    <div class="flex flex-col gap-1 pt-8">
                        <a href="/#introduction"
                            class="flex flex-col items-center justify-center gap-2 text-zinc-600 border-none">
                            <p class="text-sm duration-300 group-hover:text-cyan-400 ">Learn more about the
                                project</p>
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="w-6 h-6 duration-300 group-hover:text-cyan-400 group-hover:translate-y-1.5"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />

                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </section>
        <section id='introduction' class="px-0 md:px-4 lg:px-10 xl:px-24">
            <div class="mx-auto p-6 sm:rounded-lg border-4">
                <div class="col-span-12 col-start-1 lg:col-span-10">
                    <h1>Introduction to Nipah virus</h1>
                </div>
                <div class="mx-auto max-w-screen-md ">
                    <h2 class="pt-12">Diversity and Evolution</h2>
                    <p>
                        Nipah is a bat-borne virus that sporadically spills over into human populations, causing
                        severe disease with high fatality rates. There are no approved vaccines or
                        therapeutics available for the prevention or treatment of Nipah virus infection. Spillovers primarily occur in Bangladesh and India.
                    </p>

                    <RadialPhylogeny />
                    <p class="text-center text-sm">Phylogenetic tree of Nipah viruses</p>

                    <h2 class="pt-12">Surface Glycoproteins and Cell Entry</h2>
                    <p>
                        Nipah virus expresses two surface proteins: the receptor binding protein and the fusion
                        protein. The receptor binding protein can bind two different host receptors, ephrin-B2
                        or ephrin-B3. Once bound, the receptor binding protein triggers the fusion protein to undergo
                        a series of conformational changes that lead to the fusion of the viral and host membranes.
                    </p>
                    <video autoplay muted loop playsinline class="w-full h-full z-0 pt-12">
                        <source src="/images/spinning.mp4" type="video/mp4">
                    </video>
                    <p class="text-center text-sm">
                        Nipah virus surface glycoproteins. The tetrameric receptor binding protein is on the left, and
                        the trimeric fusion
                        protein is on the right.
                    </p>
                    <h2 class="pt-12">Safely measuring the effects of mutations on the Nipah fusion protein</h2>
                    <p>To measure the effects of ~8,500 mutations in the Nipah fusion protein, we used a non-replicative
                        pseudovirus system.
                        This allows us to safely measure the effects of mutations without the risks associated
                        with introducing mutations into a live virus.
                        Importantly, we used a vector that expresses no viral proteins besides the Nipah fusion protein,
                        and other
                        essential pseudovirus components are provided from four separate plasmids.
                        To limit generating hazardous information, we performed all experiments in cells
                        expressing either bat ephrin-B2 or -B3, rather than the human orthologs.
                        This approach allows us to measure the effects of mutations in the context of the natural bat
                        host,
                        rather than potential human-specific adaptations. We previously published data from
                        <a href="https://pubmed.ncbi.nlm.nih.gov/40132580/">deep mutational scanning of the
                            receptor binding protein</a> using the same safe approach.
                    </p>


                    <div class="flex flex-col md:flex-row gap-8 items-start">
                        <div class="flex-1">
                            <img src="/images/f_prefusion_trimerv2.png"
                                class="element-hidden container mx-auto pt-10" />
                            <p class="text-center text-sm">
                                Prefusion
                            </p>
                        </div>

                        <div class="flex-1">
                            <img src="/images/f_postfusion.png" class="element-hidden container mx-auto pt-10" />
                            <p class="text-center text-sm">
                                Postfusion
                            </p>
                        </div>
                    </div>
                    <h2 class="pt-20">Fusion Protein Conformational Change</h2>
                    <p>
                        The trimeric fusion protein undergoes a dramatic, irreversible conformational change following
                        triggering. The structure transistions from the prefusion conformation to an extended
                        postfusion conformation. This enables the fusion peptide, located near the top, to
                        interact with the host membrane and results in fusing the viral and host membranes, completing
                        the first step of infection.
                    </p>
                </div>
            </div>
        </section>

        <br />
        <section class="px-0 md:px-4 lg:px-10 xl:px-24">
            <div class="mx-auto p-6 sm:rounded-lg border-4">
                <div class="col-span-12 col-start-1 lg:col-span-10">
                    <h1>Effects of mutations on cell entry</h1>
                </div>
                <div class="mx-auto max-w-screen-md">
                    <h2 class="pt-12">Effects of mutations on cell entry</h2>
                    <p class="py-4">
                        Explore the cell entry data in the heatmap below. The heatmap can be dragged, zoomed in, and
                        individual cells can be hovered over for more information.
                    </p>
                    <D3PlotContainer>
                        <HeatmapWrappedSimple />
                    </D3PlotContainer>
                    <p class="py-4 text-center text-sm">The color of the cell indicates the effect of the mutation on
                        cell
                        entry, with red indicating a strong negative effect. The unmutated residue is indicated with a
                        black 'X', and missing residues are shown in gray.</p>

                </div>
            </div>
        </section>


        <br />
        <section class="px-0 md:px-4 lg:px-10 xl:px-24">
            <div class="mx-auto p-6 sm:rounded-lg border-4">
                <div class="col-span-12 col-start-1 lg:col-span-10">
                    <h1>Comparisons between the receptor binding protein and fusion protein</h1>
                </div>
                <div class="mx-auto max-w-screen-md">
                    <h2 class="pt-12">
                        How do these two proteins compare in mutational tolerance?
                    </h2>
                    <p class="py-2">Since we previously performed deep mutational scanning on the Nipah receptor binding
                        protein, we compared the effects of mutations on cell entry with the fusion protein. Mutations
                        in the fusion protein were generally more deleterious on cell entry than mutations to the
                        receptor
                        binding protein</p>
                    <D3PlotContainer>
                        <RBPvsF />
                    </D3PlotContainer>
                    <h2 class="pt-12">Effects of mutations in cells expressing bat ephrin-B2 or -B3</h2>
                    <p class="">Host receptor had a strong effect on the effects of mutations in the receptor binding
                        protein, but not the fusion protein.</p>
                    <D3PlotContainer>
                        <B2vsB3_Corr />
                    </D3PlotContainer>
                </div>
            </div>
        </section>







        <br />
        <section class="px-0 md:px-4 lg:px-10 xl:px-24">
            <div class="mx-auto p-6 sm:rounded-lg border-4">
                <div class="col-span-12 col-start-1 lg:col-span-10">
                    <h1>Effects of mutations on antibody neutralization</h1>
                </div>
                <div class="mx-auto max-w-screen-md">
                    <h2 class="pt-12">
                        Mutations have different effects on antibody neutralization
                    </h2>
                    <p class="py-2">We determined the identity and relative effects of Nipah fusion mutations on
                        neutralization by a panel of seven antibodies. Hover over the points below to see more
                        information about each mutation. Note that some antibodies are less affected by mutations than
                        others.</p>
                    <D3PlotContainer>
                        <AntibodyEscapeDotPlot />
                    </D3PlotContainer>


                    <p class="py-8">Toggle between the different antibodies to see the sites with the most combined
                        escape. 
                    </p>
                    <D3PlotContainer>
                        <ScatterPlotDropdown />
                    </D3PlotContainer>

                </div>
            </div>
        </section>

        <br />
    </main>
</template>

<style scoped>
.element-hidden {
    opacity: 0;
    transform: translateY(30px);
    transition: all 3s ease-out;
}

.element-visible {
    opacity: 1;
    transform: translateY(0);
    transition: all 3s ease-out;
}
</style>