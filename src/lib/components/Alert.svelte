<script lang="ts">
  import type { Snippet } from "svelte"

  let {
    type,
    children
  }: {
    type: "error" | "warning" | "success" | "info"
    children: Snippet
  } = $props()

  function getDivClass() {
    const typeClass = {
      error: "bg-red-300",
      warning: "bg-orange-300",
      success: "bg-green-300",
      info: "bg-blue-300"
    }[type]

    return `flex items-center rounded-lg text-sm p-4 border-4 border-dashed border-black ${typeClass}`
  }
</script>

<div class={getDivClass()}>
  {@render children()}
</div>
