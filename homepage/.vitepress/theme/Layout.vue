<script setup>
import { useData, withBase} from 'vitepress';
import Nav from './Nav.vue';
import Home from './Home.vue';
import Visualizations from './Visualizations.vue';
import ContentPage from './Content.vue';
import About from './About.vue';


const { frontmatter, page } = useData();


</script>

<template>
    <div>
        <Nav></Nav>
        <main>
            <Home v-if="frontmatter.home" />
            <Visualizations v-else-if="frontmatter.visualizations" />
            <About v-else-if="frontmatter.about" />
            <ContentPage v-else />
        </main>
    </div>
</template>