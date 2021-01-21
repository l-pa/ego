import type Node from "./Node";
import type { EdgeDataDefinition, ElementDefinition } from "cytoscape";

export default class Edge implements ElementDefinition {
  public Id: string | number;
  public NodeA: Node;
  public NodeB: Node;
  public Weight: number = 1;

  data: EdgeDataDefinition;
  classes = "";

  constructor(nodeA: Node, nodeB: Node, id: string | number, weight?: number) {
    this.NodeA = nodeA;
    this.NodeB = nodeB;
    this.Id = id;

    this.data = {
      source: this.NodeA.Id,
      target: this.NodeB.Id,
      edgeType: "",
    };

    if (weight) {
      this.Weight = weight;
    }
  }

  public PlainObject(): ElementDefinition {
    return Object.assign({}, this);
  }

  public UpdateClasses() {
    const source: number = this.NodeA.isProminent();
    const target: number = this.NodeB.isProminent();

    console.log(this.NodeA, source, this.NodeB, target);
    
    if (source === 0 && target === 0) {
      // this.classes = "sptosp";
      this.data.edgeType = "sptosp";
    }

    if (source === 1 && target === 1) {
      // this.classes = "wptowp";
      this.data.edgeType = "wptowp";
    }

    if (source === -1 && target === -1) {
      // this.classes = "nptonp";      
      this.data.edgeType = "nptonp";
    }

    if ((source === 0 && target === 1) || (source === 1 && target === 0)) {
      // this.classes = "sptowp";
      this.data.edgeType = "sptowp";
    }

    if ((source === 0 && target === -1) || (source === -1 && target === 0)) {
      // this.classes = "sptonp";
      this.data.edgeType = "sptonp";
    }

    if ((source === 1 && target === -1) || (source === -1 && target === 1)) {
      // this.classes = "wptonp";
      this.data.edgeType = "wptonp";
    }    
  }

}
