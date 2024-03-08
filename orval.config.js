module.exports = {
  securd: {
    output: {
      mode: "tags-split",
      target: "src/utils/api/generated/api.ts",
      schemas: "src/utils/api/generated/schemas",
      client: "react-query",
    },
    input: {
      target: "https://api.dev.pyratzlabs.com/swagger/securd?format=openapi",
    },
  },
  token_prices: {
    output: {
      mode: "tags-split",
      target: "src/utils/api/token_prices/api.ts",
      schemas: "src/utils/api/token_prices/schemas",
      client: "react-query",
    },
    input: {
      target: "https://api.dev.pyratzlabs.com/swagger/securd?format=openapi",
    },
  },
};
