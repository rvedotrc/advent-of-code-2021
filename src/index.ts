import * as base from "./base";
import * as day15 from "./day15";
import * as fs from "fs";

const parts: Record<string, base.Part> = {
  day15part1: new day15.Part1(),
  day15part2: new day15.Part2(),
};

const main = (argv: string[]): void => {
  const key = `day${argv[2]}part${argv[3]}`;
  const part = parts[key];
  if (!part) throw "No such day / part";

  const inputFile = argv[4] || `input/day${argv[2]}`;

  const lines = fs.readFileSync(inputFile).toString("utf-8").trim().split("\n");
  const answer = part.calculate(lines);
  console.log(answer);
};

main(process.argv);
