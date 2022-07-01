const request = require("supertest");

const app = require("../main.js");

describe("Get /api/packages", () => {
  test("Should respond with an array of packages.", async() => {
    const res = await request(app).get("/api/packages");
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.statusCode).toBe(200);
  });
});
