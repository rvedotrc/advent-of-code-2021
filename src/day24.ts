import * as Base from "./base";

type Registers = {
  w: number;
  x: number;
  y: number;
  z: number;
};

const operations = {
  add: (a: number, b: number) => a + b,
  mul: (a: number, b: number) => a * b,
  div: (a: number, b: number) => {
    if (b === 0) throw "Divide by zero";
    return Math.trunc(a / b);
  },
  mod: (a: number, b: number) => {
    if (a < 0 || b <= 0) throw "Invalid mod";
    return a % b;
  },
  eql: (a: number, b: number) => (a == b ? 1 : 0),
};

const constantEquals = (
  a: AlgebraicValue,
  b: AlgebraicValue
): boolean | undefined => {
  const inputsUsed = new Set<number>();
  const walk = (x: AlgebraicValue) => {
    if (Array.isArray(x) && x[0] === "I") {
      inputsUsed.add(x[1]);
    } else if (Array.isArray(x) && x[0] === "S") {
      //
    } else if (Array.isArray(x)) {
      walk(x[0]);
      walk(x[2]);
    }
  };
  walk(a);
  walk(b);

  let inputs = [new Map<number, number>()];
  for (const inputUsed of inputsUsed) {
    inputs = inputs.flatMap(input =>
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map(value =>
        new Map(input).set(inputUsed, value)
      )
    );
  }

  const evaluate = (
    x: AlgebraicValue,
    i: Map<number, number>
  ): number | "error" => {
    if (typeof x === "number") return x;

    if (x[0] === "S") {
      return "error";
    }

    if (x[0] === "I") {
      const v = i.get(x[1]);
      if (v === undefined) throw "x";
      return v;
    }

    const left = evaluate(x[0], i);
    if (left === "error") return "error";
    const right = evaluate(x[2], i);
    if (right === "error") return "error";

    const operator = x[1];
    if (operator === "+") return left + right;
    if (operator === "*") return left * right;
    if (operator === "/") {
      if (b === 0) return "error";
      return Math.trunc(left / right);
    }
    if (operator === "%") {
      if (left < 0 || right <= 0) return "error";
      return left % right;
    }
    if (operator === "=") {
      return left === right ? 1 : 0;
    }

    throw "eek";
  };

  let previousOutcome: boolean | undefined = undefined;

  for (const inputMap of inputs) {
    const aR = evaluate(a, inputMap);
    if (aR === "error") return undefined;
    const bR = evaluate(b, inputMap);
    if (bR === "error") return undefined;
    const outcome = aR === bR;

    if (outcome) {
      console.log(
        `true for ${[...inputMap.keys()]
          .sort()
          .map(n => `I${n}=${inputMap.get(n)}`)
          .join(" ")}`
      );
    }

    if (previousOutcome !== undefined && outcome !== previousOutcome)
      return undefined;
    previousOutcome = outcome;
  }

  return previousOutcome;
};

const algebraicOperations = {
  add: (a: AlgebraicValue, b: AlgebraicValue): BranchingAlgebraicValue => {
    if (a === 0) return b;
    if (b === 0) return a;
    if (typeof a === "number" && typeof b === "number") return a + b;
    return [a, "+", b];
  },
  mul: (a: AlgebraicValue, b: AlgebraicValue): BranchingAlgebraicValue => {
    if (a === 0 || b === 0) return 0;
    if (a === 1) return b;
    if (b === 1) return a;
    if (typeof a === "number" && typeof b === "number") return a * b;
    return [a, "*", b];
  },
  div: (a: AlgebraicValue, b: AlgebraicValue): BranchingAlgebraicValue => {
    if (b === 1) return a;
    if (b === 0)
      throw "Divide by zero ${JSON.stringify(a)} / ${JSON.stringify(b)}";
    if (typeof a === "number" && typeof b === "number")
      return Math.trunc(a / b);

    if (
      b === 26 &&
      JSON.stringify(a).match(/^\[\["I",\d+\],"\+",(\d|1[0-6])\]$/)
    ) {
      return 0;
    }

    return [a, "/", b];
  },
  mod: (a: AlgebraicValue, b: AlgebraicValue): BranchingAlgebraicValue => {
    if (typeof a === "number" && typeof b === "number") {
      if (a < 0 || b <= 0)
        throw "Invalid mod ${JSON.stringify(a)} % ${JSON.stringify(b)}";
      if (typeof a === "number" && typeof b === "number") return a % b;
      if (a === 0) return 0;
    }

    return [a, "%", b];
  },
  eql: (a: AlgebraicValue, b: AlgebraicValue): BranchingAlgebraicValue => {
    if (typeof a === "number" && typeof b === "number") {
      return a == b ? 1 : 0;
    }

    if (JSON.stringify(a) === JSON.stringify(b)) return 1;

    if (
      typeof a === "number" &&
      (a < 1 || a > 9) &&
      typeof b !== "number" &&
      b[0] === "I"
    ) {
      return 0;
    }

    const result = constantEquals(a, b);
    if (result !== undefined) {
      console.log(
        `Determined that ${JSON.stringify(a)} = ${JSON.stringify(
          b
        )} is always ${result}`
      );
      return result ? 1 : 0;
    }

    return {
      ifEquals: [a, b],
      then: 1,
      else: 0,
    };
  },
};

type AlgebraicValue =
  | number
  | ["I", number]
  | ["S", keyof Registers]
  | [AlgebraicValue, "+" | "*" | "/" | "%" | "=", AlgebraicValue];

type Condition =
  | { ifEquals: [AlgebraicValue, AlgebraicValue] }
  | { not: Condition };
type ConditionValue = {
  ifEquals: [AlgebraicValue, AlgebraicValue];
  then: AlgebraicValue;
  else: AlgebraicValue;
};

type BranchingAlgebraicValue = AlgebraicValue | ConditionValue;

type AlgebraicRegisters = {
  w: AlgebraicValue;
  x: AlgebraicValue;
  y: AlgebraicValue;
  z: AlgebraicValue;
};

type BranchingAlgebraicRegisters = {
  w: BranchingAlgebraicValue;
  x: BranchingAlgebraicValue;
  y: BranchingAlgebraicValue;
  z: BranchingAlgebraicValue;
};

type State = {
  registers: AlgebraicRegisters;
  inputs: AlgebraicValue[];
  ip: number;
  conditions: Condition[];
};

const isConditionValue = (i: BranchingAlgebraicValue): i is ConditionValue => {
  if (typeof i === "number") return false;
  if (typeof i === "string") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return "ifEquals" in (i as any);
};

export class Part1 implements Base.Part {
  calculate(program: string[]): string {
    const inputs = [...Array(14).keys()].map(i => ["I", i] as AlgebraicValue);
    this.runProgram(program, inputs);
    // console.log(JSON.stringify(r, null, 2));

    return "";
  }

  runProgram(program: string[], inputs: AlgebraicValue[]): AlgebraicRegisters {
    const initialRegisters: AlgebraicRegisters = {
      w: 0,
      x: 0,
      y: 0,
      z: 0,
    };

    const trackingRegisters: AlgebraicRegisters = {
      w: ["S", "w"],
      x: ["S", "x"],
      y: ["S", "y"],
      z: ["S", "z"],
    };

    const queue: State[] = [
      { registers: initialRegisters, inputs, ip: 0, conditions: [] },
    ];

    const outputs: State[] = [];

    while (true) {
      const state = queue.shift();
      if (!state) break;

      const instruction = program[state.ip];
      if (instruction && state && instruction.startsWith("inp ")) {
        console.log("pre-input registers " + JSON.stringify(state.registers));
        state.registers = trackingRegisters; // ugly
      }
      console.log(JSON.stringify({ instruction, state }));

      if (!instruction) {
        outputs.push(state);
        continue;
      }

      const theseInputs = [...state.inputs];
      const nextRegisters = this.runInstruction(
        instruction,
        state.registers,
        theseInputs
      );

      let output = [{ nextRegisters, extraConditions: [] as Condition[] }];

      const tryExpand = (rk: keyof Registers) => {
        output = output.flatMap(o => {
          const v = o.nextRegisters[rk];
          if (isConditionValue(v)) {
            const condition = { ifEquals: v.ifEquals };
            return [
              {
                nextRegisters: { ...o.nextRegisters, [rk]: v.then },
                extraConditions: [condition],
              },
              {
                nextRegisters: { ...o.nextRegisters, [rk]: v.else },
                extraConditions: [{ not: condition }],
              },
            ];
          } else {
            return o;
          }
        });
      };

      tryExpand("w");
      tryExpand("x");
      tryExpand("y");
      tryExpand("z");

      queue.unshift(
        ...output.map(o => {
          const s: State = {
            registers: o.nextRegisters as AlgebraicRegisters,
            inputs: theseInputs,
            ip: state.ip + 1,
            conditions: [...state.conditions, ...o.extraConditions],
          };
          return s;
        })
      );
    }

    // console.log(outputs.length);
    // console.log(JSON.stringify(outputs[0]));
    console.log(JSON.stringify({ outputs }));

    return initialRegisters;
  }

  runInstruction(
    instruction: string,
    registers: AlgebraicRegisters,
    inputs: AlgebraicValue[]
  ): BranchingAlgebraicRegisters {
    // console.log({ instruction, registers });

    let m = instruction.match(/^inp ([wxyz])$/);
    if (m) {
      const target = m[1] as keyof typeof registers;
      const v = inputs.shift();
      if (v === undefined) throw "No more input";
      return { ...registers, [target]: v };
    }

    m = instruction.match(/^(add|mul|div|mod|eql) ([wxyz]) ([wxyz]|-?\d+)$/);
    if (m) {
      const operation = m[1] as keyof typeof operations;
      const target = m[2] as keyof typeof registers;
      let n = parseInt(m[3]) as AlgebraicValue;
      if (isNaN(n as number)) {
        const op = m[3] as keyof typeof registers;
        n = registers[op];
      }
      // console.log(registers[target], n);

      const result: BranchingAlgebraicValue = algebraicOperations[operation](
        registers[target],
        n
      );
      return { ...registers, [target]: result };
    }

    throw "Illegal instruction " + instruction;
  }

  test(): boolean {
    return true;
  }
}

export class Part1BruteForce implements Base.Part {
  calculate(program: string[]): string {
    let n = 99999999999999;

    let t = 0;

    while (true) {
      const modelNumber = n.toString();
      let index = 0;
      const inputter = (): number => {
        if (index >= modelNumber.length) throw "No more input";
        return parseInt(modelNumber[index++]);
      };
      const r = this.runProgram(program, inputter);
      if (r.z === 0) return n.toString();
      const now = new Date().getTime();
      if (now > t) {
        console.log(n);
        t = now + 5000;
      }
      --n;
    }

    return "";
  }

  runProgram(program: string[], inputter: () => number): Registers {
    let registers = {
      w: 0,
      x: 0,
      y: 0,
      z: 0,
    };

    for (const instruction of program) {
      registers = this.runInstruction(instruction, registers, inputter);
    }

    return registers;
  }

  runInstruction(
    instruction: string,
    registers: Registers,
    inputter: () => number
  ): Registers {
    // console.log({ instruction, registers });

    let m = instruction.match(/^inp ([wxyz])$/);
    if (m) {
      const target = m[1] as keyof typeof registers;
      const n = inputter();
      return { ...registers, [target]: n };
    }

    m = instruction.match(/^(add|mul|div|mod|eql) ([wxyz]) ([wxyz]|-?\d+)$/);
    if (m) {
      const operation = m[1] as keyof typeof operations;
      const target = m[2] as keyof typeof registers;
      let n = parseInt(m[3]);
      if (isNaN(n)) {
        const op = m[3] as keyof typeof registers;
        n = registers[op];
      }
      // console.log(registers[target], n);
      const result = operations[operation](registers[target], n);
      return { ...registers, [target]: result };
    }

    throw "Illegal instruction " + instruction;
  }

  test(): boolean {
    return true;
  }
}

export class Part1Branching implements Base.Part {
  calculate(program: string[]): string {
    const initRegisters = {
      w: 0,
      x: 0,
      y: 0,
      z: 0,
    };

    const queue = [
      {
        registers: initRegisters,
        inputsUsed: "",
        ip: 0,
      },
    ];

    const nullInputter = () => {
      throw { code: "EOF" };
    };

    // const visited = new Set<string>();

    while (true) {
      const state = queue.shift();
      if (!state) break;

      // const key = `${state.registers.w} ${state.registers.x} ${state.registers.y} ${state.registers.z} ${state.ip}`;
      // if (visited.has(key)) {
      //   console.log("seen " + key);
      //   continue;
      // }
      // visited.add(key);

      // console.log(JSON.stringify(state));

      const instruction = program[state.ip];
      if (!instruction) {
        if (state.registers.z === 0) {
          return "found one " + JSON.stringify(state);
        }
        continue;
      }

      try {
        const r = this.runInstruction(
          instruction,
          state.registers,
          nullInputter
        );
        queue.unshift({ ...state, registers: r, ip: state.ip + 1 });
      } catch (e) {
        if (e.code === "EOF") {
          for (let n = 0; n <= 9; ++n) {
            const inputter = () => n;
            const r = this.runInstruction(
              instruction,
              state.registers,
              inputter
            );
            queue.unshift({
              ...state,
              registers: r,
              ip: state.ip + 1,
              inputsUsed: state.inputsUsed + n.toString(),
            });
          }
        } else {
          throw e;
        }
      }
    }

    return "";
  }

  // runProgram(program: string[], inputter: () => number): Registers {
  //   let registers = {
  //     w: 0,
  //     x: 0,
  //     y: 0,
  //     z: 0,
  //   };
  //
  //   for (const instruction of program) {
  //     registers = this.runInstruction(instruction, registers, inputter);
  //   }
  //
  //   return registers;
  // }

  runInstruction(
    instruction: string,
    registers: Registers,
    inputter: () => number
  ): Registers {
    // console.log({ instruction, registers });

    let m = instruction.match(/^inp ([wxyz])$/);
    if (m) {
      const target = m[1] as keyof typeof registers;
      const n = inputter();
      return { ...registers, [target]: n };
    }

    m = instruction.match(/^(add|mul|div|mod|eql) ([wxyz]) ([wxyz]|-?\d+)$/);
    if (m) {
      const operation = m[1] as keyof typeof operations;
      const target = m[2] as keyof typeof registers;
      let n = parseInt(m[3]);
      if (isNaN(n)) {
        const op = m[3] as keyof typeof registers;
        n = registers[op];
      }
      // console.log(registers[target], n);
      const result = operations[operation](registers[target], n);
      return { ...registers, [target]: result };
    }

    throw "Illegal instruction " + instruction;
  }

  test(): boolean {
    return true;
  }
}

export class Part2 extends Part1 {}
