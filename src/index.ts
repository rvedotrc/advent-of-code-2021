import * as base from "./base";
import * as day15 from "./day15";
import * as day17 from "./day17";
import * as day99 from "./day99";
import * as fs from "fs";

const partBuilders: Record<string, base.Day> = {
  day15,
  day17,
  day99,
};

const runTest = (
  part: base.PartBuilder,
  _dayNum: string,
  partNum: string,
  inputBase: string
): boolean => {
  const inputFile = inputBase;
  const inputText = fs
    .readFileSync(inputFile)
    .toString("utf-8")
    .trim()
    .split("\n");
  const outputFile = `${inputBase}.answer.part${partNum.toLowerCase()}`;
  const outputText = fs.readFileSync(outputFile).toString("utf-8").trim();
  const actual = new part().calculate(inputText);
  if (actual !== outputText) {
    console.error("  example failed", { expected: outputText, actual });
  } else {
    console.info("  example passed");
  }

  return actual === outputText;
};

const test = (): void => {
  let ok = true;

  for (const dayKey of Object.keys(partBuilders)) {
    const day = partBuilders[dayKey];
    const daySuffix = dayKey.replace("day", "");

    for (const partKey of Object.keys(day)) {
      const part = day[partKey];
      const partSuffix = partKey.replace("Part", "");
      console.log(`${dayKey} ${partKey}`);

      ok &&= new part().test();
      ok &&= runTest(part, daySuffix, partSuffix, `input/${dayKey}`);
      ok &&= runTest(
        part,
        daySuffix,
        partSuffix,
        `input/${dayKey.replace("day", "test")}`
      );
    }
  }

  process.exit(ok ? 0 : 1);
};

const main = (argv: string[]): void => {
  // const key = `day${argv[2]}part${argv[3]}`;
  const day = partBuilders[`day${argv[2]}`];
  if (!day) throw "No such day";

  const partBuilder = day[`Part${argv[3]}`];
  if (!partBuilder) throw "No such part";

  const inputFile = argv[4] || `input/day${argv[2]}`;

  const lines = fs.readFileSync(inputFile).toString("utf-8").trim().split("\n");
  const answer = new partBuilder().calculate(lines);
  console.log(answer);
};

if (process.argv.length == 2) {
  test();
} else {
  main(process.argv);
}
