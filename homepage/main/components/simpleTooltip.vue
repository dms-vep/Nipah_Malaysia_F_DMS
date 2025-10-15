<!-- Tooltip.vue -->
<template>
    <div class="tooltip" :style="{ top: `${y}px`, left: `${x}px` }" v-if="visible && data">
        <div class="tooltip-row" v-for="(item, index) in data" :key="index">
            <span class="tooltip-label">{{ item.label }}:</span>
            <span class="tooltip-value">{{ item.value }}</span>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    data: {
        type: Array,
        default: () => [],
    },
});

const visible = ref(false);
const x = ref(0);
const y = ref(0);

function showTooltip(event) {
    visible.value = true;
    updatePosition(event);
}

function updatePosition(event) {
    x.value = event.clientX + 15;
    y.value = event.clientY + 15;

    // Optional: Keep tooltip within viewport bounds
    const tooltipWidth = 75; // Approximate width
    const tooltipHeight = 100; // Approximate height

    if (x.value + tooltipWidth > window.innerWidth) {
        x.value = event.clientX - tooltipWidth - 10;
    }

    if (y.value + tooltipHeight > window.innerHeight) {
        y.value = event.clientY - tooltipHeight - 10;
    }
}
function hideTooltip() {
    visible.value = false;
}

defineExpose({
    showTooltip,
    updatePosition,
    hideTooltip,
});
</script>

<style scoped>
.tooltip {
    position: fixed;
    background: rgba(255, 255, 255, 0.95);
    color: black;
    padding: 8px 12px;
    border-radius: 10px;
    pointer-events: none;
    z-index: 9999;
    border: 1px solid rgba(0, 0, 0, 0.2);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    min-width: 120px;
}

.tooltip-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin: 2px 0;
    gap: 10px;
}

.tooltip-label {
    font-size: 12px;
    color: #666;
    flex-shrink: 0;
}

.tooltip-value {
    font-size: 12px;
    font-weight: bold;
    color: black;
    text-align: right;
    margin-left: auto;
}
</style>