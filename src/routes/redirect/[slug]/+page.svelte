<script>
    // Your script code goes here
    import { onMount } from "svelte";
    import { userData, userStats } from "../../../store";
    import { goto } from "$app/navigation";

    let params;
    /**
     * @type {string | null}
     */
    let state;
    /**
     * @type {string | null}
     */
    let code;
    /**
     * @type {string | null}
     */
    let scope;
    export let data;

    onMount(async () => {
        try {
            if (data.userData) {
                userData.set(data.userData.athlete);
                localStorage.setItem("expires_at", data.userData.expires_at);
                localStorage.setItem("refresh_token", data.userData.refresh_token);
                localStorage.setItem("access_token", data.userData.access_token);
                localStorage.setItem("user_id", data.userData.athlete.id);
            } 

            if (data.userStats) {
                userStats.set(data.userStats);
            }

            goto("/run", { replaceState: true });
        } catch (error) {
            goto("/", { replaceState: true });
        }
    });
</script>

<main>
    <div>Loading...</div>
</main>

<style>
    /* Your styles go here */
</style>
