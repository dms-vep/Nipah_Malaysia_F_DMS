<script>
//Visualizations.vue
import { data as posts } from './components/posts.data.js';
import { useData, withBase } from 'vitepress';

export default {
    data() {
        const processedPosts = posts
            .filter((post) => post.url.endsWith('.html'))
            .map((post) => ({
                ...post,
                url: withBase(post.url),
                thumbnail: post.thumbnail ? withBase(post.thumbnail) : null,
                keyword: post.keyword || 'Other' // Default to 'Other' if no keyword
            }));

        // Group posts by keyword
        const groupedPosts = processedPosts.reduce((groups, post) => {
            const keyword = post.keyword;
            if (!groups[keyword]) {
                groups[keyword] = [];
            }
            groups[keyword].push(post);
            return groups;
        }, {});

        // Define the order of sections (you can customize this)
        const sectionOrder = ['Cell Entry', 'Antibody Escape', 'RBP and F Comparisons','Other'];

        // Create ordered sections array
        const orderedSections = sectionOrder.map(sectionName => ({
            name: sectionName,
            posts: groupedPosts[sectionName] || []
        }));

        // Add any sections not in the predefined order
        Object.keys(groupedPosts).forEach(keyword => {
            if (!sectionOrder.includes(keyword)) {
                orderedSections.push({
                    name: keyword,
                    posts: groupedPosts[keyword]
                });
            }
        });

        // Filter out empty sections
        const sectionsWithPosts = orderedSections.filter(section => section.posts.length > 0);

        return {
            sections: sectionsWithPosts,
            frontmatter: useData().frontmatter,
        };
    },
};
</script>

<template>
    <section class="px-4 py-10 max-w-3xl mx-auto sm:px-6 sm:py-12 lg:max-w-4xl lg:py-16 lg:px-8 xl:max-w-6xl">
        <h1 class="">Visualizing Deep Mutational Scanning Data</h1>
        <h2 class="pt-8 lg:pt-16">Overview</h2>
        <p class="pt-4 lg:pt-8">
            This section hosts different visualizations of deep mutational scanning data from
            the <a href="https://github.com/dms-vep/Nipah_Malaysia_F_DMS">Nipah virus F project</a>.
            Explore the data through interactive plots and figures that illustrate the breadth of
            mutational effects on the Nipah virus F protein. Code for <a href="https://vuejs.org">Vue</a>
            and <a href="https://d3js.org">D3</a> used to generate the visualizations are shown below the figures.
        </p>

        <!-- Loop through each section -->
        <div v-for="(section, sectionIndex) in sections" :key="sectionIndex">
            <h2 class="pt-8 lg:pt-16 pb-8 lg:pb-12">{{ section.name }}</h2>
            <div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <div v-for="(post, index) in section.posts" :key="index"
                    class="flex flex-col mx-auto max-w-xs overflow-hidden rounded-lg border border-zinc-200 shadow-md hover:border-cyan-400 hover:shadow-cyan-400 dark:border-zinc-500 dark:shadow-zinc-500 dark:hover:border-cyan-500 dark:hover:shadow-cyan-500">
                    <a :href="post.url" class="flex h-full flex-col border-none align-text-bottom">
                        <img v-if="post.thumbnail" :src="post.thumbnail"
                            class="h-48 w-full rounded-t-lg object-contain aspect-square" />
                        <div class="p-4 align-text-bottom">
                            <strong class="mb-2 text-lg font-semibold">
                                {{ post.title }}
                            </strong>
                            <p v-if="post.subtext" class="mb-2 text-sm opacity-60" v-html="post.subtext"></p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </section>
    <br />
</template>