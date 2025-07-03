import { component$, useId } from "@builder.io/qwik"
import { type JSXOutput } from "@builder.io/qwik"

export interface InputEmailProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  icon?: JSXOutput
}

export const InputEmail = component$<InputEmailProps>(({ name, label, placeholder, required, icon }) => {
  const id = useId()

  return (
    <>
      <label for={id} class="mb-2 block text-sm font-medium">
        {label}
      </label>
      <div class="relative">
        {icon && <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">{icon}</div>}
        <input
          type="email"
          id={id}
          name={name}
          class={[
            "block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 transition hover:bg-gray-100 focus:ring-4 focus:ring-blue-300 focus:outline-none",
            icon ? "ps-10" : ""
          ].join(" ")}
          placeholder={placeholder}
          required={required}
        />
      </div>
    </>
  )
})
