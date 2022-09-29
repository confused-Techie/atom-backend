const collection = require("../collection.js");

describe("engineFilter returns version expected.", () => {
  test("Returns First Position when given multiple valid positions.", async () => {
    let pack = {
      versions: {
        "2.0.0": {
          version: "2.0.0",
          engines: {
            atom: ">1.0.0 <2.0.0",
          },
        },
        "1.9.9": {
          version: "1.9.9",
          engines: {
            atom: ">1.0.0 <2.0.0",
          },
        },
      },
    };

    let engine = "1.5.0";

    let res = await collection.engineFilter(pack, engine);
    expect(res.metadata.version == "2.0.0");
  });

  test("Returns Matching version when given an equal upper bound.", async () => {
    let pack = {
      versions: {
        "2.0.0": {
          version: "2.0.0",
          engines: {
            atom: ">=1.5.0 <2.0.0",
          },
        },
        "1.9.9": {
          version: "1.9.9",
          engines: {
            atom: ">1.0.0 <=1.4.9",
          },
        },
      },
    };

    let engine = "1.4.9";

    let res = await collection.engineFilter(pack, engine);
    expect(res.metadata.version == "1.9.9");
  });

  test("Returns First Matching version on lower bond equal.", async () => {
    let pack = {
      versions: {
        "2.0.0": {
          version: "2.0.0",
          engines: {
            atom: ">=1.2.3 <2.0.0",
          },
        },
        "1.0.0": {
          version: "1.0.0",
          engines: {
            atom: ">1.0.0 <1.2.3",
          },
        },
      },
    };

    let engine = "1.2.3";

    let res = await collection.engineFilter(pack, engine);
    expect(res.metadata.version == "2.0.0");
  });
});
