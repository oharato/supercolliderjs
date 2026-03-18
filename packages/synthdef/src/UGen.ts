import { Rate } from "./Rate";
import { Constant } from "./Constant";
import { Control } from "./Control";
import { Builder } from "./Builder";

export type Input = number | Constant | Control | UGen;

export class UGen {
  name: string;
  rate: Rate;
  inputs: (Constant | Control | UGen)[];
  outputs: Rate[];
  specialIndex: number;
  
  constructor(name: string, rate: Rate, inputs: Input[], outputs: Rate[] = [rate], specialIndex: number = 0, addToGraph: boolean = true) {
    this.name = name;
    this.rate = rate;
    this.outputs = outputs;
    this.specialIndex = specialIndex;
    this.inputs = inputs.map(i => typeof i === "number" ? Builder.current.addConstant(i) : i);
    
    if (addToGraph) {
      Builder.current.addUGen(this);
    }
  }
}
