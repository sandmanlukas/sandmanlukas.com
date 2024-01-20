<script>
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
</script>

<main>
    {#if $page.status === 404}
        <p>Oops, this page couldn't be found.</p>
    {:else}
        <p>Oops, an error occurred.</p>
    {/if}
    <button on:click={() => goto("/", { replaceState: true })}
        >Go back to the home page.</button
    >
</main>

<style>
    button {
        background-color: rgba(255, 255, 255, 0.7);
        color: #000000b3;
        border-radius: 5px;
        padding: 1rem;
        margin: 1rem;
    }
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 50vh;
        text-align: center;
    }

    h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    p {
        font-size: 1.5rem;
    }
</style>
