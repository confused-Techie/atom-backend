const debug_utils = require("../debug_utils.js");

describe("Test lengths Returned by different Variables", () => {
  const object_cases = [
    [
      {
        value: "Hello World",
      },
      22,
    ],
    [
      {
        boolean: true,
      },
      4,
    ],
    [
      {
        obj: {
          boolean: false,
          value: "H",
        },
      },
      6,
    ],
  ];

  test.each(object_cases)("Given %o Returns %p", (arg, expectedResult) => {
    expect(debug_utils.roughSizeOfObject(arg)).toBe(expectedResult);
  });
});
