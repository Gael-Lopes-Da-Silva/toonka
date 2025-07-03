import { component$ } from '@builder.io/qwik';
import type { PropFunction, JSXOutput } from "@builder.io/qwik"

export interface AlertProps {
  show: boolean
  type: "error" | "warning" | "success" | "info"
  message: JSXOutput
  onClose$: PropFunction<() => void>
}

export const Alert = component$<AlertProps>(({ show, message, type, onClose$ }) => {
  return (
    <>
      {show && (
        <div class={[
          "flex items-center p-4 border border-solid rounded-lg",
          type === "error" ? "border-red-400 bg-red-300" : "",
          type === "warning" ? "border-orange-400 bg-orange-300" : "",
          type === "success" ? "border-green-400 bg-green-300" : "",
          type === "info" ? "border-blue-400 bg-blue-300" : "",
        ].join(" ")}>
          {message}
          <button class="ml-auto hover:cursor-pointer" onClick$={onClose$}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#000000"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>
      )}
    </>
  );
});
