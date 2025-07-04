<script lang="ts">
  import type { Snippet } from "svelte"

  let {
    type,
    children
  }: {
    children: Snippet
    type: "error" | "warning" | "success" | "info"
  } = $props()

  function getClass() {
    const baseClass = "flex items-center rounded-lg border border-solid p-4"
    const typeClass = {
      error: "border-red-400 bg-red-300",
      warning: "border-orange-400 bg-orange-300",
      success: "border-green-400 bg-green-300",
      info: "border-blue-400 bg-blue-300"
    }[type]

    return `${baseClass} ${typeClass}`
  }
</script>

<div class={getClass()}>
  {@render children()}
</div>
