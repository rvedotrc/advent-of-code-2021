export type Part = {
  calculate(lines: string[]): string;
};

export type PartBuilder = {
  new (): Part;
};

export type Day = Record<string, PartBuilder>;
