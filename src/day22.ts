import * as Base from "./base";

type RegionWithState = {
  region: Region;
  state: boolean;
};

type ABRange = { tag: "a" | "b" | "ab"; range: Range };

class Range {
  constructor(public readonly start: number, public readonly end: number) {
    if (isNaN(start) || isNaN(end) || start > end)
      throw `Bad range ${start}..${end - 1}`;
  }

  public get size(): number {
    return this.end - this.start;
  }

  public toString(): string {
    return `${this.start}..${this.end - 1}`;
  }

  public combine(b: Range): ABRange[] {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const a: Range = this;

    // No overlap
    if (a.end <= b.start || b.end <= a.start) {
      return [
        { tag: "a", range: a },
        { tag: "b", range: b },
      ];
    }

    // There is some overlap

    // Simplify; let's always have a.start <= b.start
    if (a.start > b.start) {
      return b.combine(a).map(taggedRange => ({
        ...taggedRange,
        tag:
          taggedRange.tag === "a" ? "b" : taggedRange.tag === "b" ? "a" : "ab",
      }));
    }

    if (a.start < b.start) {
      if (a.end < b.end) {
        return [
          { tag: "a", range: new Range(a.start, b.start) },
          { tag: "ab", range: new Range(b.start, a.end) },
          { tag: "b", range: new Range(a.end, b.end) },
        ];
      } else if (a.end === b.end) {
        return [
          { tag: "a", range: new Range(a.start, b.start) },
          { tag: "ab", range: new Range(b.start, a.end) },
        ];
      } else {
        // a.end > b.end
        return [
          { tag: "a", range: new Range(a.start, b.start) },
          { tag: "ab", range: new Range(b.start, b.end) },
          { tag: "a", range: new Range(b.end, a.end) },
        ];
      }
    } else {
      // a.start === b.start
      if (a.end < b.end) {
        return [
          { tag: "ab", range: a },
          { tag: "b", range: new Range(a.end, b.end) },
        ];
      } else if (a.end === b.end) {
        return [{ tag: "ab", range: a }]; // a === b
      } else {
        // a.end > b.end
        return [
          { tag: "ab", range: b },
          { tag: "a", range: new Range(b.end, a.end) },
        ];
      }
    }
  }
}

type ABRegion = { tag: "a" | "b" | "ab"; region: Region };

class Region {
  constructor(public readonly ranges: Range[]) {}

  public get size(): number {
    return this.ranges.reduce((size, range) => size * range.size, 1);
  }

  public toString(): string {
    return `[${this.ranges.map(r => r.toString()).join(",")}]`;
  }

  public combine(b: Region): ABRegion[] {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let a: Region = this;
    if (b.ranges.length !== a.ranges.length) throw "Dimensions mismatch";

    const origA = a;
    const origB = b;

    const output: ABRegion[] = [];

    for (let i = 0; i < a.ranges.length; ++i) {
      const axisSplit = a.ranges[i].combine(b.ranges[i]);
      console.debug("axisSplit", {
        a: a.toString(),
        b: b.toString(),
        i,
        ar: a.ranges[i].toString(),
        br: b.ranges[i].toString(),
        output: axisSplit.map(t => `${t.tag}:${t.range.toString()}`).join(", "),
      });
      let seenAB = false;

      for (const split of axisSplit) {
        if (split.tag === "a") {
          output.push({ tag: "a", region: a.withRange(i, split.range) });
        } else if (split.tag === "b") {
          output.push({ tag: "b", region: b.withRange(i, split.range) });
        } else {
          // ab
          seenAB = true;
          a = a.withRange(i, split.range);
          b = b.withRange(i, split.range);
        }
      }

      if (!seenAB) {
        console.log({
          a: origA.toString(),
          b: origB.toString(),
          output: output.map(r => `${r.tag}:${r.region.toString()}`).join(", "),
        });
        return output;
      }
    }

    output.push({ tag: "ab", region: a }); // a === b

    console.log({
      a: origA.toString(),
      b: origB.toString(),
      output: output.map(r => `${r.tag}:${r.region.toString()}`).join(", "),
    });
    return output;
  }

  private withRange(dimension: number, range: Range): Region {
    const newRanges = [...this.ranges];
    newRanges[dimension] = range;
    return new Region(newRanges);
  }
}

export class Part1 extends Base.BasePart implements Base.Part {
  calculate(lines: string[]): string {
    let current: RegionWithState[] = [{ region: this.limits(), state: false }];

    this.show(current);

    for (const line of lines) {
      console.log(`>> ${line}`);
      current = this.applyStep(line, current);
      this.show(current);
    }

    return this.countOn(current).toString();
  }

  private show(current: RegionWithState[]): void {
    for (const rws of current) {
      console.log(
        `- ${rws.state ? "on" : "off"} ${rws.region.ranges
          .map(r => `${r.start}..${r.end - 1}`)
          .join(",")}`
      );
    }
    console.log(
      `(on=${this.countOn(current)}, size=${this.countSize(current)})`
    );
    console.log("");
  }

  private applyStep(
    line: string,
    current: RegionWithState[]
  ): RegionWithState[] {
    const change = this.parseLine(line);
    console.debug({ change: JSON.stringify(change) });
    return current.flatMap(region => this.merge(region, change));
  }

  private merge(
    input: RegionWithState,
    change: RegionWithState
  ): RegionWithState[] {
    if (input.state === change.state) return [input];

    const output: RegionWithState[] = [];

    for (const taggedRegion of input.region.combine(change.region)) {
      if (taggedRegion.tag === "a")
        output.push({ region: taggedRegion.region, state: input.state });
      if (taggedRegion.tag === "ab")
        output.push({ region: taggedRegion.region, state: change.state });
    }

    return output;
  }

  private parseLine(line: string): RegionWithState {
    const m = line.match(/^(on|off) x=(.*),y=(.*),z=(.*)$/);
    if (!m) throw line;

    const parseRange = (s: string): Range => {
      console.log({ s });
      let [start, end] = s.split(/\.\./).map(n => {
        // console.debug(JSON.stringify(n));
        return parseInt(n);
      }) as [number, number];

      console.log({ start, end });

      // Clamp to grid size
      if (start < -50) start = -50;
      if (end < -50) end = -50;
      if (start > +50) start = +50;
      if (end > +50) end = +50;

      return new Range(start, end + 1);
    };

    return {
      region: new Region([
        parseRange(m[2]),
        parseRange(m[3]),
        parseRange(m[4]),
      ]),
      state: m[1] === "on",
    };
  }

  private countOn(current: RegionWithState[]): number {
    let n = 0;
    for (const regionWithState of current) {
      if (regionWithState.state) {
        n += regionWithState.region.size;
      }
    }
    return n;
  }

  private countSize(current: RegionWithState[]): number {
    let n = 0;
    for (const regionWithState of current) {
      n += regionWithState.region.size;
    }
    return n;
  }

  protected limits(): Region {
    const r = new Range(-50, +51);
    return new Region([r, r, r]);
  }

  test(): boolean {
    const input1 =
      "on x=10..12,y=10..12,z=10..12\n" +
      "on x=11..13,y=11..13,z=11..13\n" +
      "off x=9..11,y=9..11,z=9..11\n" +
      "on x=10..10,y=10..10,z=10..10";
    const output1 = "39";
    const ok1 = this.checkResult(
      "example 1",
      this.calculate(input1.split("\n")),
      output1
    );

    const input2 =
      "on x=-20..26,y=-36..17,z=-47..7\n" +
      "on x=-20..33,y=-21..23,z=-26..28\n" +
      "on x=-22..28,y=-29..23,z=-38..16\n" +
      "on x=-46..7,y=-6..46,z=-50..-1\n" +
      "on x=-49..1,y=-3..46,z=-24..28\n" +
      "on x=2..47,y=-22..22,z=-23..27\n" +
      "on x=-27..23,y=-28..26,z=-21..29\n" +
      "on x=-39..5,y=-6..47,z=-3..44\n" +
      "on x=-30..21,y=-8..43,z=-13..34\n" +
      "on x=-22..26,y=-27..20,z=-29..19\n" +
      "off x=-48..-32,y=26..41,z=-47..-37\n" +
      "on x=-12..35,y=6..50,z=-50..-2\n" +
      "off x=-48..-32,y=-32..-16,z=-15..-5\n" +
      "on x=-18..26,y=-33..15,z=-7..46\n" +
      "off x=-40..-22,y=-38..-28,z=23..41\n" +
      "on x=-16..35,y=-41..10,z=-47..6\n" +
      "off x=-32..-23,y=11..30,z=-14..3\n" +
      "on x=-49..-5,y=-3..45,z=-29..18\n" +
      "off x=18..30,y=-20..-8,z=-3..13\n" +
      "on x=-41..9,y=-7..43,z=-33..15\n" +
      "on x=-54112..-39298,y=-85059..-49293,z=-27449..7877\n" +
      "on x=967..23432,y=45373..81175,z=27513..53682";
    const output2 = "590784";
    const ok2 = this.checkResult(
      "example 2",
      this.calculate(input2.split("\n")),
      output2
    );

    return ok1 && ok2;
  }
}

export class Part2 extends Part1 {}
