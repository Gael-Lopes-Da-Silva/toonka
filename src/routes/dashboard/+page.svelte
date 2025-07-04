<script lang="ts">
  import { Modal } from "$lib/components"

  let showModal = $state(false)
</script>

<button onclick={() => (showModal = true)}>Show modal</button>

{#if showModal}
  <Modal onclose={() => (showModal = false)}>
    {#snippet header()}
      <p>test</p>
    {/snippet}

    {#snippet main()}
      <p>test</p>
    {/snippet}

    {#snippet footer()}
      <p>test</p>
    {/snippet}
  </Modal>
{/if}
