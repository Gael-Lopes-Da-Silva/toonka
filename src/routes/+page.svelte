<script lang="ts">
  import { enhance } from "$app/forms"
  import { Alert, Modal, Input } from "$lib/components"

  let { form } = $props()

  let loginModal = $state(false)
  let registerModal = $state(false)
</script>

<header class="flex items-center justify-center w-full">
  <div
    class="flex gap-10 p-2 m-4 border border-solid border-stone-300 bg-white rounded-xl shadow-md"
  >
    <div class="flex items-center gap-5">
      <a class="text-stone-600 hover:text-stone-800 transition" href="#">features</a>
      <a class="text-stone-600 hover:text-stone-800 transition" href="#">search</a>
      <a class="text-stone-600 hover:text-stone-800 transition" href="#">contact</a>
    </div>
    <div class="flex items-center gap-5">
      <button
        class="text-stone-600 hover:text-stone-800 cursor-pointer transition"
        onclick={() => (loginModal = true)}
      >
        Log in
      </button>
      <button
        class="py-1 px-3 border border-solid border-stone-300 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer transition"
        onclick={() => (registerModal = true)}
      >
        Register
      </button>
    </div>
  </div>
</header>

{#if loginModal}
  <Modal onclose={() => (loginModal = false)}>
    {#snippet main()}
      <form class="flex flex-col p-6" action="?/login" method="POST" use:enhance>
        {#if form?.from && form?.from == "login"}
          <div class="mb-6">
            <Alert type={form.type as "error" | "success" | "warning" | "info"}>
              {form.message}
            </Alert>
          </div>
        {/if}

        <div class="mb-6">
          <Input type="email" name="email" placeholder="john.doe@gmail.com" required>
            {#snippet label()}
              Email
            {/snippet}
            {#snippet icon()}
              <svg
                class="w-4 h-4 text-stone-500"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                ><path
                  fill="currentColor"
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
                /></svg
              >
            {/snippet}
          </Input>
        </div>

        <div class="mb-6">
          <Input type="password" name="password" placeholder="••••••••" required>
            {#snippet label()}
              Password
            {/snippet}
            {#snippet icon()}
              <svg
                class="w-4 h-4 text-stone-500"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                ><path
                  fill="currentColor"
                  d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z"
                /></svg
              >
            {/snippet}
          </Input>
        </div>

        <Input type="submit" value="Submit"></Input>
      </form>
    {/snippet}
  </Modal>
{/if}

{#if registerModal}
  <Modal onclose={() => (registerModal = false)}>
    {#snippet main()}
      <form class="flex flex-col p-6" action="?/register" method="POST" use:enhance>
        {#if form?.from && form?.from == "register"}
          <div class="mb-6">
            <Alert type={form.type as "error" | "success" | "warning" | "info"}>
              {form.message}
            </Alert>
          </div>
        {/if}

        <div class="mb-6">
          <Input type="text" name="username" placeholder="john_doe" required>
            {#snippet label()}
              Username
            {/snippet}
            {#snippet icon()}
              <svg
                class="w-4 h-4 text-stone-500"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                ><path
                  fill="currentColor"
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4s-4 1.79-4 4s1.79 4 4 4m0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4"
                /></svg
              >
            {/snippet}
          </Input>
        </div>
        <div class="mb-6">
          <Input type="email" name="email" placeholder="john.doe@gmail.com" required>
            {#snippet label()}
              Email
            {/snippet}
            {#snippet icon()}
              <svg
                class="w-4 h-4 text-stone-500"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                ><path
                  fill="currentColor"
                  d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
                /></svg
              >
            {/snippet}
          </Input>
        </div>
        <div class="mb-6">
          <Input type="password" name="password" placeholder="••••••••" required>
            {#snippet label()}
              Password
            {/snippet}
            {#snippet icon()}
              <svg
                class="w-4 h-4 text-stone-500"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                ><path
                  fill="currentColor"
                  d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z"
                /></svg
              >
            {/snippet}
          </Input>
        </div>
        <div class="mb-6">
          <Input type="checkbox" required>
            {#snippet label()}
              I agree with the <a class="text-blue-600 hover:underline" href="#">
                terms and conditions
              </a>
            {/snippet}
          </Input>
        </div>

        <Input type="submit" value="Submit"></Input>
      </form>
    {/snippet}
  </Modal>
{/if}
