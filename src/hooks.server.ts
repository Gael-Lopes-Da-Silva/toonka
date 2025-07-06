export const handle = async ({ event, resolve }) => {
  const loggedIn = Boolean(event.cookies.get("session"))
  const privatePaths = ["/dashboard"]

  if (!loggedIn && privatePaths.includes(event.url.pathname)) {
    return Response.redirect(new URL("/", event.url), 303)
  }

  return resolve(event)
}
