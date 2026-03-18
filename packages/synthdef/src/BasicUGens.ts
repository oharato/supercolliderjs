import { Rate } from "./Rate";
import { UGen, Input } from "./UGen";

export class MulAdd extends UGen {
  constructor(inVal: Input, mul: Input, add: Input) {
    const rate = inVal instanceof UGen ? inVal.rate : Rate.IR;
    super("MulAdd", rate, [inVal, mul, add], [rate]);
  }
}

export function mulAdd(inVal: Input, mul: Input, add: Input): Input {
  if (mul === 1 && add === 0) return inVal;
  if (mul === 1) return addOp(inVal, add);
  if (add === 0) return mulOp(inVal, mul);
  return new MulAdd(inVal, mul, add);
}

export class BinaryOpUGen extends UGen {
  constructor(specialIndex: number, a: Input, b: Input) {
    const rateA = a instanceof UGen ? a.rate : (a as any).rate || Rate.IR;
    const rateB = b instanceof UGen ? b.rate : (b as any).rate || Rate.IR;
    const maxRate = Math.max(rateA, rateB);
    super("BinaryOpUGen", maxRate, [a, b], [maxRate], specialIndex);
  }
}

export function addOp(a: Input, b: Input): Input {
  if (typeof a === "number" && typeof b === "number") return a + b;
  return new BinaryOpUGen(0, a, b);
}

export function mulOp(a: Input, b: Input): Input {
  if (typeof a === "number" && typeof b === "number") return a * b;
  return new BinaryOpUGen(2, a, b);
}

export class SinOsc extends UGen {
  static ar(freq: Input = 440, phase: Input = 0, mul: Input = 1, add: Input = 0): Input {
    const osc = new SinOsc("SinOsc", Rate.AR, [freq, phase]);
    return mulAdd(osc, mul, add);
  }

  static kr(freq: Input = 440, phase: Input = 0, mul: Input = 1, add: Input = 0): Input {
    const osc = new SinOsc("SinOsc", Rate.KR, [freq, phase]);
    return mulAdd(osc, mul, add);
  }
}

export class Out extends UGen {
  static ar(bus: Input, channelsArray: Input | Input[]): UGen {
    const channels = Array.isArray(channelsArray) ? channelsArray : [channelsArray];
    return new Out("Out", Rate.AR, [bus, ...channels], []);
  }

  static kr(bus: Input, channelsArray: Input | Input[]): UGen {
    const channels = Array.isArray(channelsArray) ? channelsArray : [channelsArray];
    return new Out("Out", Rate.KR, [bus, ...channels], []);
  }
}

// The internal UGen to represent the controls block.
export class ControlUGen extends UGen {
  constructor(rate: Rate, numOutputs: number) {
    super("Control", rate, [], Array(numOutputs).fill(rate), 0, false);
  }
}
