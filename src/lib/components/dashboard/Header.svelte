<script lang="ts">
  import logo from "$lib/assets/logo.svg"
</script>

<header class="p-4">
  <div class="flex items-center bg-white border-5 border-dashed border-black rounded-lg p-3">
    <div class="flex items-center gap-6">
      <a href="/"><img class="h-8" src={logo} alt="" /></a>
      <a class="border-dashed border-black hover:border-b-4 transition" href="/dashboard"
        >dashboard</a
      >
      <a class="border-dashed border-black hover:border-b-4 transition" href="">search</a>
    </div>
    <div></div>
  </div>
</header>
