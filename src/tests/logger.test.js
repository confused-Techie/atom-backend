const logger = require("../logger.js");

global.console.log = jest.fn();

describe("httpLog Testing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Normal HTTPLog Call", () => {
    logger.httpLog(
      {
        ip: "0.0.0.0",
        start: "0",
        method: "GET",
        url: "https://dev.com",
        protocol: "HTTP",
      },
      {
        statusCode: "200",
      }
    );
    // Attempting to expect the timing its handled, has proved to be unreliable.
    //let date = new Date();
    //let duration = Date.now() - 0;
    expect(console.log).toBeCalledTimes(1);
    //expect(console.log).toHaveBeenLastCalledWith(`HTTP:: 0.0.0.0 [${date.toISOString()}] "GET https://dev.com HTTP" 200 ${duration}ms`);
  });
});

describe("errorLog Call", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Normal errorLog Call", () => {
    logger.errorLog(
      {
        ip: "0.0.0.0",
        start: "0",
        method: "GET",
        url: "https://dev.com",
        protocol: "HTTP",
      },
      {
        statusCode: "500",
      }
    );
    expect(console.log).toBeCalledTimes(1);
  });
});

describe("warningLog Call", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Normal warningLog Call", () => {
    logger.warningLog(
      {
        ip: "0.0.0.0",
        start: "0",
        method: "GET",
        url: "https://dev.com",
        protocol: "HTTP",
      },
      {
        statusCode: "200",
      },
      "No real error. Just test."
    );
    expect(console.log).toBeCalledTimes(1);
  });
});

describe("infoLog Testing", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Normal InfoLog Call", () => {
    logger.infoLog("test");
    expect(console.log).toBeCalledTimes(1);
    expect(console.log).toHaveBeenLastCalledWith("INFO:: test");
  });
});

describe("debugLog Call", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  test("Debug w/ Debug=TRUE", () => {
    process.env.DEBUG = true;
    logger.debugLog("test");
    expect(console.log).toBeCalledTimes(1);
  });
  test("Debug w/ Debug=FALSE", () => {
    process.env.DEBUG = false;
    logger.debugLog("test");
    expect(console.log).toBeCalledTimes(0);
  });
});
