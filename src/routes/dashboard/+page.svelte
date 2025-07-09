<script lang="ts">
  import { enhance } from "$app/forms"
</script>

<form action="?/logout" method="POST" use:enhance>
  <button type="submit">Log out</button>
</form>
