<script lang="ts">
  import { enhance } from "$app/forms"
  import { Header } from "$lib/components/dashboard"
</script>

<Header />

<form class="fixed bottom-5 left-5" action="?/logout" method="POST" use:enhance>
  <button
    class="p-2 border-5 border-dashed border-black bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer transition"
    type="submit"
    aria-label="logout"
  >
    <svg
      class="w-6 h-6 text-stone-600"
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      ><path
        fill="currentColor"
        d="m17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4z"
      /></svg
    >
  </button>
</form>
