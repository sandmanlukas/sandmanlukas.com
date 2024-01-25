<script lang="ts">
    import { SvelteComponent, onDestroy, onMount } from "svelte";
    import LineChart from "./LineChart.svelte";
    import type { Activity } from "../types";
    import Tabs from "./Tabs.svelte";
    import { themeStore } from "../store";
    import { convertPacetoString } from "../utils";

    // export const data: Activity[] = [];
    export let data: Activity[];

    let chartDataDistance: any = {
        labels: [],
        datasets: [],
    };

    let chartDataPace: any = {
        labels: [],
        datasets: [],
    };

    let paceOptions: any = {};
    let distanceOptions: any = {};

    let labels: string[] = [];
    let dataPointsDistance: number[] = [];
    let dataPointsPace: number[] = [];

    let averageDistance: number = 0;
    let averageDistancePoints: number[] = [];

    let averagePace: number = 0;
    let averagePacePoints: number[] = [];

    let items: {
        label: string;
        value: number;
        component: typeof SvelteComponent;
        data: any;
        options: any;
    }[] = [];

    let color: string;
    let theme: string;

    function setOptions(
        xTitle: string,
        yTitle: string,
        color: string,
        labels: string[],
    ) {
        let options: any = {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xTitle,
                        color: color,
                    },
                    ticks: {
                        color: color,
                        callback: function (index: number) {
                            if (index % 3 === 0) {
                                return labels[index];
                            }
                        },
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: yTitle,
                        color: color,
                    },
                    ticks: {
                        color: color,
                    },
                },
            },
            plugins: {
                legend: {
                    labels: {
                        color: color,
                    },
                },
                tooltip: {
                    titleColor: "#ddd",
                    bodyColor: "#ddd",
                    footerColor: "#ddd",
                },
            },
        };

        if (yTitle === "Pace (min/km)") {
            options = {
                ...options,
                scales: {
                    ...options.scales,
                    y: {
                        ...options.scales.y,
                        reverse: true,
                        ticks: {
                            callback: function (value: string, index: number) {
                                return convertPacetoString(parseFloat(value));
                            },
                        },
                    },
                },
                plugins: {
                    ...options.plugins,
                    tooltip: {
                        ...options.plugins.tooltip,
                        callbacks: {
                            label: function (context: any) {
                                let label = context.dataset.label || "";

                                if (label) {
                                    label += ": ";
                                }

                                if (context.parsed.y !== null) {
                                    label += convertPacetoString(
                                        context.parsed.y,
                                    );
                                }

                                return label;
                            },
                        },
                    },
                },
            };

            // options.scales.y.ticks = {
            //     callback: function (value: string, index: number) {
            //         return convertPacetoString(parseFloat(value));
            //     },
            // };

            // options.plugins.tooltip.callbacks = {
            //     label: function (context: any) {
            //         let label = context.dataset.label || "";

            //         if (label) {
            //             label += ": ";
            //         }

            //         if (context.parsed.y !== null) {
            //             label += convertPacetoString(context.parsed.y);
            //         }

            //         return label;
            //     },
            // };
        }

        return options;
    }

    function updateOptions(options: any, color: string) {
        options.scales.x.title.color = color;
        options.scales.x.ticks.color = color;

        options.scales.y.title.color = color;
        options.scales.y.ticks.color = color;

        options.plugins.legend.labels.color = color;
        return options;
    }

    function setChartData(
        chartData: any,
        data: number[],
        averageData: number[],
        labels: string[],
        theme: string,
        firstLabel: string,
        secondLabel: string,
    ) {
        chartData.labels = labels;

        chartData.datasets = [
            {
                label: firstLabel,
                fill: true,
                lineTension: 0.25,
                borderColor: "#fa6607",
                borderCapStyle: "butt",
                borderJoinStyle: "miter",
                pointBorderColor: theme === "dark" ? "#ddd" : "#000",
                pointBackgroundColor: "#000",
                pointBorderWidth: 2,
                pointHoverBackgroundColor: "#fa6607",
                pointHoverBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHitRadius: 10,
            },
            {
                label: secondLabel,
                fill: false,
                borderColor: "rgba(0,0,0,0.3)",
                borderJoinStyle: "miter",
            },
        ];

        // Line of points
        if (data.length > 0) {
            chartData.datasets[0].data = data;
        }

        // Line of average
        if (averageData.length > 0) {
            chartData.datasets[1].data = averageData;
        }
        return chartData;
    }

    function updateColors(chartData: any, theme: string) {
        chartData.datasets[0].pointBorderColor =
            theme === "dark" ? "#ddd" : "#000";
        chartData.datasets[0].pointBackgroundColor =
            theme === "dark" ? "#000" : "#ddd";
        chartData.datasets[0].pointHoverBackgroundColor =
            theme === "dark" ? "#000" : "#ddd";
        chartData.datasets[0].pointHoverBorderColor =
            theme === "dark" ? "#ddd" : "#000";
        return chartData;
    }

    $: {
        theme = $themeStore;

        if (theme === "dark") {
            color = "#ddd";
        } else {
            color = "#000000b3";
        }

        if (
            chartDataDistance.labels.length > 0 &&
            chartDataDistance.datasets.length > 0
        ) {
            chartDataDistance = updateColors(chartDataDistance, theme);

            distanceOptions = updateOptions(distanceOptions, color);

            items = [
                {
                    label: "Distance (km) per run",
                    value: 1,
                    component: LineChart as typeof SvelteComponent,
                    data: chartDataDistance,
                    options: distanceOptions,
                },
            ];
        }

        if (
            chartDataPace.labels.length > 0 &&
            chartDataPace.datasets.length > 0
        ) {
            chartDataPace = updateColors(chartDataPace, theme);
            paceOptions = updateOptions(paceOptions, color);

            items.push({
                label: "Pace (min/km) per run",
                value: 2,
                component: LineChart as typeof SvelteComponent,
                data: chartDataPace,
                options: paceOptions,
            });
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

            if (activity.distance && activity.moving_time) {
                let distanceKm =
                    Math.round((activity.distance / 1000) * 10) / 10;
                dataPointsDistance.push(distanceKm);

                let pace =
                    (activity.moving_time / activity.distance / 60) * 1000;

                dataPointsPace.push(pace);
            }
        });

        averageDistance =
            dataPointsDistance.reduce((sum, value) => sum + value, 0) /
            dataPointsDistance.length;
        averageDistancePoints = Array(dataPointsDistance.length).fill(
            averageDistance,
        );

        averagePace =
            dataPointsPace.reduce((sum, value) => sum + value, 0) /
            dataPointsPace.length;
        averagePacePoints = Array(dataPointsPace.length).fill(averagePace);

        chartDataDistance = setChartData(
            chartDataDistance,
            dataPointsDistance,
            averageDistancePoints,
            labels,
            theme,
            "Distance (km)",
            "Average distance (km)",
        );

        chartDataPace = setChartData(
            chartDataPace,
            dataPointsPace,
            averagePacePoints,
            labels,
            theme,
            "Pace (min/km)",
            "Average pace (min/km)",
        );

        distanceOptions = setOptions("Date", "Distance (km)", color, labels);

        paceOptions = setOptions("Date", "Pace (min/km)", color, labels);

        items = [
            {
                label: "Distance (km) per run",
                value: 1,
                component: LineChart as typeof SvelteComponent,
                data: chartDataDistance,
                options: distanceOptions,
            },
            {
                label: "Pace (min/km) per run",
                value: 2,
                component: LineChart as typeof SvelteComponent,
                data: chartDataPace,
                options: paceOptions,
            },
        ];
    });

    onDestroy(() => {
        data = [];
        chartDataDistance = [];
        chartDataPace = [];
    });
</script>

<Tabs {items} />
