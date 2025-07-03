import { component$, useSignal } from "@builder.io/qwik"
import { routeAction$, Form, z, zod$ } from "@builder.io/qwik-city"
import { db } from "~/database/db"
import { user } from "~/database/schema"
import { useSignIn } from "./plugin@auth"
import { Modal } from "~/components/props/Modal/Modal"
import { Alert } from "~/components/props/Alert/Alert"
import { InputText } from "~/components/parts/InputText/InputText"
import { InputEmail } from "~/components/parts/InputEmail/InputEmail"
import { InputPassword } from "~/components/parts/InputPassword/InputPassword"
import { InputSubmit } from "~/components/parts/InputSubmit/InputSubmit"
import { InputCheckbox } from "~/components/parts/InputCheckbox/InputCheckbox"
import bcrypt from "bcryptjs"
import type { DocumentHead } from "@builder.io/qwik-city"

export const head: DocumentHead = {
  title: "Toonka | Reading simplified",
  meta: [
    {
      name: "description",
      content: "A bookmark keeper and a publication tracker."
    }
  ]
}

export const useRegister = routeAction$(
  async (data) => {
    const hashedPassword = await bcrypt.hash(data.password.toString(), 10)
    const token = (Math.random() + 1).toString(36).substring(7)

    try {
      await db.insert(user).values({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        token: token
      })

      return { success: true, message: "User successfully registered" }
    } catch (error) {
      return { success: false, message: "An error occured" }
    }
  },
  zod$({
    username: z.string().min(2, { message: "Invalid username" }),
    email: z.string().email({ message: "Invalid email" }),
    password: z.string().min(8, { message: "Invalid password" })
  })
)

export const useLogin = routeAction$(
  async (data, { redirect }) => {
    const signIn = useSignIn()
    const result = await signIn.submit({
      providerId: "credentials",
      options: {
        email: data.email,
        password: data.password
      }
    })

    if (result.value?.failed) {
      return { success: false, message: "" }
    }

    throw redirect(302, "/dashboard")
  },
  zod$({
    email: z.string().email({ message: "" }),
    password: z.string().min(8, { message: "" })
  })
)

export default component$(() => {
  const loginModal = useSignal(false)
  const registerModal = useSignal(false)

  const registerAction = useRegister()
  const loginAction = useLogin()

  const registerAlert = useSignal(true)
  const loginAlert = useSignal(true)

  return (
    <>
      <header class="flex items-center justify-center p-5">
        <div class="flex gap-12 rounded-lg border border-solid border-gray-300 bg-white px-5 py-3 shadow-md">
          <div class="flex items-center gap-6">
            <a class="text-gray-700 transition hover:text-black" href="#">
              test
            </a>
            <a class="text-gray-700 transition hover:text-black" href="#">
              test
            </a>
            <a class="text-gray-700 transition hover:text-black" href="#">
              test
            </a>
          </div>
          <div class="flex gap-3">
            <button
              class="cursor-pointer p-1 text-gray-700 transition hover:text-black"
              onClick$={() => {
                loginModal.value = true
              }}
            >
              Log in
            </button>
            <button
              class="cursor-pointer rounded-md border border-solid border-gray-300 bg-gray-50 px-3 py-2 transition hover:bg-stone-100"
              onClick$={() => {
                registerModal.value = true
              }}
            >
              Register
            </button>
          </div>
          <div class="flex">
            <a
              class="cursor-pointer rounded-md border border-solid border-gray-300 bg-gray-50 px-3 py-2 transition hover:bg-stone-100"
              href="/dashboard"
            >
              Go to dashboard
            </a>
          </div>
        </div>
      </header>

      <Modal isOpen={loginModal.value} title="Login" onClose$={() => (loginModal.value = false)}>
        <Form class="flex flex-col" action={loginAction}>
          <div class="mb-6">
            <InputEmail
              name="email"
              label="Email"
              placeholder="john.doe@gmail.com"
              icon={
                <svg class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
                  />
                </svg>
              }
              required
            />
          </div>

          <div class="mb-6">
            <InputPassword
              name="password"
              label="Password"
              placeholder="••••••••••••"
              icon={
                <svg class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5z" />
                </svg>
              }
              required
            />
          </div>

          <InputSubmit value="Submit" />
        </Form>
      </Modal>

      <Modal isOpen={registerModal.value} title="Register" onClose$={() => (registerModal.value = false)}>
        {(registerAction.value?.fieldErrors || registerAction.value?.success === false) && (
          <Alert
            show={registerAlert.value}
            type="error"
            message={
              <>
                {registerAction.value?.message && <p>{registerAction.value.message}</p>}
                {registerAction.value?.fieldErrors && (
                  <ul class="list-disc pl-5">
                    {registerAction.value.fieldErrors.username && <li>{registerAction.value.fieldErrors.username}</li>}
                    {registerAction.value.fieldErrors.email && <li>{registerAction.value.fieldErrors.email}</li>}
                    {registerAction.value.fieldErrors.password && <li>{registerAction.value.fieldErrors.password}</li>}
                  </ul>
                )}
              </>
            }
            onClose$={() => {
              registerAlert.value = false
            }}
          />
        )}

        {registerAction.value?.success && (
          <Alert
            show={registerAlert.value}
            type="success"
            message={<p>{registerAction.value.message}</p>}
            onClose$={() => {
              registerAlert.value = false
            }}
          />
        )}

        <Form class="flex flex-col" action={registerAction}>
          <div class="mb-6">
            <InputText
              name="username"
              label="Username"
              placeholder="john_doe"
              icon={
                <svg class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6m0 14c-2.03 0-4.43-.82-6.14-2.88a9.95 9.95 0 0 1 12.28 0C16.43 19.18 14.03 20 12 20"
                  />
                </svg>
              }
              required
            />
          </div>

          <div class="mb-6">
            <InputEmail
              name="email"
              label="Email"
              placeholder="john.doe@gmail.com"
              icon={
                <svg class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5l-8-5V6l8 5l8-5z"
                  />
                </svg>
              }
              required
            />
          </div>

          <div class="mb-6">
            <InputPassword
              name="password"
              label="Password"
              placeholder="••••••••••••"
              icon={
                <svg class="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5z" />
                </svg>
              }
              required
            />
          </div>

          <div class="mb-6">
            <InputCheckbox
              text={
                <p>
                  I agree with the{" "}
                  <a class="text-blue-600 hover:underline" href="#">
                    terms and conditions
                  </a>
                  .
                </p>
              }
              required
            />
          </div>

          <InputSubmit value="Submit" />
        </Form>
      </Modal>
    </>
  )
})
