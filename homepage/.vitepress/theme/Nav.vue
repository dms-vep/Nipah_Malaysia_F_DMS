<script setup>
import { computed, inject, ref } from 'vue';
import { useData, useRoute, withBase } from 'vitepress';
import SunIcon from './components/icons/VPIconSun.vue';
import MoonIcon from './components/icons/VPIconMoon.vue';
import GithubIcon from './components/icons/GitHubIcon.vue';
import HamburgerIcon from './components/icons/Hamburger.vue';
import VizIcon from './components/icons/VizIcon.vue';

const route = useRoute();

const { isDark, theme } = useData();
const toggleAppearance = inject('toggle-appearance', () => {
    isDark.value = !isDark.value;
});
const switchTitle = computed(() => {
    return isDark.value
        ? theme.value.lightModeSwitchTitle || 'Switch to light theme'
        : theme.value.darkModeSwitchTitle || 'Switch to dark theme';
});

// Computed property for menu items
const menuItems = computed(() => [
    { text: 'About', href: withBase('/about/'), icon: null },
    { text: 'Interactive Plots', href: withBase('/visualizations/'), icon: VizIcon },
    { text: 'Appendix', href: withBase('/appendix.html'), target: '_self', icon: null },
    { text: 'GitHub', href: 'https://github.com/dms-vep/Nipah_Malaysia_F_DMS', icon: GithubIcon },
]);

const isDropdownOpen = ref(false);

function toggleDropdown() {
    isDropdownOpen.value = !isDropdownOpen.value;
}
</script>

<template>
    <div class="mx-auto w-full border-b border-zinc-300 dark:border-zinc-500 px-8 2xl:px-12 ">
        <div class="relative flex h-16 items-center justify-between antialiased">
            <a href="/" class="inline-block rounded-full border-none text-base font-semibold tracking-tight">Nipah F
                DMS</a>
            <!-- Regular menu items (hidden on small screens) -->
            <div class="hidden flex-row items-center gap-6 md:flex">
                <div v-for="item in menuItems" :key="item.text" :item="item" @click="handleItemClick">
                    <a :href="item.href" :target="item.target" :class="{
                        'rounded-lg bg-zinc-400 bg-opacity-50 p-2 ': route.path === item.href,
                        '': route.path !== item.href,
                    }"
                        class="items-center justify-center border-none text-sm hover:text-cyan-400 hover:decoration-cyan-400">
                        {{ item.text }}
                    </a>
                </div>
                <div class="cursor-pointer hover:text-cyan-400" @click="toggleAppearance">
                    <SunIcon v-if="!isDark" key="sun" class="w-5" :title="switchTitle" />
                    <MoonIcon v-else key="moon" class="w-5" :title="switchTitle" />
                </div>
            </div>

            <!-- Dropdown menu toggle button (only visible on small screens) -->
            <button @click="toggleDropdown" class="border-none md:hidden hover:text-cyan-400">
                <HamburgerIcon />
            </button>
        </div>
        <!-- Dropdown menu (only visible on small screens) -->
        <div v-if="isDropdownOpen"
            class="absolute right-4 top-12 z-50 gap-2 rounded-lg border-none bg-zinc-800 text-sm text-zinc-100 shadow-md md:hidden">
            <a v-for="item in menuItems" :key="item.text" :href="item.href" :target="item.target"
                class="z-50 flex flex-row border-none px-4 py-2 hover:text-cyan-400" @click="toggleDropdown">
                <component :is="item.icon" class="mr-2 w-4 flex-shrink-0" />
                {{ item.text }}
            </a>
            <a class="flex cursor-pointer flex-row gap-2 border-none px-4 py-2 align-middle hover:text-cyan-400"
                @click="toggleAppearance">
                <SunIcon v-if="!isDark" key="sun" class="w-4" :title="switchTitle" />
                <MoonIcon v-else key="moon" class="w-4" :title="switchTitle" />
                <span class="border-none ">Light</span>
            </a>
        </div>
    </div>
</template>

<style></style>