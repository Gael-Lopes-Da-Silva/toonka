import { db, schema } from "$lib/server/database"
import { fail, redirect } from "@sveltejs/kit"
import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

export const actions = {
  register: async ({ request }) => {
    const data = await request.formData()

    const username = data.get("username")?.toString()
    const email = data.get("email")?.toString()
    const password = data.get("password")?.toString()

    if (!username || !email || !password) {
      return fail(400, {
        from: "register",
        type: "error",
        message: "All fields are required"
      })
    }

    const alreadyExist = await db.query.user.findFirst({
      where: (user, { or, eq }) => or(eq(user.email, email), eq(user.username, username))
    })

    if (alreadyExist) {
      return fail(400, {
        from: "register",
        type: "error",
        message: "Email or username already used"
      })
    }

    const salt = randomBytes(16).toString("hex")
    const hash = scryptSync(password, salt, 32).toString("hex")

    const token = "ac:" + randomBytes(32).toString("hex")

    await db.insert(schema.user).values({
      username,
      email,
      password: `${salt}:${hash}`,
      token
    })

    // TODO: send confirmation link via mail

    return {
      from: "register",
      type: "success",
      message: "Account successfully created. Check you mails!"
    }
  },
  login: async ({ request, cookies }) => {
    const data = await request.formData()

    const email = data.get("email")?.toString()
    const password = data.get("password")?.toString()

    if (!email || !password) {
      return fail(400, {
        from: "login",
        type: "error",
        message: "All fields are required"
      })
    }

    const user = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.email, email)
    })

    if (!user) {
      return fail(400, {
        from: "login",
        type: "error",
        message: "Invalid credentials"
      })
    }

    if (user.token && user.token.split(":")[0] == "ac") {
      return fail(400, {
        from: "login",
        type: "error",
        message: "Account not verified"
      })
    }

    const [salt, storedHash] = user.password.split(":")
    const storedHashBuffer = Buffer.from(storedHash, "hex")

    const currentHash = scryptSync(password, salt, 32)
    const currentHashBuffer = Buffer.from(currentHash)

    const match = timingSafeEqual(storedHashBuffer, currentHashBuffer)

    if (!match) {
      return fail(400, {
        from: "login",
        type: "error",
        message: "Invalid credentials"
      })
    }

    cookies.set("session", user.id.toString(), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7
    })

    throw redirect(303, "/dashboard")
  }
}
