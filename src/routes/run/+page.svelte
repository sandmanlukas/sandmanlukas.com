<script lang="ts">
    import { userData, userStats, userActivities } from "../../store";
    import {
        convertSeconds,
        getUserActivities,
        getUserData,
        getUserStats,
        refreshToken,
    } from "../../utils";
    import { PUBLIC_CLIENT_ID } from "$env/static/public";
    import { onMount } from "svelte";
    import type { Totals, UserStats } from "../../types";

    let uri = "";
    let name = "";
    let totalRunDistance = 0;
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
                    statObject.distance = parseFloat(
                        (statObject.distance / 1000).toFixed(1),
                    );
                    statObject.elapsed_time = convertSeconds(
                        statObject.elapsed_time as number,
                    );
                    statObject.moving_time = convertSeconds(
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
                        userActivities.set(data);
                        console.log(data);
                    }
                }),
            ]);
        } finally {
            loading = false;
        }
    };

    const initPageData = (): void => {
        name = $userData ? $userData["firstname"] : "";

        totalRunDistance =
            $userStats && $userStats["all_run_totals"]
                ? $userStats["all_run_totals"]["distance"]
                : 0;
        totalRideDistance =
            $userStats && $userStats["all_ride_totals"]
                ? $userStats["all_ride_totals"]["distance"]
                : 0;
        totalSwimDistance =
            $userStats && $userStats["all_swim_totals"]
                ? $userStats["all_swim_totals"]["distance"]
                : 0;
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
                <h2 class="user-name">{$userData?.firstname}</h2>
                <div class="user-stats">
                    <p>Total Runs: {$userStats?.all_run_totals.count}</p>
                    {#if totalRunDistance > 0}
                        <p>Total Run Distance: {totalRunDistance} km</p>
                    {/if}
                    <p>
                        Total Running Time: {$userStats?.all_run_totals
                            .moving_time}
                    </p>
                </div>
            </div>
        </div>
    {/if}

    <!-- Add your page content here -->
</main>

<style>
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
