export type Part = {
  calculate(lines: string[]): string;
  test(): boolean;
};

export type PartBuilder = {
  new (): Part;
};

export type Day = Record<string, PartBuilder>;
