import { Graph } from "./Graph";
import { Builder } from "./Builder";
import { Encoder } from "./Encoder";

export class SynthDef {
  graph: Graph;

  constructor(name: string, buildFunc: (graph: Graph) => void) {
    this.graph = new Graph(name);
    
    // Set builder context
    const previous = Builder.activeGraph;
    Builder.activeGraph = this.graph;
    
    try {
      buildFunc(this.graph);
    } finally {
      Builder.activeGraph = previous;
    }

    this.graph.sort();
  }

  compile(): Buffer {
    const encoder = new Encoder(this.graph);
    return encoder.encode();
  }
}
