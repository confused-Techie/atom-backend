global.console.log = jest.fn();

describe('logger', () => {

  const debug = jest.fn()

  jest.mock('../config.js');
  require('../config.js').getConfig.mockReturnValue({ debug })

  const logger = require('../logger.js');

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("httpLog", () => {

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

  describe("errorLog", () => {

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

  describe("warningLog", () => {

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

  describe("infoLog", () => {

    test("Normal InfoLog Call", () => {
      logger.infoLog("test");

      expect(console.log).toBeCalledTimes(1);
      expect(console.log).toHaveBeenLastCalledWith("INFO:: test");
    });

  });

  describe("debugLog", () => {

    test("Debug w/ Debug=TRUE", () => {
      debug.mockReturnValue(true);

      logger.debugLog("test");

      expect(console.log).toBeCalledTimes(1);
    });

    test("Debug w/ Debug=FALSE", () => {
      debug.mockReturnValue(false);

      logger.debugLog("test");

      expect(console.log).toBeCalledTimes(0);
    });

  });

});
