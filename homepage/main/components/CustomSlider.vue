<!-- ./src/components/CustomSlider.vue -->
<template>
    <div class="slider-container">
        <!-- Conditionally show label if provided -->
        <div v-if="label" class="text-xs lg:text-md font-bold tracking-tight my-4">
            {{ label }}: {{ sliderValue }}
        </div>
        <div class="slider-wrapper">
            <input ref="slider" :value="sliderValue" @input="({ target }) => (sliderValue = parseFloat(target.value))"
                type="range" :min="min" :max="max" :step="step" class="slider" />
        </div>
    </div>
</template>

<script setup>
import { ref, watchEffect } from 'vue';

// define component props for the slider component
const { id, label, min, max, step, modelValue } = defineProps({
    id: {
        type: String,
    },
    label: {
        type: String,
        default: '',
    },
    min: {
        type: Number,
        default: 0,
    },
    max: {
        type: Number,
        default: 100,
    },
    step: {
        type: Number,
        default: 1,
    },
    modelValue: {
        type: Number,
        default: 10,
    },
});

// define emits for the slider component
const emit = defineEmits(['update:modelValue']);

// define refs for the slider component
const sliderValue = ref(modelValue);
const slider = ref(null);

// function to get the progress of the slider
const getProgress = (value, min, max) => {
    return ((value - min) / (max - min)) * 100;
};

// function to set the css variable for the progress
const setCSSProgress = (progress) => {
    slider.value.style.setProperty('--ProgressPercent', `${progress}%`);
};

// watchEffect to update the css variable when the slider value changes
watchEffect(() => {
    if (slider.value) {
        // emit the updated value to the parent component
        emit('update:modelValue', sliderValue.value);
        // update the slider progress
        const progress = getProgress(sliderValue.value, slider.value.min, slider.value.max);
        // define extrawidth to ensure that the end of progress is always under the slider thumb.
        let extraWidth = (100 - progress) / 10;
        // set the css variable
        setCSSProgress(progress + extraWidth);
    }
});

// Watch for external changes to modelValue
watchEffect(() => {
    sliderValue.value = modelValue;
});
</script>

<style scoped>
.slider-container {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: left;
    margin-bottom: 10px;
    margin-left: 0px;
}

.slider-wrapper {
    width: 40%;
    display: flex;
    justify-content: left;
}

.slider {
    width: 100%;
    -webkit-appearance: none;
    height: 6px;
    border-radius: 3px;
    background: linear-gradient(90deg, #d4d4d8 0%, #3f3f46 100%);
    outline: none;
    opacity: 0.7;
    transition: opacity 0.2s;
}

.slider:hover {
    opacity: 1;
}

.slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.2s;
}

.slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
}

.slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.2s;
}

.slider::-moz-range-thumb:hover {
    transform: scale(1.2);
}
</style>
