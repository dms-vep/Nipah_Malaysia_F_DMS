<!-- Tooltip.vue -->
<template>
    <div class="tooltip-wrapper">
        <div class="tooltip" :style="{ top: `${y}px`, left: `${x}px`, background: color, color: textColor, fontSize: fontSize }"
            v-if="visible && data">
            <p>Site: {{ data.site }}</p>
            <p>Wildtype: {{ data.wildtype }}</p>
            <p>Mutation: {{ data.mutant }}</p>
            <p>Escape: {{ data.escape }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    data: {
        type: Object,
        default: null,
    },
    color: {
        type: String,
        default: 'rgba(0, 0, 0, 0.8)',
    },
    fontSize: {
        type: String,
        default: '2px',
    },
});

const visible = ref(false);
const x = ref(0);
const y = ref(0);
const data = ref(props.data);
const color = ref(props.color);
const fontSize = ref(props.fontSize);

const textColor = computed(() => {
    const rgb = color.value.replace(/[^\d,]/g, '').split(',');
    const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
});

function showTooltip(event) {
    visible.value = true;
    x.value = event.clientX + 10;
    y.value = event.clientY + 10;
}

function hideTooltip() {
    visible.value = false;
}

defineExpose({
    showTooltip,
    hideTooltip,
    data,
    color,
    fontSize,
});
</script>

<style scoped>
.tooltip {
    position: fixed;
    text-align: center;
    padding: 4px;
    border-radius: 5px;
    pointer-events: none;
    z-index: 9999;
}

</style>