<script lang="ts">
    import { userData, userStats, userActivities } from "../../store";
    import type { Activity, Totals, UserStats } from "../../types";
    import {
        _formatActivities,
        convertSeconds,
        filterActivitiesByDate,
        filterActivitiesByType,
        getTypeIcon,
        getUserActivities,
        getUserData,
        getUserStats,
        refreshToken,
    } from "../../utils";
    import { PUBLIC_CLIENT_ID } from "$env/static/public";
    import { onMount } from "svelte";

    import Flatpickr from "svelte-flatpickr";

    import "@fortawesome/fontawesome-free/css/all.min.css";
    import "flatpickr/dist/flatpickr.css";
    import Leaflet from "$lib/Leaflet.svelte";
    import FilteredStats from "$lib/FilteredStats.svelte";

    const mountEverestHeight = 8848;

    let uri = "";
    let name = "";
    let totalRuns = 0;
    let avgRunDistance = 0;
    let longestRunDistance: number | null = 0;
    let longestStreak: number = 0;
    let totalRunDistance: number | undefined = 0;
    let totalRunTime: string | undefined = "";
    let totalAverageSpeed: string | undefined = "";
    let totalElevationGain = 0;

    let activeActivityIndex = 0;

    let totalRideDistance = 0;
    let totalSwimDistance = 0;

    let filterType = "";

    let filterDateRange: Date[] = [];

    let filteredActivities: Activity[] = [];
    let activityTypes: string[] = [];

    let firstDate: string;
    let lastDate: string;

    let options = {
        enableTime: false,
        mode: "range" as const,
        dateFormat: "Y-m-d",
        onChange: (selectedDates: Date[]) => {
            filterDateRange = selectedDates;
        },
        minDate: "",
        maxDate: "",
    };

    $: if ($userActivities.length > 0) {
        activityTypes = [...new Set($userActivities.map((a) => a.sport_type))];
        filteredActivities = $userActivities;

        // If there is a filter, filter the activities
        if (filterType) {
            filteredActivities = filterActivitiesByType(
                filteredActivities,
                filterType,
            );
        }

        // If there is a date filter, filter the activities
        if (filterDateRange.length > 0) {
            let firstDateFilter = filterDateRange[0];
            let lastDateFilter = filterDateRange[1];

            // If the user selects two dates, filter by those dates, else filter by firstDate only
            if (firstDateFilter && lastDateFilter) {
                filteredActivities = filterActivitiesByDate(
                    filteredActivities,
                    firstDateFilter,
                    lastDateFilter,
                );
            }
        }

        // Get first and lastDate if not set
        if (!firstDate && !lastDate) {
            const sortedActivities = filteredActivities.sort(
                (a, b) =>
                    new Date(b.start_date_local).getTime() -
                    new Date(a.start_date_local).getTime(),
            );

            if (sortedActivities.length > 0) {
                firstDate = new Date(
                    sortedActivities[
                        sortedActivities.length - 1
                    ].start_date_local,
                )
                    .toISOString()
                    .slice(0, 10);
                lastDate = new Date(sortedActivities[0].start_date_local)
                    .toISOString()
                    .slice(0, 10);
            }
            options["minDate"] = firstDate;
            options["maxDate"] = lastDate;
        }
    }

    let stravaActivityURL = "https://www.strava.com/activities/";

    let loading = true;

    const handleLogin = (uri: string) => {
        const redirectUrl = `http://${uri}/redirect`;
        const scope = "read_all,activity:read_all";
        window.location.href = `http://www.strava.com/oauth/authorize?client_id=${PUBLIC_CLIENT_ID}&response_type=code&redirect_uri=${redirectUrl}/exchange_token&approval_prompt=force&scope=${scope}`;
    };

    const handleActivityClick = (index: number) => {
        activeActivityIndex = index;
    };

    const handleTokenExpiration = async () => {
        const expiresAtStr = localStorage.getItem("expires_at");
        const expiresAt = expiresAtStr ? parseInt(expiresAtStr) : null;
        const currentTime = Date.now() / 1000;

        if (expiresAt && expiresAt > currentTime) {
            console.log("Token is valid");

            const userId = localStorage.getItem("user_id");
            const accessToken = localStorage.getItem("access_token");

            if (userId && accessToken) {
                await updateUserDataAndStats(userId, accessToken);
            }
        } else {
            console.log("Token is expired");

            const refreshedToken = localStorage.getItem("refresh_token");
            if (refreshedToken) {
                console.log("Refreshing token");
                const newTokens = await refreshToken(refreshedToken);

                const accessToken = newTokens.access_token;
                const userId = localStorage.getItem("user_id");

                localStorage.setItem("access_token", accessToken);
                localStorage.setItem("refresh_token", newTokens.refresh_token);
                localStorage.setItem("expires_at", newTokens.expires_at);

                if (userId && accessToken) {
                    await updateUserDataAndStats(userId, accessToken);
                }
            }
        }
    };

    export const formatActivities = (activities: Activity[]) => {
        const { formattedActivities, longestRun } =
            _formatActivities(activities);

        if ($userStats) {
            $userStats["longest_run_distance"] = parseFloat(
                (longestRun / 1000).toFixed(1),
            );

            $userStats["longest_run_streak"] = longestStreak;
        }
        return formattedActivities;
    };

    const formatStats = (stats: UserStats) => {
        const newStats = { ...stats };

        for (const key in stats) {
            if (
                typeof newStats[key as keyof UserStats] === "object" &&
                newStats[key as keyof UserStats] !== null
            ) {
                // Convert distance to km
                const statObject = newStats[key as keyof UserStats] as Totals;
                if (statObject) {
                    const totalDistanceInKm = parseFloat(
                        (statObject.distance / 1000).toFixed(1),
                    );
                    const totalTimeInMinutes = parseFloat(
                        (statObject.moving_time / 60).toFixed(1),
                    );

                    var pace =
                        (statObject.moving_time / statObject.distance / 60) *
                        1000;
                    var leftover = pace % 1;
                    var minutes = pace - leftover;
                    var seconds: string | number = Math.round(leftover * 60);
                    seconds = seconds < 10 ? `0${seconds}` : seconds;
                    var paceStr = `${minutes}:${seconds}`;

                    statObject.total_average_speed = paceStr;
                    statObject.distance_km = totalDistanceInKm;

                    statObject.elapsed_time_str = convertSeconds(
                        statObject.elapsed_time as number,
                    );
                    statObject.moving_time_str = convertSeconds(
                        statObject.moving_time as number,
                    );
                }
            }
        }
        return newStats;
    };
    const updateUserDataAndStats = async (
        userId: string,
        accessToken: string,
    ) => {
        try {
            await Promise.all([
                getUserData(accessToken).then((data) => {
                    if (data) {
                        userData.set(data.data);
                    }
                }),
                getUserStats(userId, accessToken).then((data) => {
                    if (data) {
                        const stats = formatStats(data.data);
                        userStats.set(stats);
                    }
                }),
                getUserActivities(accessToken).then((data) => {
                    if (data) {
                        const activities = formatActivities(data);
                        filteredActivities = activities;
                        userActivities.set(activities);
                    }
                }),
            ]);
        } finally {
            loading = false;
        }
    };

    const initPageData = (): void => {
        if ($userData) {
            name = `${$userData["firstname"]} ${$userData["lastname"]}`;
        }

        if ($userStats) {
            totalRuns = $userStats["all_run_totals"]["count"];
            totalRunDistance = $userStats["all_run_totals"]["distance_km"];
            totalRunTime = $userStats["all_run_totals"]["moving_time_str"];
            totalElevationGain = $userStats["all_run_totals"]["elevation_gain"];
            totalRideDistance = $userStats["all_ride_totals"]["distance"];
            totalSwimDistance = $userStats["all_swim_totals"]["distance"];
            longestRunDistance = $userStats["longest_run_distance"]
                ? $userStats["longest_run_distance"]
                : 0;
            longestStreak = $userStats["longest_run_streak"]
                ? $userStats["longest_run_streak"]
                : 0;

            if (totalRuns && totalRunDistance) {
                avgRunDistance = parseFloat(
                    (totalRunDistance / totalRuns).toFixed(1),
                );

                totalAverageSpeed =
                    $userStats["all_run_totals"]["total_average_speed"];
            }

            totalRideDistance = $userStats["all_ride_totals"]["distance"];
            totalSwimDistance = $userStats["all_swim_totals"]["distance"];
        }

        if ($userActivities && filteredActivities.length === 0) {
            filteredActivities = $userActivities;
        }
    };

    onMount(async () => {
        uri = window.location.host;

        try {
            if (
                $userData === null &&
                $userStats === null &&
                $userActivities.length === 0
            ) {
                await handleTokenExpiration();
            }
            initPageData();
        } catch (error) {
            console.log(error);
        }
    });
</script>

<main>
    {#if $userData === null && $userStats === null && $userActivities.length === 0}
        <div class="centered">
            <p>Visualize your Strava data by pressing the button below.</p>
            <button on:click={() => handleLogin(uri)}
                >Connect with Strava</button
            >
        </div>
    {:else if $userData && $userStats && $userActivities}
        <div class="user-card card-border">
            <img
                src={$userData?.profile_medium}
                alt="User profile image"
                aria-hidden="true"
                class="user-image"
            />
            <div class="user-info">
                <h2 class="user-name">{name}</h2>

                <div class="user-info-grid">
                    <div class="user-stats">
                        <p>Total Runs: {totalRuns}</p>
                        {#if totalRunDistance}
                            <p>Total Run Distance: {totalRunDistance} km</p>
                        {/if}
                        {#if totalRunTime}
                            <p>
                                Total Running Time: {totalRunTime}
                            </p>
                        {/if}
                        {#if totalElevationGain > 0}
                            <p>
                                Total Elevation Gain: {totalElevationGain} m (or
                                {(
                                    totalElevationGain / mountEverestHeight
                                ).toFixed(1)} Mt Everest's)
                            </p>
                        {/if}
                    </div>

                    <div class="user-stats">
                        {#if avgRunDistance}
                            <p>Average Run Distance: {avgRunDistance} km</p>
                        {/if}
                        {#if totalAverageSpeed}
                            <p>Average Speed: {totalAverageSpeed} min/km</p>
                        {/if}
                        {#if longestRunDistance}
                            <p>Longest Run: {longestRunDistance} km</p>
                        {/if}
                        {#if longestStreak}
                            <p class="font-bold">
                                Longest Streak: {longestStreak} days
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <div>
            {#if filteredActivities.length !== $userActivities.length}
                <FilteredStats
                    activities={filteredActivities}
                    filteredDateRange={filterDateRange}
                />
            {/if}
            <h2 class="activity-container-title">Activities</h2>
            <div class="filter-form">
                <select bind:value={filterType}>
                    <option value="">All types</option>
                    {#each activityTypes as type}
                        <option value={type}>{type}</option>
                    {/each}
                </select>
                <Flatpickr
                    {options}
                    bind:value={filterDateRange}
                    placeholder="Select a date or range."
                    size={23}
                ></Flatpickr>
                {#if filterDateRange.length > 0}
                    <button
                        class="clear-filter"
                        on:click={() => (filterDateRange = [])}
                        ><i class="fas fa-times"></i></button
                    >
                {/if}
            </div>
            <div class="activities-grid">
                <div class="activities-container">
                    {#each filteredActivities as activity, index (activity.id)}
                        <div
                            class="activity"
                            class:active={index === activeActivityIndex}
                        >
                            <button
                                class="activity-button"
                                on:click={() => handleActivityClick(index)}
                            >
                                <div class="activity-title">
                                    <a
                                        href={`${stravaActivityURL}/${activity.id}`}
                                        ><h3 class="activity-name">
                                            {activity.name}
                                        </h3></a
                                    ><span>&nbsp;-&nbsp;</span>
                                    <p class="mirror">
                                        {getTypeIcon(activity.sport_type)}
                                    </p>
                                </div>
                                <div class="activity-date">
                                    <p>
                                        {activity.start_date_local_formatted} at
                                        {activity.start_time_local}
                                    </p>
                                </div>
                                <div class="activity-details">
                                    <span>
                                        <i class="fas fa-route"></i>
                                        {(activity.distance / 1000).toFixed(1)} km
                                        <span class="divider">|</span>
                                        <i class="fas fa-tachometer-alt"></i>
                                        {activity.average_pace} min/km
                                        <span class="divider">|</span>
                                        <i class="fas fa-clock"></i>
                                        {activity.moving_time_str}
                                        <span class="divider">|</span>
                                        <i class="fas fa-mountain"></i>
                                        {activity.total_elevation_gain} m
                                    </span>
                                </div>
                            </button>
                        </div>
                    {/each}
                </div>
                {#if filteredActivities.length > 0 && filteredActivities[activeActivityIndex].map.summary_polyline}
                    <Leaflet
                        view={filteredActivities[activeActivityIndex]
                            .start_latlng}
                        encodedPolyline={filteredActivities[activeActivityIndex]
                            .map.summary_polyline}
                        zoom={13}
                    ></Leaflet>
                {:else}
                    <p>No map data for this activity :(</p>
                {/if}
            </div>
        </div>
    {:else if loading}
        <div class="centered">
            <p>Fetching your data...</p>
            <div class="spinner">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    {/if}
</main>

<style>
    div.active {
        background-color: var(--color-bg-0);
        color: var(--color-text);
        border-color: var(--dot-color);
    }

    .clear-filter {
        background-color: transparent;
        border: none;
        color: var(--dot-color);
        padding: 0;
        margin: 0;
        cursor: pointer;
    }
    .mirror {
        transform: scaleX(-1);
        display: inline-block;
        font-size: 1.5em;
        margin-left: 0.5rem;
    }

    .divider {
        margin: 0 0.1rem;
        opacity: 0.5;
    }

    .filter-form {
        display: flex;
        gap: 1rem;
        margin-bottom: 0.5rem;
        align-items: center;
    }

    .filter-form select {
        padding: 0.5rem;
        border: 1px solid var(--dot-color);
        color: var(--dot-color);
        background-color: inherit;
        border-radius: 4px;
        height: 40px;
        /* font-size: 1rem; */
    }

    .activities-grid {
        display: grid;
        grid-template-columns: 2fr 2fr;
        gap: 1rem;
    }
    .activities-container {
        width: 100%;
        height: 500px;
        overflow-y: auto;
    }

    .activity-container-title {
        text-align: left;
        margin-top: 2rem;
        margin-bottom: 0;
        font-size: large;
        font-weight: bold;
    }

    .activity-details {
        text-align: left;
        display: flex;
        justify-content: space-between;
    }
    .activity-date {
        text-align: left;
        padding-top: 0;
        margin-top: 0;
        opacity: 0.65;
        font-size: small;
    }
    .activity-title {
        display: flex;
        align-items: center;
        margin-bottom: 0;
        padding-bottom: 0;
    }
    .activity-name {
        text-align: left;
        margin-bottom: 0;
        font-weight: bold;
    }
    .activity {
        border: 1px solid var(--dot-color);
        padding: 10px;
        border-radius: 10px;
        background-color: inherit;
        color: inherit;
        margin-bottom: 0.5rem;
        text-align: left;
    }
    .activity-button {
        background-color: inherit;
        border: none;
        color: inherit;
        cursor: pointer;
        margin: 0;
        padding: 0;
        width: 100%;
    }
    .spinner {
        width: 60px;
        display: flex;
        justify-content: space-around;
        margin-top: 1rem;
    }

    .dot {
        width: 15px;
        height: 15px;
        background-color: var(--dot-color);
        border-radius: 50%;
        animation: dot-bounce 1s infinite ease-in-out both;
    }

    .dot:nth-child(1) {
        animation-delay: -0.32s;
    }
    .dot:nth-child(2) {
        animation-delay: -0.16s;
    }

    @keyframes dot-bounce {
        0%,
        80%,
        100% {
            transform: scale(0);
        }
        40% {
            transform: scale(1);
        }
    }

    .centered {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 50vh;
    }
    button {
        background-color: #fa6607; /* Orange */
        border: none;
        color: white;
        padding: 15px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        margin: 1rem;
        cursor: pointer;
        border-radius: 10px;
    }
    .user-image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-right: 20px;
    }
</style>
