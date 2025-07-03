import { component$ } from "@builder.io/qwik"

export interface InputSubmitProps {
  value: string
}

export const InputSubmit = component$<InputSubmitProps>(({ value }) => {
  return (
    <>
      <input
        type="submit"
        value={value}
        class="w-full cursor-pointer rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white transition hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 focus:outline-none"
      />
    </>
  )
})
