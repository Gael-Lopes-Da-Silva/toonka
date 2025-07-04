<script lang="ts">
    import { Modal } from "$lib/components";

    let showModal = $state(false);
</script>

<button onclick={() => (showModal = true)}>Show modal</button>

{#if showModal}
    <Modal onclose={() => (showModal = false)}>
        {#snippet head()}
        {/snippet}

        {#snippet body()}
            <p>test</p>
        {/snippet}

        {#snippet foot()}
            <p>test</p>
        {/snippet}
    </Modal>
{/if}
