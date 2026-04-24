import { createApiHandler } from "@ory/integrations/next"

export const GET = createApiHandler({
  apiBaseUrl: process.env.NEXT_PUBLIC_ORY_SDK_URL,
})

export const POST = createApiHandler({
  apiBaseUrl: process.env.NEXT_PUBLIC_ORY_SDK_URL,
})

export const PUT = createApiHandler({
  apiBaseUrl: process.env.NEXT_PUBLIC_ORY_SDK_URL,
})

export const PATCH = createApiHandler({
  apiBaseUrl: process.env.NEXT_PUBLIC_ORY_SDK_URL,
})

export const DELETE = createApiHandler({
  apiBaseUrl: process.env.NEXT_PUBLIC_ORY_SDK_URL,
})
