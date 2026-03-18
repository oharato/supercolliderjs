import { SynthDef } from "../SynthDef";
import { SinOsc, Out, mulOp } from "../BasicUGens";
import { Rate } from "../Rate";

describe("SynthDef", () => {
  it("compiles a simple sine wave graph", () => {
    const def = new SynthDef("testSine", (graph) => {
      const freq = graph.addControl("freq", 440, Rate.KR);
      const amp = graph.addControl("amp", 0.1, Rate.KR);
      
      const osc = SinOsc.ar(freq);
      const outSignal = mulOp(osc, amp);
      
      Out.ar(0, outSignal);
    });

    expect(def.graph.name).toBe("testSine");
    expect(def.graph.controls.length).toBe(2);
    expect(def.graph.ugens.length).toBe(3); // SinOsc, BinaryOpUGen(Mul), Out

    const buffer = def.compile();
    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.slice(0, 4).toString("ascii")).toBe("SCgf");
  });
});
