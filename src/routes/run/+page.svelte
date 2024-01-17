<script>
    import { userData, userStats } from "../../store";
    import {PUBLIC_CLIENT_ID} from '$env/static/public';


    const handleLogin = () => {
        const redirectUrl = "http://localhost:5173/redirect";
        const scope = "read";
        window.location.href = `http://www.strava.com/oauth/authorize?client_id=${PUBLIC_CLIENT_ID}&response_type=code&redirect_uri=${redirectUrl}/exchange_token&approval_prompt=force&scope=${scope}`;
    };

    let name =
        $userData && $userData["athlete"]
            ? $userData["athlete"]["firstname"]
            : null;

    let totalRunDistance =
        $userStats && $userStats["all_run_totals"]
            ? $userStats["all_run_totals"]["distance"]
            : 0;
    let totalRideDistance =
        $userStats && $userStats["all_ride_totals"]
            ? $userStats["all_ride_totals"]["distance"]
            : 0;
    let totalSwimDistance =
        $userStats && $userStats["all_swim_totals"]
            ? $userStats["all_swim_totals"]["distance"]
            : 0;

    totalRunDistance = parseFloat((totalRunDistance / 1000).toFixed(1));
    totalRideDistance = parseFloat((totalRideDistance / 1000).toFixed(1));
    totalSwimDistance = parseFloat((totalSwimDistance / 1000).toFixed(1));
</script>

<main>
    <h3>Strava Dashboard</h3>

    {#if $userData === null && $userStats === null}
        <button on:click={handleLogin}>Connect with Strava</button>
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
    /* Add your styles here */
</style>
