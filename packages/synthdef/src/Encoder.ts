import { Graph } from "./Graph";
import { UGen } from "./UGen";
import { Constant } from "./Constant";
import { Control } from "./Control";
import { ControlUGen } from "./BasicUGens";

export class Encoder {
  graph: Graph;
  buffer: Buffer;
  offset: number;

  constructor(graph: Graph) {
    this.graph = graph;
    this.buffer = Buffer.alloc(1024 * 64); // Allocate a chunk, resize if needed.
    this.offset = 0;
  }

  ensureCapacity(size: number) {
    if (this.offset + size > this.buffer.length) {
      const newBuffer = Buffer.alloc(this.buffer.length * 2);
      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
    }
  }

  writeInt8(value: number) {
    this.ensureCapacity(1);
    this.buffer.writeInt8(value, this.offset);
    this.offset += 1;
  }

  writeInt16(value: number) {
    this.ensureCapacity(2);
    this.buffer.writeInt16BE(value, this.offset);
    this.offset += 2;
  }

  writeInt32(value: number) {
    this.ensureCapacity(4);
    this.buffer.writeInt32BE(value, this.offset);
    this.offset += 4;
  }

  writeFloat32(value: number) {
    this.ensureCapacity(4);
    this.buffer.writeFloatBE(value, this.offset);
    this.offset += 4;
  }

  writeString(value: string) {
    this.ensureCapacity(value.length);
    this.buffer.write(value, this.offset, value.length, "ascii");
    this.offset += value.length;
  }

  writePString(value: string) {
    this.writeInt8(value.length);
    this.writeString(value);
  }

  encode(): Buffer {
    this.offset = 0;

    // SCgf magic
    this.writeString("SCgf");
    // version 2
    this.writeInt32(2);
    // 1 synthdef
    this.writeInt16(1);

    // synthdef name
    this.writePString(this.graph.name);

    // constants
    this.writeInt32(this.graph.constants.length);
    for (const c of this.graph.constants) {
      this.writeFloat32(c.value);
    }

    // Controls
    // We must map Graph controls into a Control UGen at the start.
    const hasControls = this.graph.controls.length > 0;
    
    // params (initial values)
    this.writeInt32(this.graph.controls.length);
    for (const c of this.graph.controls) {
      this.writeFloat32(c.defaultValue);
    }

    // param names
    this.writeInt32(this.graph.controls.length);
    for (const c of this.graph.controls) {
      this.writePString(c.name);
      this.writeInt32(c.index);
    }

    // If there are controls, we prepend a Control UGen
    let ugenList = [...this.graph.ugens];
    let controlUgen: ControlUGen | undefined;
    if (hasControls) {
       // Get rate of first control. Usually they are KR.
       controlUgen = new ControlUGen(this.graph.controls[0].rate, this.graph.controls.length);
       ugenList.unshift(controlUgen);
    }

    // ugens
    this.writeInt32(ugenList.length);
    for (let i = 0; i < ugenList.length; i++) {
      const u = ugenList[i];
      this.writePString(u.name);
      this.writeInt8(u.rate);
      this.writeInt32(u.inputs.length);
      this.writeInt32(u.outputs.length);
      this.writeInt16(u.specialIndex);

      // inputs
      for (const input of u.inputs) {
        if (input instanceof Constant) {
          const cIndex = this.graph.constants.indexOf(input);
          this.writeInt32(-1);
          this.writeInt32(cIndex);
        } else if (input instanceof Control) {
           // Output comes from the control UGen
           if (!controlUgen) throw new Error("Control UGen not found");
           const ugenIndex = ugenList.indexOf(controlUgen);
           this.writeInt32(ugenIndex);
           this.writeInt32(input.index);
        } else if (input instanceof UGen) {
          const uIndex = ugenList.indexOf(input);
          if (uIndex === -1) throw new Error("UGen not in graph");
          this.writeInt32(uIndex);
          // Assuming single output for now, or finding output index
          // TODO: handle multiple outputs
          this.writeInt32(0);
        }
      }

      // outputs
      for (const outRate of u.outputs) {
        this.writeInt8(outRate);
      }
    }

    // variants
    this.writeInt16(0);

    return this.buffer.slice(0, this.offset);
  }
}
