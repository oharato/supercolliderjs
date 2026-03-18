import { Rate } from "./Rate";
import { UGen } from "./UGen";
import { Constant } from "./Constant";
import { Control } from "./Control";

export class Graph {
  name: string;
  constants: Constant[] = [];
  controls: Control[] = [];
  ugens: UGen[] = [];

  constructor(name: string) {
    this.name = name;
  }

  addConstant(value: number): Constant {
    let c = this.constants.find((ct) => ct.value === value);
    if (!c) {
      c = new Constant(value);
      this.constants.push(c);
    }
    return c;
  }

  addControl(name: string, defaultValue: number, rate: Rate = Rate.KR): Control {
    let c = this.controls.find((ct) => ct.name === name);
    if (!c) {
      c = new Control(rate, name, defaultValue, this.controls.length);
      this.controls.push(c);
    }
    return c;
  }

  addUGen(ugen: UGen) {
    this.ugens.push(ugen);
  }

  sort() {
    const sorted: UGen[] = [];
    const visited = new Set<UGen>();
    const visiting = new Set<UGen>();

    const visit = (ugen: UGen) => {
      if (visited.has(ugen)) return;
      if (visiting.has(ugen)) throw new Error(`Cyclic dependency detected in SynthDef graph involving ${ugen.name}`);

      visiting.add(ugen);
      for (const input of ugen.inputs) {
        if (input instanceof UGen) {
          visit(input);
        }
      }
      visiting.delete(ugen);
      visited.add(ugen);
      sorted.push(ugen);
    };

    // controls also are represented by Control UGens under the hood, but in the scsyndef format,
    // we need a Control UGen at the start if controls exist.
    // However, for the simple graph, we just sort the UGens we have.
    for (const ugen of this.ugens) {
      visit(ugen);
    }
    this.ugens = sorted;
  }
}
