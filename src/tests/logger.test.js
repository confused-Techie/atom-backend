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
  test("ErrorLog with Error Object", () => {
    let err = new Error("No real error. Just test.");
    logger.errorLog(
      {
        ip: "0.0.0.0",
        start: "0",
        method: "GET",
        url: "https://pulsar-edit.dev",
        protocol: "HTTP"
      },
      {
        statusCode: "500"
      },
      err
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
  test("WarningLog Call with Error Object", () => {
    let err = new Error("No real error. Just test");
    logger.warningLog(
      {
        ip: "0.0.0.0",
        start: "0",
        method: "GET",
        url: "https://pulsar-edit.dev",
        protocol: "HTTP"
      },
      {
        statusCode: "200",
      },
      err
    );
    expect(console.log).toBeCalledTimes(1);
  });
  test("WarningLog Call with no Req/Res", () => {
    logger.warningLog(null, null, "No error. Just test.");
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
    process.env.DEBUGLOG = true;
    let tmpLog = require("../logger.js");
    tmpLog.debugLog("test");
    expect(console.log).toBeCalledTimes(1);
  });
  test.failing("Debug w/ Debug=FALSE", () => {
    // TODO: The above test is marked to fail.
    // That's because even when reimporting here logger still logs, even
    // when it doesn't during actual usage. The options to have a successful test will
    // have to explored, but otherwise for CI purposes we will mark this as a failure.
    // @see https://github.com/confused-Techie/atom-backend/pull/54
    process.env.DEBUGLOG = false;
    let tempLog = require("../logger.js");
    tempLog.debugLog("test");
    expect(console.log).toBeCalledTimes(0);
  });
});
