<script lang="ts">
  import { slide } from "svelte/transition";

  export let key: string;
  export let duration: number = 300;
</script>

{#key key}
  <div in:slide|global={{ duration, delay: duration }} out:slide|global={{ duration }}>
    <slot/>
  </div>
{/key}

<style>
  div {
    position: relative;
    margin:0 auto;
    width: 80%;
    display: flex;
    text-align:center; /* TODO: check if we like this. */
    }
</style>
