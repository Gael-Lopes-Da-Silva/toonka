import { db } from "$lib/server/database"

export const handle = async ({ event, resolve }) => {
  const session = event.cookies.get("session")

  if (session) {
    const user = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, Number(session))
    })
    if (user) {
      event.locals.user = {
        id: user.id
      }
    }
  }

  const privatePaths = ["/dashboard"]
  const loggedIn = Boolean(event.locals.user)
  if (!loggedIn && privatePaths.includes(event.url.pathname)) {
    return Response.redirect(new URL("/", event.url), 303)
  }

  return resolve(event)
}
