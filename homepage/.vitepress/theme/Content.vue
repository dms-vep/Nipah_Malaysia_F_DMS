<script setup>
import { computed, ref } from 'vue';
import { data as posts } from './components/posts.data.js';
import { useRoute } from 'vitepress';

const route = useRoute();

const filteredPosts = computed(() => {
    return posts
        .filter((post) => post.url.endsWith('.html'))
        .map((post) => ({
            ...post,
        }));
});
</script>

<template>
    <div class="h-full w-full px-6 py-4 md:px-12 lg:px-20">
            <main class="mx-auto w-full md:w-5/6 2xl:max-w-4xl">
                <Content />
            </main>
    </div>
</template>