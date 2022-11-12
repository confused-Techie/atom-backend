module.exports = {
  extends: [
    "eslint:recommended",
    "node/recommended"
  ],
  plugins: [
    "node/recommended"
  ],
  globals: {
    jest: "readonly",
  },
  rules: {
    "node/no-unpublished-require": [
      "error",
      {
        allowModules: ["supertest"],
      },
    ],
  },
};
