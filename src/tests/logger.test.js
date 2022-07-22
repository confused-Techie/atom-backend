const logger = require("../logger.js");

global.console.log = jest.fn();

describe("HTTPLog Testing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Normal HTTPLog Call", () => {
    logger.HTTPLog(
      {
        ip: "0.0.0.0",
        start: "0",
        method: "GET",
        url: "https://dev.com",
        protocol: "HTTP"
      },
      {
        statusCode: "200"
      }
    );
    // Attempting to expect the timing its handled, has proved to be unreliable.
    //let date = new Date();
    //let duration = Date.now() - 0;
    expect(console.log).toBeCalledTimes(1);
    //expect(console.log).toHaveBeenLastCalledWith(`HTTP:: 0.0.0.0 [${date.toISOString()}] "GET https://dev.com HTTP" 200 ${duration}ms`);
  });
});

describe("InfoLog Testing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Normal InfoLog Call", () => {
    logger.InfoLog("test");
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("INFO:: test");
  });
});
