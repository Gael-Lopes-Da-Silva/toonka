import { component$, useSignal, Slot } from "@builder.io/qwik"
import { useVisibleTask$ } from "@builder.io/qwik"
import type { PropFunction } from "@builder.io/qwik"

export interface ModalProps {
  isOpen: boolean
  onClose$: PropFunction<() => void>
  title?: string
}

export const Modal = component$<ModalProps>(({ isOpen, onClose$, title }) => {
  const dialogRef = useSignal<HTMLDialogElement | undefined>()

  useVisibleTask$(({ track }) => {
    track(() => isOpen)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose$()
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.value && event.target instanceof Node) {
        if (event.target === dialogRef.value) {
          onClose$()
        }
      }
    }

    if (isOpen) {
      dialogRef.value?.showModal()
      document.addEventListener("keydown", handleKeyDown)
      dialogRef.value?.addEventListener("click", handleClickOutside)
    } else {
      dialogRef.value?.close()
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      dialogRef.value?.removeEventListener("click", handleClickOutside)
    }
  })

  return (
    <>
      {isOpen && (
        <dialog
          ref={dialogRef}
          class="fixed inset-0 z-50 m-auto rounded-lg border border-solid border-gray-300 bg-white shadow-md focus:outline-none"
        >
          {title && (
            <header class="flex gap-5 border-b border-solid border-gray-300 p-4">
              <h2 class="text-xl font-semibold">{title}</h2>
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
            </header>
          )}
          <main class="p-5">
            <Slot />
          </main>
        </dialog>
      )}
    </>
  )
})
