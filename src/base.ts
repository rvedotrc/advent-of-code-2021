export type Part = {
  calculate(lines: string[]): string;
};

export type Day = {
  Part1: Part;
  Part2: Part;
};
