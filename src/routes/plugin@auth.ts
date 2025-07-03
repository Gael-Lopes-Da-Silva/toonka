import { QwikAuth$ } from "@auth/qwik"
import { DrizzleAdapter } from "@auth/drizzle-adapter"
import { db } from "../database/db"
import Credentials from "@auth/qwik/providers/credentials"
import bcrypt from "bcryptjs"
import type { Adapter } from "@auth/core/adapters"

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(() => ({
  adapter: DrizzleAdapter(db) as Adapter,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.query.user.findFirst({
          where: (user, { eq }) => eq(user.email, credentials.email as string)
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isValid) {
          return null
        }

        if (!user.verifiedAt) {
          return null
        }

        return {
          id: user.id.toString(),
          email: user.email,
          username: user.username
        }
      }
    })
  ]
}))
