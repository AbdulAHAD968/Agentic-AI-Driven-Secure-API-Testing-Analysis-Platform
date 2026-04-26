const { Configuration, FrontendApi } = require("@ory/client");

const ory = new FrontendApi(
  new Configuration({
    basePath: process.env.ORY_SDK_URL || "https://suspicious-agnesi-frtp7mro6t.projects.oryapis.com",
    baseOptions: {
      withCredentials: true,
    },
  })
);

module.exports = ory;
