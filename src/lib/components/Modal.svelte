<script lang="ts">
  import { tick, type Snippet } from "svelte"

  let {
    onclose = () => {},
    header = null,
    main,
    footer = null
  }: {
    onclose: () => void
    header: Snippet | null
    main: Snippet
    footer: Snippet | null
  } = $props()

  let id = $props.id()

  let modalRef: HTMLElement
  const modalStack: HTMLElement[] = ((window as any).modalStack ??= [])

  function handleClick(event: MouseEvent) {
    if (modalStack[modalStack.length - 1] === modalRef) {
      if (!modalRef.contains(event.target as Node)) {
        onclose()
      }
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Escape" && modalStack[modalStack.length - 1] === modalRef) {
      onclose()
    }
  }

  $effect(() => {
    modalStack.push(modalRef)

    tick().then(() => {
      document.addEventListener("click", handleClick, true)
      document.addEventListener("keydown", handleKeydown)
    })

    return () => {
      const index = modalStack.indexOf(modalRef)
      if (index !== -1) {
        modalStack.splice(index, 1)
      }
      document.removeEventListener("click", handleClick, true)
      document.removeEventListener("keydown", handleKeydown)
    }
  })
</script>

<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
  <div
    {id}
    class="bg-white border border-solid border-gray-300 rounded-lg shadow-lg min-w-[300px] min-h-[200px] max-w-full max-h-full overflow-auto"
    role="dialog"
    aria-modal="true"
    tabindex="-1"
    bind:this={modalRef}
  >
    {#if header}
      <header>
        {@render header()}
      </header>
    {/if}

    <main>
      {@render main()}
    </main>

    {#if footer}
      <footer>
        {@render footer()}
      </footer>
    {/if}
  </div>
</div>
