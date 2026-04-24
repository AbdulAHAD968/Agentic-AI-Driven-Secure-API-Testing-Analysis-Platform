import { Configuration, FrontendApi } from "@ory/client";

// The Ory SDK configuration
// We use the internal proxy /api/ory-api to communicate with Ory.
// This avoids CORS issues and ensures cookies are sent correctly.
export const ory = new FrontendApi(
  new Configuration({
    basePath: "/api/ory-api",
    baseOptions: {
      withCredentials: true,
    },
  })
);
