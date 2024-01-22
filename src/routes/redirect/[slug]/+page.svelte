<script lang="ts">
    // Your script code goes here
    import { onMount } from "svelte";
    import { userData, userStats } from "../../../store";
    import { goto } from "$app/navigation";

    export let data;

    onMount(async () => {
        try {
            if (data.userData) {
                userData.set(data.userData.athlete);
                localStorage.setItem("expires_at", String(data.userData.expires_at));
                localStorage.setItem("refresh_token", data.userData.refresh_token);
                localStorage.setItem("access_token", data.userData.access_token);
                localStorage.setItem("user_id", String(data.userData.athlete.id));
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
</main>

<style>
    /* Your styles go here */
</style>
