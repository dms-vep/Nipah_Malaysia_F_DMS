<!-- sidebar.vue -->
<template>
    <div class="container w-36 items-center justify-center overflow-hidden border-2 p-2 text-xs">
        <div class="flex flex-col">
            <div class="text-xl font-bold">
                <slot name="title">Heatmap Options</slot>
            </div>
            <slot name="content"></slot>
        </div>
    </div>
</template>

