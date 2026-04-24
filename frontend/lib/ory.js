import { Configuration, FrontendApi } from "@ory/client"

// When using the Next.js proxy, we point the SDK to our own relative path
// This avoids CORS issues and ensures cookies are sent correctly.
export const ory = new FrontendApi(
  new Configuration({
    basePath: "/api/.ory",
    baseOptions: {
      withCredentials: true,
    },
  })
)

export const logoutUrl = () => {
  return `/api/.ory/self-service/browser/flows/logout`
}
