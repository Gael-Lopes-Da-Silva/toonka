import { component$, useSignal } from "@builder.io/qwik";
import { Modal } from "~/components/Modal/Modal";
import type { DocumentHead } from "@builder.io/qwik-city";

export const head: DocumentHead = {
  title: "Toonka | Reading simplified",
  meta: [
    {
      name: "description",
      content: "A bookmark keeper and a publication tracker.",
    },
  ],
};

export default component$(() => {
  const loginModal = useSignal(false);
  const registerModal = useSignal(false);

  return (
    <>
      <header class="flex items-center justify-center p-5">
        <div class="flex gap-12 rounded-lg border border-solid border-gray-300 bg-white px-5 py-3 shadow-md">
          <div class="flex items-center gap-6">
            <a class="text-gray-700 hover:text-black transition" href="#">
              test
            </a>
            <a class="text-gray-700 hover:text-black transition" href="#">
              test
            </a>
            <a class="text-gray-700 hover:text-black transition" href="#">
              test
            </a>
          </div>
          <div class="flex gap-3">
            <button
              class="cursor-pointer p-1 text-gray-700 hover:text-black transition"
              onClick$={() => {
                loginModal.value = true;
              }}
            >
              Log in
            </button>
            <button
              class="cursor-pointer rounded-md border border-solid border-gray-300 bg-white px-3 py-2 shadow-md hover:bg-stone-200 transition"
              onClick$={() => {
                registerModal.value = true;
              }}
            >
              Register
            </button>
          </div>
          <div class="flex">
            <a
              class="cursor-pointer rounded-md border border-solid border-gray-300 bg-white px-3 py-2 shadow-md hover:bg-stone-200 transition"
              href="/dashboard"
            >
              Go to dashboard
            </a>
          </div>
        </div>
      </header>

      <Modal
        isOpen={loginModal.value}
        onClose$={() => (loginModal.value = false)}
        title="Login"
      ></Modal>

      <Modal
        isOpen={registerModal.value}
        onClose$={() => (registerModal.value = false)}
        title="Register"
      ></Modal>
    </>
  );
});
