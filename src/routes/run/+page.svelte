<script lang="ts">
    import { userData, userStats, userActivities } from "../../store";
    import {
        convertSeconds,
        formatDate,
        formatTime,
        getTypeIcon,
        getUserActivities,
        getUserData,
        getUserStats,
        refreshToken,
    } from "../../utils";
    import { PUBLIC_CLIENT_ID } from "$env/static/public";
    import { onMount } from "svelte";
    import type { Activity, Totals, UserStats } from "../../types";

    const mountEverestHeight = 8848;

    let uri = "";
    let name = "";
    let totalRuns = 0;
    let avgRunDistance = 0;
    let longestRunDistance: number | null = 0;
    let totalRunDistance: number | undefined = 0;
    let totalRunTime: string | undefined = "";
    let totalAverageSpeed: number | undefined = 0;
    let totalElevationGain = 0;
    let totalRideDistance = 0;
    let totalSwimDistance = 0;

    let loading = true;

    const handleLogin = (uri: string) => {
        const redirectUrl = `http://${uri}/redirect`;
        const scope = "read_all,activity:read_all";
        window.location.href = `http://www.strava.com/oauth/authorize?client_id=${PUBLIC_CLIENT_ID}&response_type=code&redirect_uri=${redirectUrl}/exchange_token&approval_prompt=force&scope=${scope}`;
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

    const formatActivities = (activities: Activity[]) => {
        const newActivities = [...activities];

        let longestRun = 0;
        for (const activity of newActivities) {
            if (
                activity.sport_type === "Run" &&
                activity.distance > longestRun
            ) {
                longestRun = activity.distance;
            }

            const startDate = new Date(activity.start_date);
            const startDateLocal = new Date(activity.start_date_local);
            activity.start_date_formatted = formatDate(startDate);
            activity.start_date_local_formatted = formatDate(startDateLocal);
            activity.start_time = formatTime(startDate);
            activity.start_time_local = formatTime(startDateLocal);

            activity.moving_time_str = convertSeconds(activity.moving_time);
            activity.elapsed_time_str = convertSeconds(activity.elapsed_time);

            // Convert distance to km, 1m/s = 0.06km/min
            activity.average_speed_km = parseFloat(
                (activity.average_speed * 0.06).toFixed(2),
            );
        }

        if ($userStats) {
            $userStats["biggest_run_distance"] = parseFloat((longestRun / 1000).toFixed(1));
        }
        return newActivities;
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

                    const totalAverageSpeed = parseFloat(
                        (totalTimeInMinutes / totalDistanceInKm).toFixed(2),
                    );

                    statObject.total_average_speed = totalAverageSpeed;
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
                        userActivities.set(activities);
                        console.log(activities);
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
            longestRunDistance = $userStats["biggest_run_distance"];

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
    };

    onMount(async () => {
        uri = window.location.host;

        try {
            await handleTokenExpiration();
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
    {:else if loading}
        <div class="centered">
            <p>Fetching your data...</p>
            <div class="spinner">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    {:else if $userData && $userStats && $userActivities}
        <div class="user-card">
            <img
                src={$userData?.profile_medium}
                alt="User profile image"
                aria-hidden="true"
                class="user-image"
            />
            <div class="user-info">
                <h2 class="user-name">{name}</h2>
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
                            Total Elevation Gain: {totalElevationGain} m (or {(
                                totalElevationGain / mountEverestHeight
                            ).toFixed(1)} Mt Everest's)
                        </p>
                    {/if}
                    {#if avgRunDistance}
                        <p>Average Run Distance: {avgRunDistance} km</p>
                    {/if}
                    {#if longestRunDistance}
                        <p>Longest Run: {longestRunDistance} m</p>
                    {/if}
                    {#if totalAverageSpeed}
                        <p>Average Speed: {totalAverageSpeed} min/km</p>
                    {/if}
                </div>
            </div>
        </div>

        <div>
            <h2>Activities</h2>
            {#each $userActivities as activity}
                <div class="activity">
                    <div class="activity-title">
                        <h3 class="activity-name">{activity.name} -</h3>
                        <p class="mirror">{getTypeIcon(activity.sport_type)}</p>
                    </div>
                    <div class="activity-date">
                        <p>
                            {activity.start_date_local_formatted} at {activity.start_time_local}
                        </p>
                    </div>
                    <div class="activity-details">
                        <span
                            >{(activity.distance / 1000).toFixed(1)} km @ {activity.average_speed_km}
                            min/km | {activity.moving_time_str}</span
                        >
                    </div>
                    <p>{activity.total_elevation_gain}</p>
                    <p>{activity.start_latlng}</p>
                    <p>{activity.end_latlng}</p>
                    <p>{activity.map}</p>
                    <p>{activity.workout_type}</p>
                    <p>{activity.max_speed}</p>
                    <p>{activity.gear_id}</p>
                </div>
            {/each}
        </div>
    {/if}
</main>

<style>
    .mirror {
        transform: scaleX(-1);
        display: inline-block;
        font-size: 1.5em;
        margin-left: 0.5rem;
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
        margin-bottom: 10px;
        border-radius: 10px;
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
        background-color: #fa6607; /* Green */
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

    .user-card {
        display: flex;
        align-items: center;
        padding: 20px;
        border: 1px solid var(--dot-color);
        border-radius: 10px;
    }

    .user-image {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-right: 20px;
    }

    .user-info {
        display: flex;
        flex-direction: column;
    }

    .user-stats {
        margin-top: 10px;
        text-align: left;
    }

    .user-name {
        text-align: left;
        font-weight: bold;
    }
    /* Add your styles here */
</style>
