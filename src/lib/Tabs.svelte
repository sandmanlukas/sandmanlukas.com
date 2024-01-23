<script lang="ts">
    import type { SvelteComponent } from "svelte";

    export let items: {
        label: string;
        value: number;
        component: typeof SvelteComponent;
        data: any;
        options: any;
    }[] = [];
    export let activeTabValue = 1;

    const handleClick = (tabValue: number) => () => (activeTabValue = tabValue);
</script>

<div>
    <ul class="tabs">
        {#each items as item}
            <li class={activeTabValue === item.value ? "active" : ""}>
                <button on:click={handleClick(item.value)}>{item.label}</button>
            </li>
        {/each}
    </ul>
    {#each items as item}
        {#if activeTabValue == item.value}
            <div class="box">
                <svelte:component this={item.component} data={item.data} options={item.options} />
            </div>
        {/if}
    {/each}
</div>

<style>

    .tabs {
        margin-top: 0.5rem;
    }
    .box {
        margin-bottom: 10px;
        padding: 10px;
        border: 1px solid var(--dot-color);
        border-radius: 0 0.5rem 0.5rem 0.5rem;
    }
    ul {
        display: flex;
        flex-wrap: wrap;
        padding-left: 0;
        margin-bottom: 0;
        list-style: none;
    }
    li {
        margin-bottom: -1px;
    }

    li:last-child {
        margin-right: 0;
    }

    button {
        border: 1px solid var(--dot-color);
        border-top-left-radius: 0.25rem;
        border-top-right-radius: 0.25rem;
        display: block;
        padding: 0.5rem 1rem;
        margin-right: 0.1rem;
        cursor: pointer;
        opacity: 0.75;
    }
    

    button:hover {
        border-color: var(--dot-color);
    }

    li.active > button {
        color: var(--color-text-invert);
        background-color: var(--color-bg-1-invert);
        border-color: var(--dot-color);
        opacity: 1;
    }
</style>
