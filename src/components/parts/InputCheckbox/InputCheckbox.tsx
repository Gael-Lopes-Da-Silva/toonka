import { component$, useId } from "@builder.io/qwik"
import { type JSXOutput } from "@builder.io/qwik"

export interface InputCheckboxProps {
  text?: JSXOutput
  required?: boolean
}

export const InputCheckbox = component$<InputCheckboxProps>(({ text, required }) => {
  const id = useId()

  return (
    <>
      <div class="flex">
        <div class="flex items-center justify-center">
          <input
            id={id}
            type="checkbox"
            value=""
            class="peer relative h-4 w-4 shrink-0 appearance-none rounded-sm border border-solid border-gray-300 bg-gray-50 transition checked:bg-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
            required={required}
          />
          <svg
            class="pointer-events-none absolute hidden h-6 w-6 text-white peer-checked:block"
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
          >
            <path fill="currentColor" d="m10.5 16.2l-4-4l1.4-1.4l2.6 2.6l5.6-5.6l1.4 1.4l-7 7Z" />
          </svg>
        </div>
        {text && (
          <label for={id} class="ms-2 text-sm font-medium">
            {text}
          </label>
        )}
      </div>
    </>
  )
})
