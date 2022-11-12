module.exports = {
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
