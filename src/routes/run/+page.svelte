<script lang="ts">
    import { userData, userStats, userActivities } from "../../store";
    import {
        getUserActivities,
        getUserData,
        getUserStats,
        refreshToken,
    } from "../../utils";
    import { PUBLIC_CLIENT_ID } from "$env/static/public";
    import { onMount } from "svelte";

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
                        userStats.set(data.data);
                    }
                }),
                getUserActivities(accessToken).then((data) => {
                    if (data) {
                        userActivities.set(data);
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

        totalRunDistance = parseFloat((totalRunDistance / 1000).toFixed(1));
        totalRideDistance = parseFloat((totalRideDistance / 1000).toFixed(1));
        totalSwimDistance = parseFloat((totalSwimDistance / 1000).toFixed(1));
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
    {#if loading}
        <div class="centered">
            <p>Fetching your data...</p>
            <div class="spinner">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
    {/if}

    {#if $userData === null && $userStats === null && $userActivities === null}
        <div class="centered">
            <p>Visualize your Strava data by pressing the button below.</p>
            <button on:click={() => handleLogin(uri)}
                >Connect with Strava</button
            >
        </div>
    {:else}
        <div>
            {#if name}
                <h2>Hi, {name}!</h2>
            {/if}

            {#if totalRunDistance > 0}
                <p>Total run distance: {totalRunDistance} km</p>
            {/if}
            {#if totalRideDistance > 0}
                <p>Total ride distance: {totalRideDistance} km</p>
            {/if}
            {#if totalSwimDistance > 0}
                <p>Total swim distance: {totalSwimDistance} km</p>
            {/if}
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
    /* Add your styles here */
</style>
