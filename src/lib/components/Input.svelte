<script lang="ts">
  import type { Snippet } from "svelte"

  let {
    type,
    name,
    label,
    value,
    placeholder,
    required,
    icon,
    min,
    max
  }: {
    type:
      | "text"
      | "email"
      | "tel"
      | "password"
      | "hidden"
      | "submit"
      | "button"
      | "checkbox"
      | "date"
      | "datetime-local"
      | "month"
      | "number"
      | "time"
      | "week"
      | "radio"
    name?: string
    label?: Snippet
    value?: string
    placeholder?: string
    required?: boolean
    icon?: Snippet
    min?: string
    max?: string
  } = $props()

  let id = $props.id()

  function getInputClass() {
    return `block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 transition hover:bg-gray-100 focus:ring-4 focus:ring-blue-300 focus:outline-none ${icon ? "ps-10" : ""}`
  }
</script>

{#if ["text", "email", "password", "hidden", "tel", "date", "datetime-local", "time", "week", "month", "number"].includes(type)}
  <div class="flex flex-col">
    {#if label}
      <label class="mb-2 block text-sm font-medium" for={id}>
        {@render label()}
      </label>
    {/if}
    <div class="relative">
      {#if icon}
        <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
          {@render icon()}
        </div>
      {/if}
      <input
        class={getInputClass()}
        {type}
        {id}
        {name}
        {value}
        {placeholder}
        {min}
        {max}
        {required}
      />
    </div>
  </div>
{:else if ["submit", "button"].includes(type)}
  <input
    class="w-full cursor-pointer rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 focus:outline-none"
    {type}
    {value}
  />
{:else if ["checkbox", "radio"].includes(type)}
  <div class="flex items-center">
    <input
      class="h-4 w-4 shrink-0 appearance-none rounded-sm border border-solid border-gray-300 bg-gray-50 transition checked:bg-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
      {type}
      {id}
      {name}
      {required}
    />
    {#if label}
      <label for={id} class="ms-2 text-xs font-medium">
        {@render label()}
      </label>
    {/if}
  </div>
{/if}
