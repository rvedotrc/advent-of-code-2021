import * as Base from "./base";

export class Part1 implements Base.Part {
  calculate(_lines: string[]): string {
    return "";
  }

  test(): boolean {
    return true;
  }
}

export class Part2 extends Part1 {}
