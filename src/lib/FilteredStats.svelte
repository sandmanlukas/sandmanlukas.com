<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import type { Activity, TotalStats } from "../types";
    import { _formatActivities, calculateTotalStats } from "../utils";

    export let activities: Activity[] = [];
    export let filteredDateRange: Date[] = [];

    let totalStats: TotalStats;
    let firstDate = "";
    let lastDate = "";

    onMount(() => {
        if (!activities || !filteredDateRange) {
            throw new Error(
                "You must provide `activities` and `filteredDateRange`",
            );
        }

        firstDate = filteredDateRange[0].toLocaleString("sv-SE", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

        lastDate = filteredDateRange[1].toLocaleString("sv-SE", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    });

    onDestroy(() => {
        totalStats = {} as TotalStats;
    });

    $: {
        totalStats = calculateTotalStats(activities);
    }
</script>

<div class="card-border mt-2">
    {#if totalStats}
        <div class="user-info">
            {#if firstDate === lastDate}
                <h2 class="textcolor-red">
                    Stats <span class="font-normal">({firstDate})</span>
                </h2>
            {:else}
                <h2 class="user-name">
                    Stats <span class="font-normal"
                        >({firstDate} - {lastDate})</span
                    >
                </h2>
            {/if}
            <div class="filtered-stats-grid">
                <div class="filtered-stats">
                    <p>Distance (total): {totalStats.totalDistanceKm}km</p>
                    <p>Elevation gain (total): {totalStats.totalElevation}m</p>
                    <p>Time: {totalStats.totalMovingTimeStr}</p>
                </div>
                <div class="filtered-stats">
                    <p>Average pace: {totalStats.avgPace} min/km</p>
                    <p>Average distance per run: {totalStats.avgDistance} km</p>
                    <p>Longest run: {totalStats.longestRun}km</p>
                </div>
            </div>
        </div>
    {/if}
</div>

<style lang="postcss">
    .filtered-stats-grid {
        display: flex;
        justify-content: space-between;
    }

    .filtered-stats {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        width: 50%;
    }

    .filtered-stats:last-child {
        align-items: flex-start;
        text-align: right;
    }
</style>
