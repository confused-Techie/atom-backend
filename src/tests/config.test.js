const config = require("../config.js");

describe("Config Returns all Expected Values", () => {
  let con = config.getConfig();

  test("Has Port", () => {
    expect(con.port).toBeDefined();
  });
  test("Has server_url", () => {
    expect(con.server_url).toBeDefined();
  });
  test("Has paginated_amount", () => {
    expect(con.paginated_amount).toBeDefined();
  });
  test("Has prod", () => {
    expect(con.prod).toBeDefined();
  });
  test("Has cache_time", () => {
    expect(con.cache_time).toBeDefined();
  });
  test("Has GCLOUD_STORAGE_BUCKET", () => {
    expect(con.GCLOUD_STORAGE_BUCKET).toBeDefined();
  });
  test("Has GOOGLE_APPLICATION_CREDENTIALS", () => {
    expect(con.GOOGLE_APPLICATION_CREDENTIALS).toBeDefined();
  });
  test("Has GH_CLIENTID", () => {
    expect(con.GH_CLIENTID).toBeDefined();
  });
  test("Has GH_USERAGENT", () => {
    expect(con.GH_USERAGENT).toBeDefined();
  });
  test("Has GH_REDIRECTURI", () => {
    expect(con.GH_REDIRECTURI).toBeDefined();
  });
  test("Has GH_CLIENTSECRET", () => {
    expect(con.GH_CLIENTSECRET).toBeDefined();
  });
  test("Has DB_HOST", () => {
    expect(con.DB_HOST).toBeDefined();
  });
  test("Has DB_USER", () => {
    expect(con.DB_USER).toBeDefined();
  });
  test("Has DB_PASS", () => {
    expect(con.DB_PASS).toBeDefined();
  });
  test("Has DB_DB", () => {
    expect(con.DB_DB).toBeDefined();
  });
  test("Has DB_PORT", () => {
    expect(con.DB_PORT).toBeDefined();
  });
  test("Has DB_SSL_CERT", () => {
    expect(con.DB_SSL_CERT).toBeDefined();
  });
  test("Has LOG_LEVEL", () => {
    expect(con.LOG_LEVEL).toBeDefined();
  });
  test("Has LOG_FORMAT", () => {
    expect(con.LOG_FORMAT).toBeDefined();
  });
});
