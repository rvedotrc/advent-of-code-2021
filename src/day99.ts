import * as Base from "./base";

export class Part1 implements Base.Part {
  calculate(lines: string[]): string {
    console.log(lines);
    return "";
  }
}

export class Part2 extends Part1 {}
