import { Graph } from "./Graph";

export class Builder {
  static activeGraph: Graph | null = null;

  static get current(): Graph {
    if (!this.activeGraph) {
      throw new Error("No active SynthDef Graph builder context.");
    }
    return this.activeGraph;
  }
}
