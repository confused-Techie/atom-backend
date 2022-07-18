// This is used ONLY by package.json to gen the README badge for code coverage.
// It takes the json output from jest in ./coverage/coverage-summary.json
// Takes a small config object here and creates an SVG. Super simplistic,
// and the config is there for hopes the eventuall it does support other options.

const fs = require("fs");

const config = {
  target: "functions",
  result: "percentage",
};

function run() {
  try {
    let coverageRAW = fs.readFileSync(
      "./coverage/coverage-summary.json",
      "utf8"
    );
    let coverage = JSON.parse(coverageRAW);

    console.log(coverage.total.functions.pct);
    if (coverage.total) {
      let target = coverage.total[config.target];

      if (config.result === "percentage") {
        // since we are doing percentage, lets get the pct or percentage coverage of total.
        let value = target.pct;

        let call = function (color) {
          let badge = makeBadge("coverage", `${value}%`, color);
          writeBadge(badge);
        };

        if (value === 100) {
          // its perfect,
          call("#15ff00");
        } else if (value >= 90) {
          // nearly perfect
          call("#0e8c00");
        } else if (value >= 60) {
          // mid
          call("#ffff00");
        } else if (value >= 30) {
          // low
          call("#ff7b00");
        } else {
          // bottom value
          call("#ff0000");
        }
      } else {
        // other options should be defined here.
        console.log("Unknown result in config.");
        process.exit(1);
      }
    } else {
      // cant find the main object, we rely on. Log end exit.
      console.log("Couldn't find 'total' property of coverage-summary.json");
      process.exit(1);
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

function makeBadge(textDeclare, textValue, color) {
  let text = `${textDeclare}: ${textValue}`;
  let badge = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" `,
    `width="116" height="20" role="img" aria-label="${text}">`,
    `<title>${text}</title>`,
    `<g shape-rendering="crispEdges">`,
    `<rect width="65" height="20" fill="#555"></rect>`,
    `<rect x="65" width="51" height="20" fill="${color}"></rect>`,
    `</g>`,
    `<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">`,
    `<text x="335" y="140" transform="scale(.1)" fill="#fff" textLength="550">${textDeclare}</text>`,
    `<text x="895" y="140" transform="scale(.1)" fill="#fff" textLength="410">${textValue}</text>`,
    `</g>`,
    `</svg>`,
  ];
  return badge.join("");
}

function writeBadge(data) {
  try {
    fs.writeFileSync("./coverage/badge.svg", data);
    console.log("Wrote new badge at: './coverage/badge.svg'");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

run();
