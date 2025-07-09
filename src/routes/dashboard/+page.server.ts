import { redirect } from "@sveltejs/kit"

export const actions = {
  logout: async ({ cookies }) => {
    cookies.set("session", "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0
    })
  }
}
