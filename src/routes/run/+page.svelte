<script>
    import { userData, userStats } from "../../store";
    import { getUserData, getUserStats } from "../../utils";
    import { PUBLIC_CLIENT_ID } from "$env/static/public";
    import { onMount } from "svelte";

    const handleLogin = () => {
        const redirectUrl = "http://localhost:5173/redirect";
        const scope = "read_all";
        window.location.href = `http://www.strava.com/oauth/authorize?client_id=${PUBLIC_CLIENT_ID}&response_type=code&redirect_uri=${redirectUrl}/exchange_token&approval_prompt=force&scope=${scope}`;
    };

    let isTokenExpired = true;
    let name = "";
    let totalRunDistance = 0;
    let totalRideDistance = 0;
    let totalSwimDistance = 0;

    onMount(async () => {
        const expiresAtStr = localStorage.getItem("expires_at");
        const expiresAt = expiresAtStr ? parseInt(expiresAtStr) : null;
        const currentTime = new Date().getTime();

        if (expiresAt && expiresAt < currentTime) {
            console.log("Token is valid");

            const userId = localStorage.getItem("user_id");
            const accessToken = localStorage.getItem("access_token");

            if (userId && accessToken) {
                await getUserStats(userId, accessToken).then((data) => {
                    if (data) {
                        console.log(data.data);
                        userStats.set(data.data);
                    }
                });

                await getUserData(accessToken).then((data) => {
                    if (data) {
                        console.log(data.data);
                        userData.set(data.data);
                    }
                });
            }
        } else {
            console.log('Token is invalid');
        }

        name =
            $userData 
                ? $userData["firstname"]
                : "";

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
    });
</script>

<main>
    {#if $userData === null && $userStats === null}
        <div class="centered">
            <p>Visualize your Strava data by pressing the button below.</p>
            <button on:click={handleLogin}>Connect with Strava</button>
        </div>
    {:else if $userData !== null && $userStats !== null}
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
