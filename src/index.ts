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

main(process.argv);
