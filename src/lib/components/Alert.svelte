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
      error: "border-red-400 bg-red-300",
      warning: "border-orange-400 bg-orange-300",
      success: "border-green-400 bg-green-300",
      info: "border-blue-400 bg-blue-300"
    }[type]

    return `flex items-center rounded-lg text-sm p-4 border border-solid ${typeClass}`
  }
</script>

<div class={getDivClass()}>
  {@render children()}
</div>
