<script lang="ts">
    import { SvelteComponent, onDestroy, onMount } from "svelte";
    import LineChart from "./LineChart.svelte";
    import type { Activity } from "../types";
    import Tabs from "./Tabs.svelte";
    import { themeStore } from "../store";

    // export const data: Activity[] = [];
    export let data: Activity[];
    let chartData: any = {
        labels: [],
        datasets: [],
    };

    let labels: string[] = [];
    let dataPoints: number[] = [];
    let items: {
        label: string;
        value: number;
        component: typeof SvelteComponent;
        data: any;
        options: any;
    }[] = [];

    let color: string;
    let theme: string;
    let options = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "",
                    color: "",
                },
                ticks: {
                    color: "",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "",
                    color: "",
                },
                ticks: {
                    color: "",
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: "",
                },
            },
            tooltip: {
                titleColor: "",
                bodyColor: "",
                footerColor: "",
            },
        },
    };

    $: {
        if (chartData.labels.length > 0 && chartData.datasets.length > 0) {            
            theme = $themeStore;

            if (theme === "dark") {
                color = "#ddd";
            } else {
                color = "#000000b3";
            }

            options.scales.x.title.text = "Date";
            options.scales.x.title.color = color;
            options.scales.x.ticks.color = color;

            options.scales.y.title.text = "Distance (km)";
            options.scales.y.title.color = color;
            options.scales.y.ticks.color = color;

            options.plugins.legend.labels.color = color;
            options.plugins.tooltip.titleColor = color;
            options.plugins.tooltip.bodyColor = color;
            options.plugins.tooltip.footerColor = color;

            items = [
                {
                    label: "Distance (km) per run",
                    value: 1,
                    component: LineChart as typeof SvelteComponent,
                    data: chartData,
                    options,
                },
                {
                    label: "Tab 2",
                    value: 2,
                    component: LineChart as typeof SvelteComponent,
                    data: chartData,
                    options,
                },
                // { label: "Tab 2", value: 2, component: LineChart as typeof SvelteComponent, data: data2 },
            ];
        }
    }

    onMount(() => {
        if (!data) {
            throw new Error("No data provided");
        }

        theme = $themeStore;
        
        if (theme === "dark") {
            color = "#ddd";
        } else {
            color = "#000";
        }

        data.forEach((activity) => {
            if (activity.start_date_local_formatted) {
                labels.push(activity.start_date_local_formatted);
            }

            if (activity.distance) {
                let distanceKm =
                    Math.round((activity.distance / 1000) * 10) / 10;
                dataPoints.push(distanceKm);
            }
        });
        chartData.labels = labels;

        chartData.datasets.push({
            label: "Distance (km)",
            fill: true,
            lineTension: 0.25,
            borderColor: "#fa6607",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "rgb(205, 130,1 58)",
            pointBackgroundColor: "#fa6607",
            pointBorderWidth: 8,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#fa6607",
            pointHoverBorderColor: "rgba(220, 220, 220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: dataPoints,
        });

        options.scales.x.title.text = "Date";
        options.scales.x.title.color = color;
        options.scales.x.ticks.color = color;

        options.scales.y.title.text = "Distance (km)";
        options.scales.y.title.color = color;
        options.scales.y.ticks.color = color;

        options.plugins.legend.labels.color = color;
        options.plugins.tooltip.titleColor = color;
        options.plugins.tooltip.bodyColor = color;
        options.plugins.tooltip.footerColor = color;

        items = [
            {
                label: "Distance (km) per run",
                value: 1,
                component: LineChart as typeof SvelteComponent,
                data: chartData,
                options,
            },
            {
                label: "Tab 2",
                value: 2,
                component: LineChart as typeof SvelteComponent,
                data: chartData,
                options,
            },
            // { label: "Tab 2", value: 2, component: LineChart as typeof SvelteComponent, data: data2 },
        ];
    });

    onDestroy(() => {
        data = [];
    });
</script>

<Tabs {items} />
