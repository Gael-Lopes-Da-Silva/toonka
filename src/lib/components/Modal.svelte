<script lang="ts">
  import { tick, type Snippet } from "svelte"

  let {
    onclose = () => {},
    main,
    header,
    footer
  }: {
    onclose: () => void
    main: Snippet
    header?: Snippet
    footer?: Snippet
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
      document.addEventListener("mousedown", handleClick, true)
      document.addEventListener("keydown", handleKeydown)
    })

    return () => {
      const index = modalStack.indexOf(modalRef)
      if (index !== -1) {
        modalStack.splice(index, 1)
      }
      document.removeEventListener("mousedown", handleClick, true)
      document.removeEventListener("keydown", handleKeydown)
    }
  })
</script>

<div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
  <div
    {id}
    class="bg-white border-5 border-dashed border-black rounded-lg shadow-md min-w-[200px] min-h-[150px] max-w-full max-h-full overflow-auto"
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
