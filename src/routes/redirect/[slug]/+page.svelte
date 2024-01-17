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
                userData.set(data.userData);
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
