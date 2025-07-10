<script lang="ts">
  import "../app.css"

  let { children } = $props()

  let showGoToTop = $state(false)
  let showOnPx = 150

  function goTop() {
    document.body.scrollIntoView()
  }

  function scrollContainer() {
    return document.documentElement || document.body
  }

  function handleOnScroll() {
    if (!scrollContainer()) {
      return
    }

    if (scrollContainer().scrollTop > showOnPx) {
      showGoToTop = true
    } else {
      showGoToTop = false
    }
  }
</script>

<svelte:head>
  <title>Toonka | Reading simplified</title>
  <meta name="description" content="Bookmark keeper and publication tracker." />
</svelte:head>

<svelte:window on:scroll={handleOnScroll} />

<div class="fixed bottom-5 right-5 flex flex-col gap-2">
  {#if showGoToTop}
    <button
      class="p-2 border-5 border-dashed border-black bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer transition"
      onclick={goTop}
      aria-label="up"
    >
      <svg
        class="w-6 h-6 text-stone-600"
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        ><path
          fill="currentColor"
          d="m4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8z"
        /></svg
      >
    </button>
  {/if}
  <button
    class="p-2 border-5 border-dashed border-black bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer transition"
    aria-label="theme"
  >
    <svg
      class="w-6 h-6 text-stone-600"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="M14 2c1.82 0 3.53.5 5 1.35c-2.99 1.73-5 4.95-5 8.65s2.01 6.92 5 8.65A10 10 0 0 1 14 22C8.48 22 4 17.52 4 12S8.48 2 14 2"
      /></svg
    >
  </button>
</div>

{@render children()}
